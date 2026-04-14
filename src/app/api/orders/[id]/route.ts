import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import DirectOrder from '@/models/Order';
import { verifyAccessToken } from '@/lib/jwt';
import { securityResponse } from '@/lib/security';
import nodemailer from 'nodemailer';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params since Next.js 16 requires it for app-router dynamic routes
    const { id } = await params;
    
    // Extract token from cookie or Authorization header
    const authHeader = req.headers.get('authorization');
    const tokenCookie = req.cookies.get('accessToken');
    
    let token = tokenCookie?.value;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    const decoded = token ? verifyAccessToken(token) : null;

    if (!decoded) {
      console.warn(`[AUTH] Failed: ${token ? 'Invalid/Expired Token' : 'Missing Token'}`);
      return securityResponse(`Forbidden: ${token ? 'Session expired. Please log in again.' : 'Authentication required.'}`, 403);
    }

    if (decoded.role?.toLowerCase() !== 'admin') {
      console.warn(`[AUTH] Forbidden: User ${decoded.email} has role ${decoded.role}, expected admin`);
      return securityResponse('Forbidden: Admin access only', 403);
    }

    console.log(`[AUTH] Success: Admin ${decoded.email} authorized for order ${id}`);

    const body = await req.json();
    const { status, premiumThankYou } = body;

    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    await connectDB();

    const order = await DirectOrder.findById(id);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    order.status = status;
    if (status === 'delivered') {
      order.payment.status = 'completed';
    }
    
    await order.save();
    console.log(`✅ Order ${id} status updated to ${status} in database.`);

    // ✅ Send Delivery "Thank You" Email
    let emailDeliveryStatus = "Email not configured for this update.";
    
    if (status === 'delivered') {
      if (order.customer?.email) {
        // Create transporter once
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD?.replace(/\s/g, ''),
          },
        });

        const itemsHtml = order.items.map((i: any) => `
          <div style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${i.name}</strong> - Qty: ${i.quantity} (₹${i.price})
          </div>
        `).join("");

        const premiumHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
            <div style="background: #1a5d1a; padding: 30px; border-radius: 15px 15px 0 0; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">Delivered Successfully!</h1>
              <p style="font-size: 18px; opacity: 0.9; margin-top: 10px;">Order #${order.orderId}</p>
            </div>
            
            <div style="padding: 30px; border: 1px solid #1a5d1a; border-top: none; border-radius: 0 0 15px 15px; background: #fff;">
              <p>Hi <strong>${order.customer.name}</strong>,</p>
              <p>Great news! Your 9 Nutzz Millets order has been successfully delivered. We hope you enjoy these healthy, handcrafted millet treats.</p>
              
              <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #c0911b;">
                <h3 style="margin-top: 0; color: #c0911b; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Order Summary</h3>
                ${itemsHtml}
                <div style="padding-top: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #1a5d1a;">
                  Total Amount: ₹${order.payment.totalAmount}
                </div>
              </div>

              <div style="text-align: center; margin-top: 30px; padding: 20px; border-top: 1px dashed #ddd;">
                <h3 style="color: #1a5d1a; margin-top: 0;">Thank You for Choosing 9 Nutzz!</h3>
                <p style="font-size: 14px; color: #666;">We'd love to hear your feedback. Feel free to reply to this email or visit our shop again!</p>
                <a href="${process.env.NEXT_PUBLIC_URL || 'https://9-nutzz-millets.vercel.app'}/shop" 
                   style="background: #c0911b; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; margin-top: 15px; box-shadow: 0 4px 10px rgba(192, 145, 27, 0.3);">
                  Shop More Millets
                </a>
              </div>

              <div style="margin-top: 40px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #eee; pt-20;">
                <p style="margin-bottom: 5px;">9 NUTZ MILLETS NEAR YSR STATUE, GOLLALA MAMIDADA, LN PURAM, AP.</p>
                <p>© ${new Date().getFullYear()} 9 Nutzz Millets. All rights reserved.</p>
              </div>
            </div>
          </div>
        `;

        const basicHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Order Delivered</h2>
            <p>Hi ${order.customer.name},</p>
            <p>Your order #${order.orderId} from 9 NUTZ MILLETS has been delivered.</p>
            <p>Thank you for shopping with us!</p>
          </div>
        `;

        const mailOptions = {
          from: `"9 Nutzz Millets" <${process.env.EMAIL_USER}>`,
          to: order.customer.email,
          subject: "🎉 Your 9 Nutzz treats have been delivered!",
          html: premiumThankYou ? premiumHtml : basicHtml,
        };

        // ✅ Send directly and wait for result (Synchronous for reliability)
        try {
          console.log(`[EMAIL] Sending ${premiumThankYou ? 'Premium' : 'Basic'} delivery email to: ${order.customer.email}`);
          await transporter.sendMail(mailOptions);
          console.log('📧 Email sent successfully!');
          emailDeliveryStatus = " Premium 'Thank You' email sent to customer!";
        } catch (err: any) {
          console.error('❌ Email failed delivery:', err.message);
          emailDeliveryStatus = " Delivery succeeded but email failed to send (Check SMTP).";
        }

      } else {
        emailDeliveryStatus = " Customer email not saved (Older order), so no email was sent.";
        console.log(`[EMAIL] Skipping email: Status=${status}, EmailExists=${!!order.customer?.email}`);
      }
    }

    return NextResponse.json({ 
      message: `Status updated to ${status}.${emailDeliveryStatus}`, 
      order 
    }, { status: 200 });

  } catch (error: any) {
    console.error('CRITICAL: Order Update API Error:', error.message);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error.message,
      status: 'error' 
    }, { status: 500 });
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
