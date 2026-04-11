import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, otp, action } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Handle Resend Action
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
        subject: 'New Verification Code - 9 Nutzz Millets',
        html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #1a5d1a; text-align: center;">New Verification Code</h2>
          <p>Hello,</p>
          <p>You requested a new verification code. Please use the following 6-digit OTP to complete your registration:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <h1 style="letter-spacing: 5px; color: #d4a017; font-size: 32px; margin: 0;">${newOtp}</h1>
          </div>
          <p>This code is valid for **5 minutes**.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">Eat Healthy. Live Strong.</p>
        </div>
        `,
      });

      // Debug
      const fs = require('fs');
      fs.writeFileSync('otp_debug.txt', `🔑 RESENT OTP for ${email}: ${newOtp}\nDate: ${new Date().toLocaleString()}\n`);

      return NextResponse.json({ message: 'New OTP sent to email' });
    }

    // Handle Verification
    if (!otp) {
      return NextResponse.json({ message: 'OTP is required' }, { status: 400 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'User already verified' }, { status: 400 });
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

    return NextResponse.json({ message: 'Email verified successfully! You can now login.' });

  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
