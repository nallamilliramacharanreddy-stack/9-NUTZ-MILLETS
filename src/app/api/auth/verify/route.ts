import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import { logSecurityEvent } from '@/lib/security';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, action, type = 'registration' } = body;
    const normalizedEmail = email?.toLowerCase();

    console.log('📬 AUTH-VERIFY REQUEST:', { email: normalizedEmail, type, action });

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // RESEND LOGIC
    if (action === 'resend') {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const newExpire = new Date(Date.now() + 5 * 60 * 1000);

      user.verificationOTP = newOtp;
      user.verificationOTPExpire = newExpire;
      await user.save();

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"9 Nutzz Millets" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'New Verification Code',
        html: `<p>Your code is: <strong>${newOtp}</strong></p>`,
      });

      return NextResponse.json({ message: 'New OTP sent' });
    }

    // VERIFICATION LOGIC
    if (!otp) {
      return NextResponse.json({ message: 'OTP required' }, { status: 400 });
    }

    if (type === 'reset') {
      if (user.resetPasswordToken !== otp) {
        return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
      }
      if (new Date() > new Date(user.resetPasswordExpire)) {
        return NextResponse.json({ message: 'OTP expired' }, { status: 400 });
      }
      return NextResponse.json({ message: 'Verified' });
    } else {
      if (user.isVerified) {
        return NextResponse.json({ message: 'Already verified' }, { status: 400 });
      }
      if (user.verificationOTP !== otp) {
        return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
      }
      if (new Date() > new Date(user.verificationOTPExpire)) {
        return NextResponse.json({ message: 'OTP expired' }, { status: 400 });
      }

      user.isVerified = true;
      user.verificationOTP = undefined;
      user.verificationOTPExpire = undefined;
      await user.save();

      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      await logSecurityEvent({
        event: 'EMAIL_VERIFIED_SUCCESS',
        severity: 'INFO',
        ip,
        userId: user._id.toString(),
        metadata: { email: user.email }
      });

      return NextResponse.json({ message: 'Verified successfully' });
    }
  } catch (error: any) {
    console.error('Verify API Error:', error.message);
    const message = error.message?.includes("connect") ? "Database connection failed" : "Internal Error";
    return NextResponse.json({ message, error: error.message }, { status: 500 });
  }
}
