"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Star, ArrowLeft, ShieldCheck, Truck, RefreshCcw, Minus, Plus, MessageCircle, AlertCircle, X, CreditCard, Banknote, User, Phone, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import Footer from "@/components/Footer";
import { calculateDistance, STORE_LOCATION, DELIVERY_RADIUS_KM } from "@/utils/distance";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function ProductDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  // Checkout State
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod] = useState<'cod' | 'phonepe'>('cod');
  const [orderStatus, setOrderStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    altPhone: '',
    address: ''
  });

  // Location Verification
  const [distance, setDistance] = useState<number | null>(null);
  const [validatingLocation, setValidatingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [manualPincode, setManualPincode] = useState("");

  const handleGetLocation = () => {
    setValidatingLocation(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Location is not supported by your browser");
      setValidatingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const dist = calculateDistance(
          STORE_LOCATION.lat,
          STORE_LOCATION.lng,
          latitude,
          longitude
        );
        
        setDistance(dist);
        setValidatingLocation(false);
        
        if (dist > DELIVERY_RADIUS_KM) {
          setLocationError(`Notice: You are ${dist}km away. We currently deliver within ${DELIVERY_RADIUS_KM}km of our store.`);
        } else {
          setLocationError(null);
        }
      },
      (err) => {
        let msg = "Could not get your location.";
        if (err.code === 1) msg = "Location permission denied. Please allow location access or use manual pincode.";
        else if (err.code === 2) msg = "Location unavailable. Please check your GPS signal.";
        else if (err.code === 3) msg = "Location request timed out. Please try again or use manual pincode.";
        
        setLocationError(msg);
        setValidatingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleManualLocation = () => {
    if (manualPincode.startsWith("533") && manualPincode.length === 6) {
      setDistance(5); // Treat as within range
      setLocationError(null);
    } else {
      setLocationError("Sorry, this pincode is outside our 40km delivery radius.");
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) {
          setError(res.status === 404 ? "Product not found" : "Failed to load product details");
          return;
        }
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  const isOutOfStock = product && product.stock !== undefined && product.stock <= 0;

  const codSurcharge = 0;
  const subtotal = product ? product.price * quantity : 0;
  const total = subtotal;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderStatus('processing');

    try {
      const orderData = {
        customer: {
          name: formData.fullName,
          phone: formData.phone,
          altPhone: formData.altPhone,
          address: formData.address,
          pincode: manualPincode || "533001",
        },
        orderItems: [{
          id: product._id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image: product.images?.[0]
        }],
        payment: {
          method: paymentMethod,
          surcharge: paymentMethod === 'cod' ? codSurcharge : 0,
        },
        totalPrice: total
      };

      // 1. Initialize Order in Backend (and create Razorpay Order if PhonePe)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to initialize order.");
        setOrderStatus('idle');
        return;
      }

      // 2. Handle Payment Method Branching
      if (paymentMethod === 'phonepe') {
        const options = {
          key: data.key,
          amount: Math.round(total * 100),
          currency: "INR",
          name: "9 Nutzz Millets",
          description: `Order for ${product.name}`,
          order_id: data.razorpayOrderId,
          handler: function (response: any) {
            // Payment success!
            setOrderStatus('success');
            setTimeout(() => {
              setShowCheckout(false);
              setOrderStatus('idle');
              router.push('/shop');
            }, 3000);
          },
          prefill: {
            name: formData.fullName,
            contact: formData.phone,
          },
          theme: {
            color: "#0B4232", // Brand Green
          },
          modal: {
            ondismiss: function() {
              setOrderStatus('idle');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // COD Success immediately (internal order already saved as pending)
        setOrderStatus('success');
        setTimeout(() => {
          setShowCheckout(false);
          setOrderStatus('idle');
          router.push('/shop');
        }, 3000);
      }
    } catch (err) {
      alert("Something went wrong. Check your connection.");
      setOrderStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-brand-green font-bold animate-pulse">Loading delicious millets...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 p-8 rounded-3xl text-center max-w-md border border-red-100 shadow-sm">
           <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
           <h2 className="text-2xl font-black text-brand-green mb-2">{error || "Product Not Found"}</h2>
           <Link href="/shop" className="inline-flex items-center space-x-2 bg-brand-green text-white px-8 py-4 rounded-2xl font-bold">
              <ArrowLeft size={20} />
              <span>Back to Shop</span>
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-8 py-28 max-w-6xl">
        <Link href="/shop" className="flex items-center space-x-2 text-brand-green font-bold mb-8 hover:text-brand-gold transition-colors">
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
             <div className="aspect-square bg-brand-cream/30 rounded-3xl overflow-hidden flex items-center justify-center p-6 sm:p-12 border border-brand-gold/5 shadow-inner relative">
                {product.images?.[0] ? (
                   <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="text-center">
                    <span className="text-4xl sm:text-6xl font-black text-brand-green/20 uppercase tracking-tighter opacity-50 rotate-[-10deg] block">
                       {product.name}
                    </span>
                  </div>
                )}
             </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
               <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full">{product.category}</span>
               <div className="flex items-center text-amber-400">
                  <Star size={12} fill="currentColor" />
                  <span className="text-xs sm:text-sm font-bold ml-1 text-gray-700">{product.rating}</span>
               </div>
               <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${isOutOfStock ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                  <span>{isOutOfStock ? 'Out of Stock' : 'In Stock'}</span>
               </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-brand-green mb-4 leading-tight text-center md:text-left">{product.name}</h1>
            <p className="text-sm sm:text-base text-gray-500 mb-8 leading-relaxed text-center md:text-left">{product.description}</p>
            
            <div className="flex items-center justify-center md:justify-start gap-4 mb-10">
               <span className="text-3xl sm:text-4xl font-black text-brand-green">₹{product.price}</span>
               {product.discountPrice && (
                 <span className="text-lg sm:text-xl text-gray-400 line-through">₹{product.discountPrice}</span>
               )}
            </div>

            <div className="flex flex-col space-y-6 mb-10">
               <div className="flex items-center justify-center md:justify-start space-x-4 bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 w-full sm:w-fit mx-auto md:mx-0">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-brand-green hover:bg-white rounded-lg transition-colors"><Minus size={18} /></button>
                  <span className="font-black text-brand-green text-lg w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-brand-green hover:bg-white rounded-lg transition-colors"><Plus size={18} /></button>
               </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button 
                    onClick={() => !isOutOfStock && setShowCheckout(true)}
                    disabled={isOutOfStock}
                    className="flex-grow py-4 px-6 font-black rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 uppercase tracking-widest text-sm bg-brand-gold text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>{isOutOfStock ? 'Unavailable' : 'Buy Now'}</span>
                  </button>
                  <button 
                    disabled={isOutOfStock}
                    onClick={() => {
                      if (isOutOfStock) return;
                      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
                      const existingIndex = cart.findIndex((item: any) => item._id === product._id);
                      if (existingIndex > -1) {
                        cart[existingIndex].quantity += quantity;
                      } else {
                        cart.push({ ...product, quantity });
                      }
                      localStorage.setItem("cart", JSON.stringify(cart));
                      window.dispatchEvent(new Event("storage"));
                      alert("Product added to cart!");
                    }}
                    className="flex-grow py-4 px-6 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 text-sm bg-brand-green text-white disabled:bg-gray-50 disabled:text-gray-300 disabled:shadow-none hover:bg-brand-green/90"
                  >
                    <ShoppingCart size={18} />
                    <span>Add to Cart</span>
                  </button>
               </div>
            </div>

            <button 
               onClick={() => {
                 const message = encodeURIComponent(`Hi, I'm interested in "${product.name}". Could you provide more details?`);
                 window.open(`https://wa.me/919949131747?text=${message}`, '_blank');
               }}
               className="w-full py-4 border-2 border-green-500 text-green-600 font-bold rounded-2xl flex items-center justify-center space-x-2 hover:bg-green-50 transition-all mb-12"
            >
               <MessageCircle size={20} />
               <span>Inquiry on WhatsApp</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Checkout Drawer */}
      <AnimatePresence>
        {showCheckout && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckout(false)}
              className="fixed inset-0 bg-brand-green/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b flex items-center justify-between bg-brand-cream/20">
                <h2 className="text-2xl font-black text-brand-green">Checkout Order</h2>
                <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                  <X size={24} className="text-brand-green" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6">
                {orderStatus === 'success' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <CheckCircle2 size={48} />
                    </div>
                    <h3 className="text-3xl font-black text-brand-green">Order Placed!</h3>
                    <p className="text-gray-500">Thank you for choosing 9 Nutzz. Your healthy treats are on the way.</p>
                  </div>
                ) : (
                  <form onSubmit={handleCheckout} className="space-y-8">
                    {/* Delivery Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-brand-gold">
                        <User size={20} />
                        <h3 className="font-bold uppercase tracking-widest text-sm">Delivery Information</h3>
                      </div>
                      <div className="grid gap-4">
                        <div className="relative">
                          <input 
                            required
                            type="text" 
                            name="fullName"
                            placeholder="Full Name" 
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input 
                            required
                            type="tel" 
                            name="phone"
                            placeholder="Phone Number" 
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                          />
                          <input 
                            type="tel" 
                            name="altPhone"
                            placeholder="Alt Phone (Optional)" 
                            value={formData.altPhone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                          />
                        </div>
                        <textarea 
                          required
                          name="address"
                          placeholder="Complete Shipping Address (Flat, Street, Area, Pincode)" 
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-gold outline-none transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-brand-gold">
                        <Banknote size={20} />
                        <h3 className="font-bold uppercase tracking-widest text-sm">Payment Method</h3>
                      </div>
                      <div className="p-4 border border-brand-gold bg-brand-gold/5 rounded-2xl">
                          <span className="font-bold text-brand-green">Cash on Delivery (COD)</span>
                          <p className="text-xs text-brand-gold font-bold italic">No extra charges applied</p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-6 bg-brand-green text-white rounded-3xl space-y-4 shadow-xl">
                       <div className="flex justify-between items-center text-sm font-medium opacity-80">
                         <span>{product.name}</span>
                         <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-1">
                            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:bg-white/10 rounded"><Minus size={14} /></button>
                            <span className="font-bold w-4 text-center">{quantity}</span>
                            <button type="button" onClick={() => setQuantity(quantity + 1)} className="p-1 hover:bg-white/10 rounded"><Plus size={14} /></button>
                         </div>
                       </div>
                       <div className="flex justify-between text-sm font-medium opacity-80">
                         <span>Item Price</span>
                         <span>₹{subtotal}</span>
                       </div>
                       <div className="flex justify-between text-sm font-medium opacity-80 items-baseline">
                         <span>Delivery & COD Handling</span>
                         <span className="text-emerald-300 uppercase text-[10px] font-black tracking-widest bg-emerald-500/20 px-2 py-0.5 rounded-md">Free</span>
                       </div>
                       <div className="pt-4 border-t border-white/20 flex justify-between items-end">
                         <span className="font-bold uppercase tracking-widest text-xs">Final Amount</span>
                         <span className="text-3xl font-black">₹{total}</span>
                       </div>

                       {/* Location Step */}
                       <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                          {(!distance || distance > DELIVERY_RADIUS_KM) ? (
                            <div className="space-y-4">
                              <button 
                                type="button"
                                onClick={handleGetLocation}
                                disabled={validatingLocation}
                                className="w-full py-4 bg-white text-brand-green font-bold rounded-2xl flex items-center justify-center space-x-2"
                              >
                                {validatingLocation ? <Loader2 className="animate-spin" size={20} /> : <MapPin size={20} />}
                                <span>Verify Location via GPS</span>
                              </button>

                              <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-white/20"></div>
                                <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">OR</span>
                                <div className="flex-grow border-t border-white/20"></div>
                              </div>

                              <div className="bg-white/10 p-5 rounded-2xl border border-white/10 space-y-3">
                                <label className="text-[10px] uppercase font-black tracking-widest opacity-60 block">Manually Enter Pincode</label>
                                <div className="flex gap-2">
                                   <input 
                                     type="text" 
                                     placeholder="Ex: 533341"
                                     maxLength={6}
                                     value={manualPincode}
                                     onChange={(e) => setManualPincode(e.target.value)}
                                     className="flex-grow bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-brand-gold text-sm font-bold"
                                   />
                                   <button 
                                     type="button"
                                     onClick={handleManualLocation}
                                     className="px-6 py-3 bg-brand-gold text-white text-xs font-black rounded-xl uppercase tracking-widest hover:scale-105 transition-transform"
                                   >
                                     Verify
                                   </button>
                                </div>
                                {locationError && (
                                  <motion.p 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="text-[10px] text-red-400 font-bold uppercase tracking-wider mt-2 flex items-center gap-1.5"
                                  >
                                    <AlertCircle size={10} />
                                    <span>{locationError}</span>
                                  </motion.p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-emerald-300 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                               <div className="flex items-center space-x-2">
                                  <CheckCircle2 size={16} />
                                  <span>In Range ({distance} km)</span>
                               </div>
                               <button type="button" onClick={() => {setDistance(null); setManualPincode("");}} className="underline decoration-emerald-300/30 underline-offset-4">Change</button>
                            </div>
                          )}
                       </div>
                       
                       <button 
                         type="submit"
                         disabled={orderStatus === 'processing' || !distance || distance > DELIVERY_RADIUS_KM}
                         className="w-full py-4 bg-brand-gold text-white font-black rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 uppercase tracking-widest mt-4"
                       >
                         {orderStatus === 'processing' ? (
                           <div className="flex items-center justify-center space-x-2">
                             <Loader2 className="animate-spin" size={20} />
                             <span>Processing...</span>
                           </div>
                         ) : 'Complete Purchase'}
                       </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <RefreshCcw className={className} size={size} />
);
