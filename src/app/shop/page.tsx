"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Loader2, SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products${category !== 'all' ? `?category=${category}` : ''}`);
      const data = await res.json();
      if (res.ok) {
        // Filter by search client-side for better UX
        const filtered = data.filter((p: any) => 
          p.name.toLowerCase().includes(search.toLowerCase())
        );
        setProducts(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, search]);

  const categories = ["all", "cookies", "laddus", "snacks", "grains"];

  return (
    <div className="min-h-screen bg-white pt-28">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-brand-green mb-4 text-center md:text-left"
          >
            Our Healthy Collection
          </motion.h1>
          <p className="text-gray-500 text-center md:text-left">Pure organic millet-based foods for your daily nutrition.</p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center">
          <div className="relative flex-grow group w-full">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-gold transition-colors" size={20} />
             <input 
               type="text" 
               placeholder="Search for cookies, laddus, grains..." 
               className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-gold outline-none transition-all shadow-sm"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all uppercase tracking-widest
                  ${category === cat ? "bg-brand-green text-white shadow-lg" : "bg-gray-50 text-brand-green/60 hover:bg-brand-gold/10"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-brand-gold mb-4" size={40} />
            <p className="text-brand-green font-bold animate-pulse uppercase tracking-widest text-xs">Syncing Storefront...</p>
          </div>
        ) : (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20">
                <AnimatePresence mode="popLayout">
                  {products.map((product, index) => (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-32 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                   <Filter size={32} className="text-brand-gold" />
                </div>
                <h2 className="text-xl font-bold text-brand-green mb-2">No products found</h2>
                <p className="text-gray-500 mb-8">It seems we don't have items in this category yet.</p>
                <button 
                  onClick={() => {setCategory("all"); setSearch("");}}
                  className="px-8 py-3 bg-brand-green text-white font-bold rounded-xl shadow-lg hover:bg-brand-gold transition-colors"
                >
                  Show All Items
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
