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
    minOrderQuantity?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item: any) => item._id === product._id);
    const moq = product.minOrderQuantity || 1;
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: moq });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage")); // Trigger update in Navbar
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -12 }}
      className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border border-gray-100/50 group"
    >
      <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50/50">
        <div className="absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-110 duration-700 ease-out">
           {product.images && product.images.length > 0 ? (
             <img 
               src={product.images[0]} 
               alt={product.name}
               className="w-full h-full object-cover"
             />
           ) : (
             <div className="w-full h-full bg-brand-green/5 flex items-center justify-center p-8">
                <span className="text-brand-green/20 font-black text-3xl uppercase tracking-tighter rotate-12">{product.name}</span>
             </div>
           )}
        </div>
        
        {/* Overlay for better text readability and depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute top-4 left-4 flex flex-col gap-2">
           {product.discountPrice && (
             <span className="bg-brand-gold text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg shadow-brand-gold/20">
               Sale
             </span>
           )}
           <span className="bg-white/90 backdrop-blur-md text-brand-green text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm border border-gray-100">
             {product.category}
           </span>
           {product.minOrderQuantity && product.minOrderQuantity > 1 && (
             <span className="bg-red-500 text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg">
               Min Order: {product.minOrderQuantity}
             </span>
           )}
        </div>
      </Link>

      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-0.5 text-amber-400">
             {[...Array(5)].map((_, i) => (
               <Star key={i} size={10} fill={i < Math.floor(product.rating || 5) ? "currentColor" : "none"} className={i < Math.floor(product.rating || 5) ? "" : "text-gray-200"} />
             ))}
             <span className="text-[10px] font-black ml-1.5 text-gray-400">({product.rating || 5}.0)</span>
          </div>
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="text-xl font-black text-brand-green mb-3 line-clamp-1 group-hover:text-brand-gold transition-colors tracking-tighter uppercase">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-brand-green tracking-tighter">₹{product.price}</span>
              {product.discountPrice && (
                <span className="text-xs text-gray-400 line-through font-bold">₹{product.discountPrice}</span>
              )}
            </div>
          </div>
          
          <button
            onClick={addToCart}
            className="w-12 h-12 flex items-center justify-center bg-brand-green text-white rounded-[18px] hover:bg-brand-gold hover:shadow-lg hover:shadow-brand-gold/20 transition-all duration-300 active:scale-90"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
