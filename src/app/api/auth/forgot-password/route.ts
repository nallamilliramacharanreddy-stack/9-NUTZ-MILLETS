import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import { rateLimit, schemas, securityResponse } from '@/lib/security';

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting (Relaxed for development testing)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!rateLimit(ip, 50, 1 * 60 * 1000)) { 
      return securityResponse('Too many requests. Please wait a minute and try again.', 429);
    }

    // 2. Input Validation (Zod)
    const body = await req.json();
    const validation = schemas.forgotPassword.safeParse(body);
    
    if (!validation.success) {
      return securityResponse('Invalid email address', 400);
    }

    const { email } = validation.data;

    await connectDB();

    // 3. User Lookup
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't confirm if user exists or not (User Enumeration Prevention)
      return NextResponse.json({ message: 'If an account exists, an OTP will be sent.' }, { status: 200 });
    }

    // 4. Generate & Save secure OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpire = new Date(Date.now() + 180000); // 3 minutes

    user.resetPasswordToken = otp;
    user.resetPasswordExpire = resetExpire;
    await user.save();

    // Development Hack: Also save OTP to physical file so it's readable if internet/nodemailer is failing
    try {
      const fs = require('fs');
      fs.writeFileSync('otp_debug.txt', `🔑 OTP for ${email}: ${otp}\nDate: ${new Date().toLocaleString()}\n`);
    } catch(err) {}

    // 5. Send Email via Secure Transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"9 Nutzz Millets" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP - 9 Nutzz Millets',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #1a5d1a; text-align: center;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Please use the following 6-digit OTP code to proceed:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <h1 style="letter-spacing: 5px; color: #d4a017; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP is valid for **3 minutes**.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">Health is Wealth. 9 Nutzz Millets.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError: any) {
      console.error('❌ Failed to send email:', mailError.message);
      // In production, you might want to log this to a service like Sentry
    }

    return NextResponse.json({ 
      message: 'If an account exists, an OTP will be sent.',
    }, { status: 200 });

  } catch (error: any) {
    console.error('Forgot password error:', error.message);
    return securityResponse('An unexpected error occurred', 500);
  }
}
