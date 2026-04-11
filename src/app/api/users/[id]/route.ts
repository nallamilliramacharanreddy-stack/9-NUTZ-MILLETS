import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/jwt';
import { securityResponse } from '@/lib/security';

// Verify Admin Helper
const verifyAdmin = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const decoded = token ? verifyAccessToken(token) : null;
  if (!decoded || decoded.role !== 'admin') {
    return false;
  }
  return true;
};

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdmin())) return securityResponse('Forbidden: Admin access only', 403);
    
    // Await params since Next.js 16 requires it for app-router dynamic routes
    const { id } = await params;
    
    await connectDB();
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete User API Error:', error);
    return securityResponse('Internal Server Error', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdmin())) return securityResponse('Forbidden: Admin access only', 403);
    
    const { id } = await params;
    const body = await req.json();
    
    await connectDB();
    
    // Protect against modifying critical admin (Hardcoded fail-safe)
    const targetUser = await User.findById(id);
    if (!targetUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    if (targetUser.email === '9NUTZMILLETSGMD@gmail.com') {
      return securityResponse('Master admin account cannot be modified', 403);
    }
    
    // Only allow specific updates
    if (body.name) targetUser.name = body.name;
    if (body.email) targetUser.email = body.email;
    if (body.phone) targetUser.phone = body.phone;
    if (body.role && ['user', 'admin'].includes(body.role)) targetUser.role = body.role;
    
    await targetUser.save();

    return NextResponse.json({ 
      message: 'User updated successfully',
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        phone: targetUser.phone,
        role: targetUser.role
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Edit User API Error:', error);
    return securityResponse('Internal Server Error', 500);
  }
}
