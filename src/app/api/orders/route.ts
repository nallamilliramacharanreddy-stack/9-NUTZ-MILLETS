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
  
    const body = await req.json();
    const { customer, product, orderItems, payment, totalPrice, shippingPrice } = body;

    // 2. Comprehensive Validation
    if (!customer || !customer.name || !customer.phone || !customer.address) {
       return NextResponse.json({ message: 'Missing required customer information' }, { status: 400 });
    }

    // Adapt both single-product and multi-item cart structures into the unified 'items' array
    let finalItems = [];
    if (orderItems && Array.isArray(orderItems)) {
      finalItems = orderItems.map((item: any) => ({
        id: item.id || item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || item.images?.[0] || ''
      }));
    } else if (product?.id) {
      finalItems = [{
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.quantity || 1,
        image: product.image || ''
      }];
    }

    if (finalItems.length === 0) {
       return NextResponse.json({ message: 'No items found in order' }, { status: 400 });
    }

    await connectDB();

    // Generate unique internal Order ID
    const orderId = `DORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await DirectOrder.create({
      orderId,
      customer,
      items: finalItems,
      payment: {
        method: payment?.method || 'cod',
        status: 'pending',
        totalAmount: totalPrice || finalItems.reduce((sum, i) => sum + (i.price * i.quantity), 0) + (shippingPrice || 0)
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
