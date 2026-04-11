"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number;
    images: string[];
    category: string;
    rating: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item: any) => item._id === product._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage")); // Trigger update in Navbar
  };

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
    >
      <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        <div className="absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
           {product.images && product.images.length > 0 ? (
             <img 
               src={product.images[0]} 
               alt={product.name}
               className="w-full h-full object-cover"
             />
           ) : (
             /* Placeholder for Product Image if none exists */
             <div className="w-full h-full bg-brand-green/10 flex items-center justify-center p-6">
                <span className="text-brand-green/30 font-black text-2xl uppercase tracking-tighter rotate-12">{product.name}</span>
             </div>
           )}
        </div>
        {product.discountPrice && (
          <span className="absolute top-4 left-4 bg-brand-gold text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            Sale
          </span>
        )}
      </Link>

      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold">{product.category}</span>
          <div className="flex items-center text-amber-400">
            <Star size={12} fill="currentColor" />
            <span className="text-xs font-bold ml-1 text-gray-600">{product.rating}</span>
          </div>
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="text-lg font-bold text-brand-green mb-2 line-clamp-1 group-hover:text-brand-gold transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-brand-green font-mono">₹{product.price}</span>
            {product.discountPrice && (
              <span className="text-xs text-gray-400 line-through">₹{product.discountPrice}</span>
            )}
          </div>
          
          <button
            onClick={addToCart}
            className="p-3 bg-brand-green text-white rounded-xl hover:bg-brand-gold transition-colors shadow-md"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
