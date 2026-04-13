"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Cookie, Wheat, IceCream, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  {
    name: "Millet Cookies",
    slug: "cookies",
    icon: <Cookie className="w-8 h-8" />,
    color: "bg-emerald-50",
    textColor: "text-emerald-700",
  },
  {
    name: "Millet Laddus",
    slug: "laddus",
    icon: <IceCream className="w-8 h-8" />,
    color: "bg-amber-50",
    textColor: "text-amber-700",
  },
  {
    name: "Healthy Snacks",
    slug: "snacks",
    icon: <Coffee className="w-8 h-8" />,
    color: "bg-orange-50",
    textColor: "text-orange-700",
  },
  {
    name: "Organic Grains",
    slug: "grains",
    icon: <Wheat className="w-8 h-8" />,
    color: "bg-green-50",
    textColor: "text-green-700",
  },
];

export default function Categories() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-brand-gold/5 blur-[100px] rounded-full -ml-32 -mt-32" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-green/5 blur-[100px] rounded-full -mr-32 -mb-32" />

      <div className="container mx-auto px-4 md:px-12 relative z-10">
        <div className="text-center mb-16 px-4">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-gold mb-3 block"
          >
            Taste the Tradition
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-black text-brand-green mb-6 tracking-tight">
            Browse by <span className="gold-text italic">Category</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-medium text-sm md:text-base">
            Explore our curated range of millet-based delights, meticulously crafted for wholesome taste and vibrant health.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link 
                href={`/shop?category=${cat.slug}`}
                className="group relative block"
              >
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl rounded-3xl",
                  cat.color
                )} />
                <div className={cn(
                  "relative p-10 rounded-[40px] flex flex-col items-center justify-center transition-all duration-500 border border-gray-100 bg-white group-hover:bg-transparent group-hover:border-brand-gold/20 group-hover:translate-y-[-8px] shadow-sm group-hover:shadow-xl",
                  cat.color.replace('bg-', 'group-hover:bg-') 
                )}>
                  <div className={cn(
                    "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-all duration-500 shadow-sm",
                    cat.color,
                    cat.textColor,
                    "group-hover:bg-white group-hover:scale-110 group-hover:rotate-6"
                  )}>
                    {cat.icon}
                  </div>
                  <h3 className={`font-black text-xl uppercase tracking-tighter ${cat.textColor}`}>{cat.name}</h3>
                  <div className="flex items-center space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                     <span className="text-[9px] font-black uppercase tracking-widest text-brand-gold">Discover Items</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
