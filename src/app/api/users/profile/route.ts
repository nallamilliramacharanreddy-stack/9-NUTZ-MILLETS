import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/jwt';
import { rateLimit, schemas, securityResponse, logSecurityEvent } from '@/lib/security';

export async function PATCH(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  
  try {
    // 1. Authentication
    const token = req.cookies.get('accessToken')?.value;
    if (!token) {
      return securityResponse('Authentication required', 401);
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return securityResponse('Invalid or expired session', 401);
    }

    // 2. Rate Limiting
    if (!rateLimit(ip, 20, 1 * 60 * 1000)) {
      return securityResponse('Too many profile updates. Please wait.', 429);
    }

    // 3. Input Validation
    const body = await req.json();
    const validation = schemas.profileUpdate.safeParse(body);
    
    if (!validation.success) {
      return securityResponse(validation.error.errors[0]?.message || 'Invalid input', 400);
    }

    const { name, phone } = validation.data;

    // 4. Database Update
    await connectDB();
    const user = await User.findById(decoded.id);

    if (!user) {
      return securityResponse('User not found', 404);
    }

    // Update fields
    user.name = name;
    user.phone = phone;

    await user.save();

    await logSecurityEvent({
      event: 'PROFILE_UPDATED',
      severity: 'INFO',
      ip,
      userId: user._id.toString(),
      metadata: { name, phone }
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Profile Update Error:', error.message);
    return securityResponse('An unexpected error occurred', 500);
  }
}
