import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      isVerified: true, // Auto-verify new users as requested
      verificationOTP: otp,
      verificationOTPExpire: otpExpire,
    });

    // Send OTP Email
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
      subject: 'Verify Your Email - 9 Nutzz Millets',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #1a5d1a; text-align: center;">Welcome to 9 Nutzz Millets!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for joining us. To complete your registration and start shopping, please verify your email address using this 6-digit OTP:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <h1 style="letter-spacing: 5px; color: #d4a017; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This code is valid for **5 minutes**. If you didn't create an account, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">Healthy Body. Happy Mind.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      // Debug file for local development
      const fs = require('fs');
      fs.writeFileSync('otp_debug.txt', `🔑 REGISTRATION OTP for ${email}: ${otp}\nDate: ${new Date().toLocaleString()}\n`);
    } catch (mailError) {
      console.error('Email sending failed:', mailError);
    }

    return NextResponse.json({ 
      message: 'Registration successful! You can now log in to your account.', 
      email 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
