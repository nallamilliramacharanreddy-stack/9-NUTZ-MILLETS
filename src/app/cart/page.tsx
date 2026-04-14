"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ArrowLeft, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(items);
    setLoading(false);
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    const newCart = cartItems.map((item) => {
      if (item._id === id) {
        const moq = item.minOrderQuantity || 1;
        const newQty = Math.max(moq, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const removeItem = (id: string) => {
    const newCart = cartItems.filter((item) => item._id !== id);
    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 0; // Delivery is now free for all orders
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-green" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream/10 pt-28 pb-12">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <Link href="/shop" className="flex items-center space-x-2 text-brand-green font-bold mb-8 hover:text-brand-gold transition-colors">
          <ArrowLeft size={20} />
          <span>Back to Shopping</span>
        </Link>

        <h1 className="text-3xl font-bold text-brand-green mb-10">Your Healthy Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-brand-gold/10">
            <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gold">
               <Plus size={40} />
            </div>
            <h2 className="text-xl font-bold text-brand-green mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added any millet delights yet.</p>
            <Link href="/shop" className="px-8 py-3 bg-brand-green text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all inline-block text-sm">
                Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-brand-gold/5 flex items-center gap-4 md:gap-6"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-brand-green/5 rounded-2xl flex items-center justify-center shrink-0">
                       <span className="text-[10px] uppercase font-bold text-brand-green/30 rotate-12">{item.category}</span>
                    </div>
                    
                    <div className="flex-grow">
                       <p className="text-brand-gold font-bold text-sm">₹{item.price}</p>
                       {item.minOrderQuantity && item.minOrderQuantity > 1 && (
                         <p className="text-[9px] text-red-500 font-black uppercase tracking-widest mt-1">
                           Min Order: {item.minOrderQuantity}
                         </p>
                       )}
                    </div>

                    <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                      <button 
                        onClick={() => updateQuantity(item._id, -1)}
                        className="p-1 hover:bg-white rounded-lg transition-colors text-brand-green disabled:opacity-30"
                         disabled={item.quantity <= (item.minOrderQuantity || 1)}
                       >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold text-brand-green w-4 text-center text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, 1)}
                        className="p-1 hover:bg-white rounded-lg transition-colors text-brand-green"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeItem(item._id)}
                      className="p-3 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-green/5 sticky top-28">
                <h3 className="text-xl font-bold text-brand-green mb-6 pb-4 border-b">Order Summary</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-bold text-brand-green">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 items-baseline">
                    <span>Delivery</span>
                    <span className="text-emerald-500 uppercase text-xs font-black tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">
                       Free
                    </span>
                  </div>
                  <div className="pt-4 border-t flex justify-between">
                    <span className="text-lg font-bold text-brand-green">Total</span>
                    <span className="text-2xl font-black text-brand-green">₹{total}</span>
                  </div>
                </div>

                <Link 
                  href="/checkout"
                  className="w-full py-4 bg-brand-green text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-lg"
                >
                  <span>Proceed to Delivery</span>
                </Link>
                
                <p className="text-[10px] text-gray-400 mt-4 text-center font-medium uppercase tracking-widest">
                   Deliverable only within 40km radius
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
