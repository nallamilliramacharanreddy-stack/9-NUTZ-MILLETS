"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Cookie, Wheat, IceCream, Coffee } from "lucide-react";

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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-green mb-4">
            Browse by Category
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Explore our range of millet-based delights, crafted for taste and health.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                href={`/shop?category=${cat.slug}`}
                className={`${cat.color} p-8 rounded-2xl flex flex-col items-center justify-center group hover:shadow-lg transition-all border border-transparent hover:border-brand-gold/20`}
              >
                <div className={`${cat.textColor} mb-4 transform group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <h3 className={`font-bold text-lg ${cat.textColor}`}>{cat.name}</h3>
                <span className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wider">Explore</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
