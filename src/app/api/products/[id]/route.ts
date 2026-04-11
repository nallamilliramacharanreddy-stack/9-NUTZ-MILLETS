import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { verifyAccessToken } from '@/lib/jwt';
import { securityResponse } from '@/lib/security';
import mongoose from 'mongoose';

// Admin Authorization Helper
const verifyAdmin = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const decoded = token ? verifyAccessToken(token) : null;
  if (!decoded || decoded.role !== 'admin') {
    return false;
  }
  return true;
};

// GET: Fetch product by SLUG or ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idOrSlug } = await params;
    await connectDB();

    let product;

    // Check if it's a valid MongoDB ID first, otherwise treat as slug
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug);
    } else {
      product = await Product.findOne({ slug: idOrSlug });
    }

    // Emergency Seeding logic
    if (!product && idOrSlug === 'soya-noodles') {
      product = await Product.create({
        name: "Healthy Soya Noodles",
        slug: "soya-noodles",
        description: "High-protein Soya Noodles made with premium defatted soya flour and wheat.",
        price: 159,
        discountPrice: 199,
        images: ["/soya-noodles.jpg"],
        category: "snacks",
        stock: 120,
        featured: true,
        rating: 4.7,
        numReviews: 85
      });
    }

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Unified Product GET Error:', error);
    return securityResponse('Internal Server Error', 500);
  }
}

// PATCH: Edit product (Admin Only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdmin())) return securityResponse('Forbidden: Admin access only', 403);
    
    const { id } = await params;
    const body = await req.json();
    
    await connectDB();
    
    // For Admin actions, we strictly use ID for precision
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid Product ID' }, { status: 400 });
    }

    const targetProduct = await Product.findById(id);
    if (!targetProduct) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    // Update fields
    if (body.name !== undefined) targetProduct.name = body.name;
    if (body.description !== undefined) targetProduct.description = body.description;
    if (body.price !== undefined) targetProduct.price = Number(body.price);
    if (body.category !== undefined) targetProduct.category = body.category;
    if (body.stock !== undefined) targetProduct.stock = Number(body.stock);
    if (body.featured !== undefined) targetProduct.featured = body.featured;
    if (body.images && Array.isArray(body.images)) targetProduct.images = body.images;
    
    await targetProduct.save();

    return NextResponse.json({ 
      message: 'Product updated successfully',
      product: targetProduct
    }, { status: 200 });

  } catch (error: any) {
    console.error('Unified Product PATCH Error:', error);
    return securityResponse('Internal Server Error', 500);
  }
}

// DELETE: Delete product (Admin Only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdmin())) return securityResponse('Forbidden: Admin access only', 403);
    
    const { id } = await params;
    
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: 'Invalid Product ID' }, { status: 400 });
    }

    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Unified Product DELETE Error:', error);
    return securityResponse('Internal Server Error', 500);
  }
}
