import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DirectOrder from '@/models/Order';
import { rateLimit, securityResponse, logSecurityEvent } from '@/lib/security';

export async function GET(req: Request) {
  try {
    await connectDB();
    const orders = await DirectOrder.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders);
  } catch (error: any) {
    const message = error.message?.includes("connect") || error.message?.includes("timeout")
      ? "Database connection failed. Please check Atlas IP Whitelist."
      : "Failed to fetch orders";
    return securityResponse(message, 500);
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    // ✅ Rate limit (optional but recommended)
    if (!rateLimit(ip, 50, 60 * 1000)) {
      return securityResponse('Too many requests', 429);
    }

    const body = await req.json();
    const { customer, product, orderItems, payment, totalPrice, shippingPrice } = body;

    // ✅ Validation
    if (!customer || !customer.name || !customer.phone || !customer.address || !customer.pincode) {
      return NextResponse.json(
        { message: 'Missing required customer information (Name, Phone, Address, and Pincode are mandatory)' },
        { status: 400 }
      );
    }

    // ✅ Normalize items
    let finalItems: any[] = [];

    if (orderItems && Array.isArray(orderItems)) {
      finalItems = orderItems.map((item: any) => ({
        id: item.id || item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || item.images?.[0] || '',
      }));
    } else if (product?.id) {
      finalItems = [
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: product.quantity || 1,
          image: product.image || '',
        },
      ];
    }

    if (finalItems.length === 0) {
      return NextResponse.json(
        { message: 'No items found in order' },
        { status: 400 }
      );
    }

    await connectDB();

    // ✅ Order ID
    const orderId = `DORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await DirectOrder.create({
      orderId,
      customer,
      items: finalItems,
      payment: {
        method: payment?.method || 'cod',
        status: 'pending',
        totalAmount:
          totalPrice ||
          finalItems.reduce((sum, i) => sum + i.price * i.quantity, 0) +
          (shippingPrice || 0),
      },
      status: 'pending',
    });

    // Log Security Event
    await logSecurityEvent({
      event: 'ORDER_PLACED',
      severity: 'INFO',
      ip,
      metadata: { orderId: order.orderId, total: order.payment.totalAmount }
    });

    return NextResponse.json(
      {
        message: 'Order placed successfully',
        orderId: order.orderId,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Order API Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);

      return NextResponse.json(
        { message: 'Invalid order data: ' + messages.join(', ') },
        { status: 400 }
      );
    }

    const message = error.message?.includes("connect") || error.message?.includes("timeout")
      ? "Database connection failed. Please check Atlas IP Whitelist."
      : "Failed to save order to database. Please try again.";

    return NextResponse.json(
      {
        message,
        details: error.message,
      },
      { status: 500 }
    );
  }
}
