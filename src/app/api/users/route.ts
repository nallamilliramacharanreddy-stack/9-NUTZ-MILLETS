import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/jwt';
import { securityResponse } from '@/lib/security';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('accessToken')?.value;
    const decoded = token ? verifyAccessToken(token) : null;

    if (!decoded || decoded.role !== 'admin') {
      return securityResponse('Forbidden: Admin access only', 403);
    }

    await connectDB();
    
    // Lean execution for performance and explicit exclusion of strictly secure fields
    const users = await User.find({}, '-password -refreshTokens -resetPasswordToken').sort({ createdAt: -1 }).lean();
    
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Failed to fetch users:', error);
    return securityResponse('Failed to fetch users', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('accessToken')?.value;
    const decoded = token ? verifyAccessToken(token) : null;

    if (!decoded || decoded.role !== 'admin') {
      return securityResponse('Forbidden: Admin access only', 403);
    }

    const { name, email, password, phone, role } = await req.json();

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'A user with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'user'
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('User Creation API Error:', error.message);
    return securityResponse('Internal Server Error', 500);
  }
}
