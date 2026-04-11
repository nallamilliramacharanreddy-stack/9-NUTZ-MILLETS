import mongoose, { Schema, model, models } from 'mongoose';

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: 'cookies' | 'laddus' | 'snacks' | 'grains' | 'flours' | 'flakes' | 'noodles-pasta' | 'ready-to-mix' | 'others';
  stock: number;
  featured: boolean;
  rating: number;
  numReviews: number;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    images: { type: [String], required: true },
    category: {
      type: String,
      required: true,
      enum: ['cookies', 'laddus', 'snacks', 'grains', 'flours', 'flakes', 'noodles-pasta', 'ready-to-mix', 'others'],
    },
    stock: { type: Number, required: true, default: 0 },
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product = models.Product || model<IProduct>('Product', productSchema);
export default Product;
