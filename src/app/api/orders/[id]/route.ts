import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import DirectOrder from '@/models/Order';
import { verifyAccessToken } from '@/lib/jwt';
import { securityResponse } from '@/lib/security';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params since Next.js 16 requires it for app-router dynamic routes
    const { id } = await params;
    
    // Authorization Check
    const token = req.cookies.get('accessToken')?.value;
    const decoded = token ? verifyAccessToken(token) : null;

    if (!decoded || decoded.role !== 'admin') {
      return securityResponse('Forbidden: Admin access only', 403);
    }

    const body = await req.json();
    const { status } = body;

    if (status !== 'delivered') {
      return NextResponse.json({ message: 'Invalid status update' }, { status: 400 });
    }

    await connectDB();

    const order = await DirectOrder.findById(id);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    order.status = 'delivered';
    order.payment.status = 'completed';
    
    await order.save();

    return NextResponse.json({ message: 'Order marked as delivered successfully', order }, { status: 200 });

  } catch (error: any) {
    console.error('Order Update API Error:', error.message);
    return securityResponse('Internal Server Error', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Authorization Check
    const token = req.cookies.get('accessToken')?.value;
    const decoded = token ? verifyAccessToken(token) : null;

    if (!decoded || decoded.role !== 'admin') {
      return securityResponse('Forbidden: Admin access only', 403);
    }

    await connectDB();

    const order = await DirectOrder.findByIdAndDelete(id);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Order Deletion API Error:', error.message);
    return securityResponse('Internal Server Error', 500);
  }
}
