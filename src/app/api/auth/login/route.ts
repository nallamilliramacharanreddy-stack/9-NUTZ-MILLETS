import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signAccessToken, signRefreshToken, hashToken } from '@/lib/jwt';
import { rateLimit, schemas, securityResponse, logSecurityEvent } from '@/lib/security';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  
  try {
    // 1. Rate Limiting (Relaxed for development testing)
    if (!rateLimit(ip, 50, 1 * 60 * 1000)) { 
      return securityResponse('Too many requests. Please wait a minute and try again.', 429);
    }

    // 2. Input Validation
    const body = await req.json();
    const validation = schemas.login.safeParse(body);
    
    if (!validation.success) {
      return securityResponse('Invalid input provided', 400);
    }

    const { email, password } = validation.data;

    if (email === 'admin@9nutzz.com') {
      await logSecurityEvent({ event: 'LOGIN_BLOCKED_LEGACY_ADMIN', severity: 'WARN', ip, metadata: { email } });
      return securityResponse('Login with this email is no longer permitted.', 403);
    }

    await connectDB();

    // 3. User Lookup & Lockout Verification
    const user = await User.findOne({ email });
    if (!user) {
      await logSecurityEvent({ event: 'LOGIN_FAILURE_UNKNOWN_USER', severity: 'WARN', ip, metadata: { email } });
      return securityResponse('Invalid email or password', 401);
    }

    // AUTO-VERIFY MASTER ADMIN
    if (user.email === '9NUTZMILLETSGMD@gmail.com' && !user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    // CHECK VERIFICATION STATUS
    if (!user.isVerified) {
      return NextResponse.json({ 
        message: 'Account not verified. Please check your email for the OTP.',
        needsVerification: true,
        email: user.email
      }, { status: 403 });
    }

    // Check if account is currently locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      await logSecurityEvent({ event: 'LOGIN_ATTEMPT_LOCKED_ACCOUNT', severity: 'WARN', ip, userId: user._id.toString() });
      return securityResponse(`Account is locked. Please try again in ${remainingTime} minutes.`, 403);
    }

    // 4. Password Verification
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      // Increment failed attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      if (user.loginAttempts >= 3) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minute lock
        user.loginAttempts = 0; // Reset counter for next attempt after lock
        await logSecurityEvent({ event: 'ACCOUNT_LOCKED', severity: 'CRITICAL', ip, userId: user._id.toString() });
      }
      
      await user.save();
      await logSecurityEvent({ event: 'LOGIN_FAILURE', severity: 'WARN', ip, userId: user._id.toString(), metadata: { attempts: user.loginAttempts } });
      return securityResponse('Invalid email or password', 401);
    }

    // 5. Success - Reset Attempts & Enforce Single Admin Rule
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    
    if (user.role === 'admin' && user.email !== '9NUTZMILLETSGMD@gmail.com') {
      user.role = 'user';
    }

    // 6. Generate Dual Tokens (RTR System)
    const accessToken = signAccessToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    });

    const refreshToken = signRefreshToken({ id: user._id.toString() });
    
    // Store hashed refresh token in DB
    const hashedRT = hashToken(refreshToken);
    if (!user.refreshTokens) user.refreshTokens = [];
    
    // Only allow max 5 active devices/sessions
    if (user.refreshTokens.length >= 5) {
      user.refreshTokens.shift(); 
    }
    
    user.refreshTokens.push({
      token: hashedRT,
      deviceId: req.headers.get('user-agent') || 'unknown',
      createdAt: new Date()
    });

    await user.save();
    await logSecurityEvent({ event: 'LOGIN_SUCCESS', severity: 'INFO', ip, userId: user._id.toString() });

    // 7. Set Secure HttpOnly Cookies
    const response = NextResponse.json(
      { 
        message: 'Login successful', 
        user: { name: user.name, email: user.email, role: user.role } 
      }, 
      { status: 200 }
    );

    // Access Token (Short-lived 15m)
    response.cookies.set({
      name: 'accessToken',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, 
      path: '/',
    });

    // Refresh Token (Long-lived 7d)
    response.cookies.set({
      name: 'refreshToken',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/api/auth/refresh-token', // Only sent to refresh endpoint
    });

    return response;
  } catch (error: any) {
    console.error('Login Error:', error.message);
    await logSecurityEvent({ event: 'LOGIN_CRITICAL_ERROR', severity: 'CRITICAL', ip, metadata: { error: error.message } });
    return securityResponse('An unexpected error occurred', 500);
  }
}
