import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DirectOrder from '@/models/Order';
import { rateLimit, securityResponse } from '@/lib/security';

export async function GET(req: Request) {
  try {
    await connectDB();
    const orders = await DirectOrder.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders);
  } catch (error: any) {
    return securityResponse('Failed to fetch orders', 500);
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  
  try {
    // 1. Rate Limiting
    if (!rateLimit(ip, 5, 60 * 1000)) { 
      return securityResponse('Too many requests. Please try again later.', 429);
    }

    const body = await req.json();
    const { customer, product, payment } = body;

    // Basic validation
    if (!customer.name || !customer.phone || !customer.address || !product.id) {
       return NextResponse.json({ message: 'Missing required checkout fields' }, { status: 400 });
    }

    await connectDB();

    // Generate unique internal Order ID
    const orderId = `DORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // simplified flow: No online payments, only COD
    const order = await DirectOrder.create({
      orderId,
      customer,
      product,
      payment: {
        ...payment,
        method: 'cod',
        status: 'pending',
      },
      status: 'pending',
    });

    return NextResponse.json({ 
      message: 'Order placed successfully', 
      orderId: order.orderId,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Order API Error:', error);
    
    // Check for Mongoose Validation Error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ 
        message: 'Invalid order data: ' + messages.join(', ') 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Failed to save order to database. Please try again.',
      details: error.message 
    }, { status: 500 });
  }
}
