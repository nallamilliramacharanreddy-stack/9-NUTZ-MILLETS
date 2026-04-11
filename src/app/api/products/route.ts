import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { securityResponse } from '@/lib/security';
import { z } from 'zod';

// Example schema (use your existing one if already defined)
const profileSchema = z.object({
  name: z.string(),
  phone: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const validation = profileSchema.safeParse(body);

    // ❌ FIXED: correct Zod error handling (issues instead of errors)
    if (!validation.success) {
      return securityResponse(
        validation.error.issues[0]?.message || 'Invalid input',
        400
      );
    }

    const { name, phone } = validation.data;

    // Example: update user (adjust logic based on your auth system)
    const userId = req.headers.get('user-id'); // or from JWT

    if (!userId) {
      return securityResponse('Unauthorized', 401);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone },
      { new: true }
    );

    if (!user) {
      return securityResponse('User not found', 404);
    }

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Profile Update Error:', error.message);

    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
