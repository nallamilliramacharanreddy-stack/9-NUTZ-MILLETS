"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingCart, Star, ArrowLeft, ShieldCheck, Truck, RefreshCcw, Minus, Plus, MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function ProductDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.status === 404) {
          setError("Product not found");
          return;
        }
        if (!res.ok) {
           throw new Error("Failed to fetch product");
        }
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Something went wrong while loading the product.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-brand-gold mb-4" size={40} />
        <p className="text-brand-green font-bold animate-pulse text-xs uppercase tracking-widest">Harvesting Product Details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
           <AlertCircle size={40} />
        </div>
        <h1 className="text-2xl font-black text-brand-green mb-2">{error || "Product Not Found"}</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">The product you're looking for might have been moved or is currently out of stock.</p>
        <Link 
          href="/shop"
          className="px-8 py-4 bg-brand-green text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item: any) => item._id === product._id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    router.push("/cart");
  };

  const handleWhatsAppOrder = () => {
    const text = `Hi 9 Nutzz Millets! I want to order ${quantity} ${product.name}. Please confirm availability. Thanks!`;
    window.open(`https://wa.me/919949131747?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-8 py-28 max-w-6xl">
        <Link href="/shop" className="flex items-center space-x-2 text-brand-green font-bold mb-8 hover:text-brand-gold transition-colors w-fit">
          <ArrowLeft size={20} />
          <span>Back to Collection</span>
        </Link>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
             <div className="aspect-square bg-brand-cream/30 rounded-3xl overflow-hidden flex items-center justify-center p-12 border border-brand-gold/5 shadow-inner">
                <div className="text-center">
                   <span className="text-4xl md:text-5xl lg:text-6xl font-black text-brand-green/10 uppercase tracking-tighter opacity-50 rotate-[-10deg] block break-words max-w-[300px]">
                      {product.name}
                   </span>
                </div>
             </div>
             <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(idx => (
                   <div key={idx} className="aspect-square bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                      <div className="w-1/2 h-1/2 bg-gray-100 rounded-full opacity-20" />
                   </div>
                ))}
             </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center space-x-2 mb-4">
               <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-bold uppercase tracking-widest rounded-full">{product.category}</span>
               <div className="flex items-center text-amber-400">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-bold ml-1 text-gray-700">{product.rating || "5.0"} ({product.numReviews || "0"} Reviews)</span>
               </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-brand-green mb-4 leading-tight">{product.name}</h1>
            <p className="text-gray-500 mb-8 leading-relaxed text-lg">{product.description}</p>
            
            <div className="flex items-center gap-4 mb-10">
               <span className="text-4xl lg:text-5xl font-black text-brand-green tracking-tight">₹{product.price}</span>
               {product.discountPrice && (
                 <span className="text-2xl text-gray-400 line-through">₹{product.discountPrice}</span>
               )}
               <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-lg uppercase tracking-wider ml-2">In Stock</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 mb-10">
               <div className="flex items-center space-x-6 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 w-fit">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-brand-green hover:bg-white rounded-lg transition-all shadow-sm active:scale-95"><Minus size={20} /></button>
                  <span className="font-black text-brand-green text-2xl w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-brand-green hover:bg-white rounded-lg transition-all shadow-sm active:scale-95"><Plus size={20} /></button>
               </div>
               
               <button 
                  onClick={addToCart}
                  className="flex-grow py-4 bg-brand-green text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center space-x-2"
               >
                  <ShoppingCart size={22} />
                  <span className="text-lg">Add to Healthy Cart</span>
               </button>
            </div>

            <button 
               onClick={handleWhatsAppOrder}
               className="w-full py-4 border-2 border-emerald-500 text-emerald-600 font-bold rounded-2xl flex items-center justify-center space-x-2 hover:bg-emerald-50 transition-all mb-12 shadow-sm group"
            >
               <MessageCircle size={22} className="group-hover:rotate-12 transition-transform" />
               <span className="text-lg">Order Quickly via WhatsApp</span>
            </button>

            {/* Features list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-gray-100">
               <div className="flex items-center space-x-3 text-brand-green">
                  <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-gold">
                    <ShieldCheck size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-tight">100% Pure <br />Organic</span>
               </div>
               <div className="flex items-center space-x-3 text-brand-green">
                  <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-gold">
                    <Truck size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-tight">Radius <br />Delivery</span>
               </div>
               <div className="flex items-center space-x-3 text-brand-green">
                  <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-gold">
                    <RefreshCcw size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-tight">Freshly <br />Baked</span>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
