import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import { rateLimit, schemas, securityResponse } from '@/lib/security';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    if (!rateLimit(ip, 50, 1 * 60 * 1000)) {
      return securityResponse('Too many requests', 429);
    }

    const body = await req.json();
    const validation = schemas.forgotPassword.safeParse(body);

    if (!validation.success) {
      return securityResponse('Invalid email', 400);
    }

    const { email } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[AUTH-OTP] Request for: "${email}" -> Normalized: "${normalizedEmail}"`);

    await connectDB();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log(`[AUTH-OTP] FAILED: User "${normalizedEmail}" not found in database.`);
      return NextResponse.json(
        { message: 'If account exists, OTP sent' },
        { status: 200 }
      );
    }
    console.log(`[AUTH-OTP] SUCCESS: User found. Generating OTP...`);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordToken = otp;
    user.resetPasswordExpire = new Date(Date.now() + 3 * 60 * 1000);
    await user.save();

    // Mail setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD?.replace(/\s/g, ''),
      },
    });

    // Verify SMTP
    await transporter.verify();

    const mailOptions = {
      from: `"9 Nutzz Millets" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'OTP - Password Reset',
      html: `
        <h2>Password Reset OTP</h2>
        <h1>${otp}</h1>
        <p>Valid for 3 minutes</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'OTP sent successfully' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Forgot Password Error:', error.message);

    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}
