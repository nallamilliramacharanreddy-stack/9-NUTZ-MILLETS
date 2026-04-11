import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { verifyAccessToken } from '@/lib/jwt';
import { schemas, securityResponse } from '@/lib/security';
import { Logger } from '@/lib/logger';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    
    await connectDB();
    
    let query = {};
    if (category && category !== 'all') {
      query = { category: String(category) };
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(products);
  } catch (error: any) {
    return securityResponse('Failed to fetch products', 500);
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  
  try {
    // 1. Authorization Check (Access Token)
    const token = req.cookies.get('accessToken')?.value;
    const decoded = token ? verifyAccessToken(token) : null;

    if (!decoded || decoded.role !== 'admin') {
      await Logger.security('ADMIN_ACTION_UNAUTHORIZED', ip, 'WARN', decoded?.id, { path: req.url });
      return securityResponse('Forbidden: Admin access only', 403);
    }

    // 2. Input Validation (Zod)
    const body = await req.json();
    
    // JSON Depth Protection (basic check)
    if (JSON.stringify(body).length > 50000) { // 50KB limit
      await Logger.security('API_ABUSE_DETECTED', ip, 'CRITICAL', decoded.id, { info: 'Payload too large' });
      return securityResponse('Payload too large', 413);
    }

    const validation = schemas.product.safeParse(body);
    if (!validation.success) {
      console.error('Validation Error Details:', validation.error.format());
      return NextResponse.json({ 
        message: 'Invalid product data', 
        errors: (validation.error.issues || validation.error.errors || []).map((e: any) => `${e.path.join('.')}: ${e.message}`)
      }, { status: 400 });
    }

    const { name, description, price, category, stock, images, featured } = validation.data;

    await connectDB();

    // 3. Secure slug generation
    const slug = name.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return securityResponse('A product with this name already exists', 400);
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      category,
      stock,
      images: images || [],
      featured: featured || false,
      rating: 0,
      numReviews: 0,
    });

    await Logger.info(`Admin ${decoded.id} created product: ${product.name}`, { productId: product._id });

    return NextResponse.json({ message: 'Product created successfully', product }, { status: 201 });
  } catch (error: any) {
    console.error('Product API Error:', error.message);
    console.error('Product API Error:', error.message);
    return securityResponse('Internal Server Error', 500);
  }
}

