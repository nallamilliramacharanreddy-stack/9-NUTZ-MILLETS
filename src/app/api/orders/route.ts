import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DirectOrder from '@/models/Order';
import Product from '@/models/Product';
import nodemailer from 'nodemailer';
import { rateLimit, securityResponse, logSecurityEvent } from '@/lib/security';

import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value || req.headers.get('authorization')?.split(' ')[1];
    const decoded = token ? verifyAccessToken(token) : null;

    await connectDB();
    
    let query = {};
    const isAdmin = decoded?.role?.toLowerCase() === 'admin';
    const isUser = !!decoded;

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('orderId')?.toLowerCase() || searchParams.get('phone');

    if (q) {
      // If searching for a specific order (via Track feature), search the entire DB
      query = {
        $or: [
          { orderId: { $regex: `^${q}$`, $options: 'i' } }, // Exact match for orderId
          { "customer.phone": q }
        ]
      };
    } else if (isAdmin) {
      // Admin sees everything when not searching
      query = {};
    } else if (isUser) {
      // User only sees their own profile history
      query = { "customer.email": { $regex: `^${decoded.email}$`, $options: 'i' } };
    } else {
      // NO TOKEN + NO SEARCH = NO DATA
      return NextResponse.json([]);
    }

    const orders = await DirectOrder.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Orders Fetch Error:', error.message);
    return securityResponse("Failed to fetch orders", 500);
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
    if (!customer || !customer.name || !customer.phone || !customer.email || !customer.address || !customer.pincode) {
      return NextResponse.json(
        { message: 'Missing required customer information (Name, Phone, Email, Address, and Pincode are mandatory)' },
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
        totalAmount: finalItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
      },
      status: 'pending',
    });

    // ✅ Send Admin Notification (Email)
    try {
      const itemsSummary = finalItems.map(i => `<li><strong>${i.name}</strong> - Qty: ${i.quantity} (₹${i.price})</li>`).join("");
      
      const adminTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD?.replace(/\s/g, ''),
        },
      });

      const adminMailOptions = {
        from: `"9 Nutzz Millets Order System" <${process.env.EMAIL_USER}>`,
        to: "9NUTZMILLETSGMD@gmail.com, nallamilliramacharanreddy@gmail.com", // Admin notification emails
        subject: `🔔 NEW ORDER PLACED: ${order.orderId}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #1a5d1a; border-radius: 12px;">
            <h2 style="color: #1a5d1a; text-align: center; border-bottom: 2px solid #f4f4f4; padding-bottom: 10px;">New Order Received!</h2>
            
            <div style="background: #fdfaf0; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #d4a017; font-weight: bold; font-size: 14px;">ORDER ID</p>
              <h3 style="margin: 5px 0 0 0; color: #1a5d1a;">#${order.orderId}</h3>
            </div>

            <h4 style="color: #1a5d1a; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Customer Details</h4>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong>Name:</strong> ${customer.name}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${customer.phone}</p>
              <p style="margin: 5px 0;"><strong>Address:</strong> ${customer.address}, ${customer.pincode}</p>
            </div>

            <h4 style="color: #1a5d1a; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Ordered Items</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${itemsSummary}
            </ul>

            <div style="margin-top: 25px; padding-top: 15px; border-top: 2px solid #f4f4f4; text-align: right;">
              <p style="margin: 0; font-size: 18px; color: #1a5d1a; font-weight: bold;">Total Amount: ₹${order.payment.totalAmount}</p>
            </div>

            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_URL}/admin/orders" 
                 style="background: #1a5d1a; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                View Order in Admin Panel
              </a>
            </div>
          </div>
        `,
      };

      await adminTransporter.sendMail(adminMailOptions);
    } catch (emailError) {
      console.error('Admin Email Notification failed but order was saved:', emailError);
    }

    // ✅ Update Stock Inventory (Standardized for all products)
    try {
      const stockUpdates = finalItems.map(item => {
        // Use findOneAndUpdate with the item.id (which is product._id)
        return Product.findOneAndUpdate(
          { _id: item.id }, 
          { $inc: { stock: -Math.abs(item.quantity) } }, // Ensure we always decrease
          { new: true }
        );
      });
      const updatedProducts = await Promise.all(stockUpdates);
      console.log(`✅ Stock updated for ${updatedProducts.length} items`);
    } catch (stockError: any) {
      console.error('CRITICAL: Failed to update stock for order', order.orderId, stockError.message);
    }

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
