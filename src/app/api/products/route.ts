import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { securityResponse, logSecurityEvent } from '@/lib/security';

// GET: Fetch all products with optional filtering
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    let query: any = {};
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;

    const products = await Product.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Products List Error:', error.message);
    const message = error.message?.includes("connect") || error.message?.includes("timeout")
      ? "Database connection failed. Please check Atlas IP Whitelist."
      : "Failed to fetch products";
    return securityResponse(message, 500);
  }
}

// POST: Add new product (Admin Only)
export async function POST(req: NextRequest) {
  try {
    // Basic auth check could be added here, similar to other routes
    await connectDB();

    const body = await req.json();
    
    // Basic validation
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ message: 'Missing required product fields' }, { status: 400 });
    }

    // Generate slug if not provided
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const product = await Product.create({
      ...body,
      slug,
      images: body.images || ["https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=2070&auto=format&fit=crop"]
    });

    // Log Security Event
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    await logSecurityEvent({
      event: 'PRODUCT_CREATED',
      severity: 'INFO',
      ip,
      metadata: { productId: product._id, name: product.name }
    });

    return NextResponse.json({
      message: 'Product created successfully',
      product
    }, { status: 201 });

  } catch (error: any) {
    console.error('Product Creation Error:', error.message);
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A product with this name or slug already exists' }, { status: 400 });
    }
    const message = error.message?.includes("connect") || error.message?.includes("timeout")
      ? "Database connection failed. Please check Atlas IP Whitelist."
      : "Failed to create product";
    return securityResponse(message, 500);
  }
}
