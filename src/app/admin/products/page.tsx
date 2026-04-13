"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, MoreVertical, Edit, Trash2, Box, Info, X, Loader2, CheckCircle2, AlertCircle, Save, PackageX, PackageCheck, ImagePlus, XCircle, RefreshCw, Layers } from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "cookies",
    stock: "",
    featured: false,
    images: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Edit State
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editingSubmitting, setEditingSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for Base64
        alert("File is too large! Please select an image under 2MB for better performance.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEditing && editingProduct) {
          setEditingProduct({ ...editingProduct, images: [base64String] });
        } else {
          setFormData({ ...formData, images: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
          images: formData.images ? [formData.images] : [],
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setShowAddForm(false);
          setSuccess(false);
          setFormData({ name: "", description: "", price: "", category: "cookies", stock: "", featured: false, images: "" });
          fetchProducts();
        }, 1500);
      } else {
        let errorMsg = data.message || "Failed to create product";
        if (data.errors && data.errors.length > 0) {
          errorMsg = data.errors.join(", ");
        }
        setError(errorMsg);
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditingSubmitting(true);
    try {
      const payload = {
        ...editingProduct,
        images: Array.isArray(editingProduct.images) ? editingProduct.images : [editingProduct.images].filter(Boolean)
      };

      const res = await fetch(`/api/products/${editingProduct._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const { product } = await res.json();
        setProducts(products.map(p => p._id === product._id ? { ...p, ...product } : p));
        setEditingProduct(null);
        alert("✅ Product updated successfully!");
      } else {
        const errorData = await res.json();
        alert(`❌ Update Failed: ${errorData.message}`);
      }
    } catch (err) {
      alert("❌ Server Error.");
    } finally {
      setEditingSubmitting(false);
    }
  };
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`🚨 CRITICAL WARNING! Are you sure you want to PERMANENTLY DELETE "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p._id !== id));
        alert("✅ Product deleted permanently.");
      } else {
        const errorData = await res.json();
        alert(`❌ Failed to delete: ${errorData.message}`);
      }
    } catch (err) {
      alert("❌ Server Error.");
    }
  };

  const handleToggleStock = async (id: string, currentStock: number) => {
    const newStock = currentStock > 0 ? 0 : 100;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });

      if (res.ok) {
        setProducts(products.map(p => p._id === id ? { ...p, stock: newStock } : p));
      } else {
        alert("❌ Failed to update stock status.");
      }
    } catch (err) {
      alert("❌ Server Error.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-brand-green">Product Inventory</h2>
          <p className="text-gray-500 text-sm">Update prices, stock and product details.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-brand-green text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={20} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Add Product Modal Overlay */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b flex items-center justify-between bg-brand-green text-white">
                 <h3 className="text-xl font-bold">Register New Item</h3>
                 <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Millet Almond Bliss"
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                    <select 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="cookies">Millet Cookies</option>
                      <option value="laddus">Millet Laddus</option>
                      <option value="snacks">Healthy Snacks</option>
                      <option value="grains">Organic Grains</option>
                      <option value="flours">Millet Flours</option>
                      <option value="flakes">Millet Flakes</option>
                      <option value="noodles-pasta">Noodles & Pasta</option>
                      <option value="ready-to-mix">Ready to Mix / Cook</option>
                      <option value="others">Other Products</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Price (₹)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="199"
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Initial Stock</label>
                    <input 
                      type="number" 
                      required
                      placeholder="50"
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                   <textarea 
                     required
                     placeholder="Tell customers about the healthy ingredients..."
                     className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold"
                     rows={3}
                     value={formData.description}
                     onChange={(e) => setFormData({...formData, description: e.target.value})}
                   />
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product Photo</label>
                     {formData.images && (
                       <button 
                         type="button" 
                         onClick={() => setFormData({...formData, images: ""})}
                         className="flex items-center space-x-1 text-[10px] font-bold text-red-500 uppercase hover:underline"
                       >
                         <XCircle size={12} />
                         <span>Remove Photo</span>
                       </button>
                     )}
                   </div>
                   
                   <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                     <input 
                       type="file" 
                       ref={fileInputRef} 
                       className="hidden" 
                       accept="image/*"
                       onChange={(e) => handleFileChange(e, false)}
                     />
                     <div className={`w-full h-48 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-gray-50
                       ${formData.images ? 'border-brand-green/20' : 'border-gray-200 hover:border-brand-gold/50'}`}>
                       
                       {formData.images ? (
                         <div className="relative w-full h-full">
                           <img 
                             src={formData.images} 
                             alt="Preview" 
                             className="w-full h-full object-cover"
                             onError={(e) => {
                               (e.target as any).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                             }}
                           />
                           <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">Click to Change</p>
                           </div>
                         </div>
                       ) : (
                         <div className="text-center p-6">
                            <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                               <ImagePlus size={24} />
                            </div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-tight">Upload from Gallery</p>
                            <p className="text-[10px] text-gray-300 mt-1">Tap to select your photo</p>
                         </div>
                       )}
                     </div>

                     <div className="mt-3 relative">
                       <input 
                         type="text" 
                         placeholder="Paste high-quality photo URL here..."
                         className="w-full pl-10 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold shadow-sm transition-all"
                         value={formData.images}
                         onChange={(e) => setFormData({...formData, images: e.target.value})}
                       />
                       <RefreshCw className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                     </div>
                     <p className="text-[10px] text-gray-400 mt-2 italic px-2">Tip: Use high-res square images for the best shop experience.</p>
                   </div>
                </div>

                <div className="flex items-center space-x-3">
                   <input 
                     type="checkbox" 
                     id="featured"
                     className="w-5 h-5 accent-brand-green"
                     checked={formData.featured}
                     onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                   />
                   <label htmlFor="featured" className="text-sm font-bold text-brand-green">Show in Featured Section (Home Page)</label>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-center space-x-3 border border-red-100 italic">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm flex items-center space-x-3 border border-emerald-100">
                    <CheckCircle2 size={18} />
                    <span>Item successfully added to inventory!</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-brand-gold text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <span>Publish New Item</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 bg-brand-cream/50 border-b border-brand-gold/10 flex items-center justify-between">
                 <div>
                   <h3 className="text-xl font-black text-brand-green">Edit Product</h3>
                   <p className="text-xs font-bold text-brand-gold uppercase tracking-widest mt-1">#{editingProduct._id}</p>
                 </div>
                 <button onClick={() => setEditingProduct(null)} className="p-2 bg-white hover:bg-gray-100 rounded-full transition-colors text-gray-500 shadow-sm border border-gray-100">
                    <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                    <select 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold"
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    >
                      <option value="cookies">Millet Cookies</option>
                      <option value="laddus">Millet Laddus</option>
                      <option value="snacks">Healthy Snacks</option>
                      <option value="grains">Organic Grains</option>
                      <option value="flours">Millet Flours</option>
                      <option value="flakes">Millet Flakes</option>
                      <option value="noodles-pasta">Noodles & Pasta</option>
                      <option value="ready-to-mix">Ready to Mix / Cook</option>
                      <option value="others">Other Products</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Price (₹)</label>
                    <input 
                      type="number" 
                      required
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stock Level</label>
                    <input 
                      type="number" 
                      required
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                   <textarea 
                     required
                     className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold"
                     rows={3}
                     value={editingProduct.description}
                     onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                   />
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Update Product Photo</label>
                     <button 
                       type="button" 
                       onClick={() => setEditingProduct({...editingProduct, images: []})}
                       className="flex items-center space-x-1 text-[10px] font-bold text-red-500 uppercase hover:underline"
                     >
                       <XCircle size={12} />
                       <span>Remove Photo</span>
                     </button>
                   </div>
                   
                   <div className="relative group cursor-pointer" onClick={() => editFileInputRef.current?.click()}>
                     <input 
                       type="file" 
                       ref={editFileInputRef} 
                       className="hidden" 
                       accept="image/*"
                       onChange={(e) => handleFileChange(e, true)}
                     />
                     <div className="w-full h-48 rounded-2xl border-2 border-dashed border-brand-green/20 overflow-hidden bg-gray-50 flex items-center justify-center">
                       {Array.isArray(editingProduct.images) && editingProduct.images[0] ? (
                         <div className="relative w-full h-full">
                           <img 
                             src={editingProduct.images[0]} 
                             alt="Edit Preview" 
                             className="w-full h-full object-cover"
                             onError={(e) => {
                               (e.target as any).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                             }}
                           />
                           <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">Tap to Change File</p>
                           </div>
                         </div>
                       ) : (
                         <div className="text-center p-6">
                            <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                               <ImagePlus size={24} />
                            </div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Select from Gallery</p>
                         </div>
                       )}
                     </div>

                     <div className="mt-3 relative">
                       <input 
                         type="text" 
                         placeholder="New Photo URL..."
                         className="w-full pl-10 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold shadow-sm transition-all"
                         value={Array.isArray(editingProduct.images) ? editingProduct.images[0] || "" : (editingProduct.images || "")}
                         onChange={(e) => setEditingProduct({...editingProduct, images: [e.target.value]})}
                       />
                       <RefreshCw className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                     </div>
                   </div>
                </div>

                <div className="flex items-center space-x-3">
                   <input 
                     type="checkbox" 
                     id="edit_featured"
                     className="w-5 h-5 accent-brand-green"
                     checked={editingProduct.featured}
                     onChange={(e) => setEditingProduct({...editingProduct, featured: e.target.checked})}
                   />
                   <label htmlFor="edit_featured" className="text-sm font-bold text-brand-green">Show in Featured Section (Home Page)</label>
                </div>

                <button 
                  type="submit"
                  disabled={editingSubmitting}
                  className="w-full py-5 bg-brand-green text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-2xl hover:bg-brand-gold transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
                >
                  {editingSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      <Save size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
             <Loader2 className="animate-spin text-brand-gold" size={40} />
             <p className="text-brand-green font-bold animate-pulse">Syncing Inventory...</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">
                    <th className="px-6 py-5">Product Details</th>
                    <th className="px-6 py-5">Category</th>
                    <th className="px-6 py-5">Price</th>
                    <th className="px-6 py-5">Stock Level</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.length > 0 ? products.map((item) => (
                    <tr key={item._id} className="hover:bg-brand-cream/10 transition-colors group">
                      <td className="px-6 py-4 flex items-center space-x-4">
                        <div className="w-12 h-12 bg-brand-green/5 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                           {item.images && item.images.length > 0 && item.images[0] ? (
                              <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                           ) : (
                              <Box size={24} className="text-brand-green opacity-30" />
                           )}
                        </div>
                        <div>
                           <p className="font-bold text-brand-green text-sm">{item.name}</p>
                           <p className="text-[10px] text-gray-400 uppercase tracking-widest">#{item._id.substring(item._id.length - 4)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-600 px-3 py-1 bg-gray-100 rounded-full">{item.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-black text-brand-green">₹{item.price}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                           <div className="flex-grow w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${item.stock < 20 ? 'bg-red-500' : 'bg-brand-green'}`} 
                                   style={{ width: `${Math.min(100, item.stock)}%` }} />
                           </div>
                           <span className="text-xs font-bold text-gray-500">{item.stock}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                          ${item.stock > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                          {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleToggleStock(item._id, item.stock)}
                            title={item.stock > 0 ? "Mark as Out of Stock" : "Mark as In Stock"}
                            className={`p-2 rounded-xl transition-all ${
                              item.stock > 0 
                              ? "text-orange-500 hover:bg-orange-50" 
                              : "text-emerald-500 hover:bg-emerald-50"
                            }`}
                          >
                            {item.stock > 0 ? <PackageX size={18} /> : <PackageCheck size={18} />}
                          </button>
                          <button 
                            onClick={() => setEditingProduct(item)}
                            className="p-2 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-xl transition-all"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item._id, item.name)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No products yet. Start adding items.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
               {products.length > 0 ? products.map((item) => (
                 <div key={item._id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center space-x-4">
                       <div className="w-14 h-14 bg-brand-green/5 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                          {item.images && item.images.length > 0 && item.images[0] ? (
                             <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                             <Box size={24} className="text-brand-green opacity-30" />
                          )}
                       </div>
                       <div className="flex-grow">
                          <p className="font-bold text-brand-green">{item.name}</p>
                          <div className="flex items-center justify-between mt-1">
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-0.5 bg-gray-50 rounded-full">{item.category}</span>
                             <span className="font-black text-brand-green">₹{item.price}</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                       <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Stock Level</span>
                          <span className={`text-xs font-bold ${item.stock < 20 ? 'text-red-500' : 'text-brand-green'}`}>{item.stock} Units</span>
                       </div>
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                          ${item.stock > 0 ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-red-600 bg-red-50 border border-red-100'}`}>
                          {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                       </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                       <button 
                         onClick={() => handleToggleStock(item._id, item.stock)}
                         className={`flex-grow flex items-center justify-center space-x-2 py-3 rounded-2xl font-bold text-xs transition-all ${
                           item.stock > 0 ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"
                         }`}
                       >
                         {item.stock > 0 ? <PackageX size={16} /> : <PackageCheck size={16} />}
                         <span>{item.stock > 0 ? 'Mark OOS' : 'Restock'}</span>
                       </button>
                       <div className="flex items-center space-x-2 ml-2">
                          <button 
                             onClick={() => setEditingProduct(item)}
                             className="p-3 bg-gray-50 text-gray-500 rounded-2xl"
                          >
                             <Edit size={18} />
                          </button>
                          <button 
                             onClick={() => handleDelete(item._id, item.name)}
                             className="p-3 bg-red-50 text-red-500 rounded-2xl"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </div>
                 </div>
               )) : (
                 <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No products yet.</div>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
