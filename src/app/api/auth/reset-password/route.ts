import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { rateLimit, schemas, securityResponse, logSecurityEvent } from '@/lib/security';

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!rateLimit(ip, 5, 15 * 60 * 1000)) { // 5 attempts per 15 mins
      return securityResponse('Too many reset attempts. Please try again later.', 429);
    }

    // 2. Input Validation (Zod)
    const body = await req.json();
    const validation = schemas.resetPassword.safeParse(body);
    
    if (!validation.success) {
      return securityResponse('Invalid reset data provided', 400);
    }

    const { email, otp, newPassword } = validation.data;

    await connectDB();

    // 3. Secure lookup with composite primary keys
    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) {
      return securityResponse('Invalid or expired OTP', 401);
    }

    // 4. Secure Password Update
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    
    // Clear security tokens immediately after use
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    // 5. Log Security Event
    await logSecurityEvent({
      event: 'PASSWORD_RESET_SUCCESS',
      severity: 'INFO',
      ip,
      userId: user._id.toString(),
      metadata: { email: user.email }
    });

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Reset password error:', error.message);
    return securityResponse('An unexpected error occurred', 500);
  }
}
