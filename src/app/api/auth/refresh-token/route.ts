import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyRefreshToken, signAccessToken, signRefreshToken, hashToken } from '@/lib/jwt';
import { securityResponse, logSecurityEvent } from '@/lib/security';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return securityResponse('Refresh token missing', 401);
    }

    // 1. Verify token signature and expiry
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return securityResponse('Invalid or expired refresh token', 403);
    }

    await connectDB();
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens) {
      return securityResponse('Invalid session', 403);
    }

    const hashedToken = hashToken(refreshToken);
    const tokenIndex = (user.refreshTokens || []).findIndex((rt: { token: string }) => rt.token === hashedToken);

    // 2. TOKEN REUSE DETECTION (CRITICAL SECURITY)
    // If the token is NOT in the active list, it means it's an OLD token that was already used (rotated).
    // This indicates an attacker has intercepted an old token and is trying to reuse it.
    if (tokenIndex === -1) {
      // Detected reuse - REVOKE ALL SESSIONS for this user as a safety measure
      user.refreshTokens = [];
      await user.save();
      
      await logSecurityEvent({
        event: 'REFRESH_TOKEN_REUSE_DETECTED',
        severity: 'CRITICAL',
        ip,
        userId: user._id.toString(),
        metadata: { info: 'All sessions revoked due to reuse detection' }
      });
      
      const response = securityResponse('Security compromise detected. All sessions revoked. Please login again.', 403);
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }

    // 3. ROTATE TOKEN (Valid token used)
    // Delete the old token and issue a BRAND NEW pair
    user.refreshTokens.splice(tokenIndex, 1);

    const newAccessToken = signAccessToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    });

    const newRefreshToken = signRefreshToken({ id: user._id.toString() });
    
    // Store the new rotated token
    user.refreshTokens.push({
      token: hashToken(newRefreshToken),
      deviceId: req.headers.get('user-agent') || 'unknown',
      createdAt: new Date()
    });

    await user.save();

    const response = NextResponse.json({ message: 'Tokens refreshed' }, { status: 200 });

    // Set Access Token (15m)
    response.cookies.set({
      name: 'accessToken',
      value: newAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/',
    });

    // Set Refresh Token (7d)
    response.cookies.set({
      name: 'refreshToken',
      value: newRefreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/api/auth/refresh-token',
    });

    return response;
  } catch (error: any) {
    console.error('Refresh Token Error:', error.message);
    return securityResponse('Internal server error during refresh', 500);
  }
}
