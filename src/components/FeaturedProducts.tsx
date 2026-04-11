"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (res.ok) {
          // Filter products marked as featured, or just take first 4
          const featured = data.filter((p: any) => p.featured).slice(0, 4);
          // If no featured, just take the first 4
          setProducts(featured.length > 0 ? featured : data.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <section className="py-20 bg-brand-cream/30">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-bold text-brand-gold uppercase tracking-[0.3em] mb-2 block">Our Top Choice</span>
            <h2 className="text-3xl md:text-4xl font-black text-brand-green">
              Featured Delight
            </h2>
            <p className="text-gray-500 max-w-lg mt-4">
              Explore our range of nutritious treats, handcrafted for your health and taste.
            </p>
          </div>
          <Link 
            href="/shop"
            className="w-fit px-8 py-3 bg-white border-2 border-brand-green text-brand-green font-bold rounded-2xl hover:bg-brand-green hover:text-white transition-all shadow-sm flex items-center space-x-2"
          >
            <span>View All Collection</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
             <Loader2 className="animate-spin text-brand-gold mb-4" size={32} />
             <p className="text-xs font-bold text-brand-green uppercase tracking-widest animate-pulse">Loading favorites...</p>
          </div>
        ) : (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No featured products available.</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
