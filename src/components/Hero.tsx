"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden">
      {/* Background with brand texture/color */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-[#fcfaf2] rounded-l-[100px] hidden lg:block" />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-gold/10 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1 bg-brand-gold/10 text-brand-gold font-bold text-xs tracking-widest uppercase rounded-full mb-4">
            Organic & Premium
          </span>
          <h2 className="text-2xl min-[380px]:text-3xl md:text-6xl font-extrabold text-brand-green leading-tight mb-6 text-center md:text-left">
            Premium Organic <br />
            <span className="gold-text">Millet Foods</span> for a <br />
            Healthier You.
          </h2>
          <p className="text-base md:text-lg text-gray-600 mb-8 max-w-lg mx-auto md:mx-0 text-center md:text-left">
            Discover the goodness of our carefully crafted millet cookies, laddus, and snacks. 
            Wholesome, nutritious, and delicious. Experience the ancient Superfood reimagined.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link 
              href="/shop" 
              className="px-8 py-4 bg-brand-green text-white font-bold rounded-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all"
            >
              <span>Shop Our Collection</span>
              <ArrowRight size={20} />
            </Link>
            <Link 
              href="/about" 
              className="px-8 py-4 border-2 border-brand-green text-brand-green font-bold rounded-lg flex items-center justify-center hover:bg-brand-green hover:text-white transition-all"
            >
              Our Story
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center md:justify-start space-x-8 opacity-70">
            <div>
               <p className="text-xl font-bold text-brand-green">100%</p>
               <p className="text-xs text-gray-500 uppercase font-semibold">Natural</p>
            </div>
            <div className="w-px h-8 bg-gray-300" />
            <div>
               <p className="text-xl font-bold text-brand-green">Free</p>
               <p className="text-xs text-gray-500 uppercase font-semibold">Delivery*</p>
            </div>
            <div className="w-px h-8 bg-gray-300" />
            <div>
               <p className="text-xl font-bold text-brand-green">Pure</p>
               <p className="text-xs text-gray-500 uppercase font-semibold">Organic</p>
            </div>
          </div>
        </motion.div>

        {/* Visual Element (generated placeholder) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="w-full aspect-square max-w-lg mx-auto bg-brand-green rounded-3xl overflow-hidden shadow-2xl relative group">
             {/* Using a high-quality placeholder image with brand vibes */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
             <div className="absolute inset-0 flex items-center justify-center p-8">
               <div className="text-center">
                  <span className="text-brand-gold text-5xl font-black italic block mb-2 drop-shadow-lg">Healthy</span>
                  <span className="text-white text-5xl font-black italic block drop-shadow-lg">Snacking</span>
               </div>
             </div>
             {/* Placeholder image for Millet Cookies */}
             <div className="absolute bottom-[-10%] left-[-10%] w-[60%] aspect-square bg-brand-gold rounded-full blur-[80px] opacity-30" />
          </div>
          
          {/* Floating elements */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute top-10 left-2 md:-left-6 bg-white p-3 md:p-4 rounded-xl shadow-lg border border-brand-gold/20 z-20"
          >
            <p className="text-[10px] md:text-xs font-bold text-brand-green">Best Seller</p>
            <p className="text-[8px] md:text-[10px] text-gray-500">Millet Laddu</p>
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
            className="absolute bottom-20 right-2 md:-right-6 bg-brand-gold p-3 md:p-4 rounded-xl shadow-lg z-20"
          >
            <p className="text-[10px] md:text-xs font-bold text-brand-green">24/7 Support</p>
            <p className="text-[8px] md:text-[10px] text-white">Dedicated Help</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
