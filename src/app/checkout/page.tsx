"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, User, CheckCircle2, ChevronRight, XCircle, Loader2, Minus, Plus } from "lucide-react";
import { 
  calculateDistance, 
  STORE_LOCATION, 
  DELIVERY_RADIUS_KM 
} from "@/utils/distance";
import Footer from "@/components/Footer";

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
    lat: 0,
    lng: 0,
  });
  const [distance, setDistance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cart") || "[]");
    if (items.length === 0) {
      router.push("/cart");
    }
    setCartItems(items);
    setLoading(false);
  }, [router]);

  const updateQuantity = (id: string, delta: number) => {
    const newCart = cartItems.map((item) => {
      if (item._id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const handleGetLocation = () => {
    setCalculating(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setCalculating(false);
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
        
        setFormData({ ...formData, lat: latitude, lng: longitude, pincode: "533001" });
        setDistance(dist);
        setCalculating(false);
        
        if (dist > DELIVERY_RADIUS_KM) {
          setError(`Sorry, we only deliver within ${DELIVERY_RADIUS_KM} km of 9 Nutzz Millets. Your distance: ${dist} km.`);
        }
      },
      (err) => {
        setError(`Unable to retrieve your location: ${err.message}. Please try manual verification.`);
        setCalculating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Manual pincode location bypass
  const handleManualLocation = () => {
    if (formData.pincode.startsWith("533") && formData.pincode.length === 6) {
      // Set a mock location within range
      const mockLat = STORE_LOCATION.lat + 0.02;
      const mockLng = STORE_LOCATION.lng + 0.02;
      setFormData({ ...formData, lat: mockLat, lng: mockLng });
      setDistance(2.5); // 2.5km
      setError(null);
    } else {
      setError("This pincode is outside our 40km delivery radius. We currently only serve the East Godavari region (pincodes starting with 533).");
    }
  };

  const placeOrder = async () => {
    setLoading(true);
    setError(null);

    const orderData = {
      customer: {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        pincode: formData.pincode,
        location: { lat: formData.lat, lng: formData.lng }
      },
      orderItems: cartItems.map(item => ({
        id: item._id,
        name: item.name,
        quantity: item.quantity,
        image: item.images?.[0] || '',
        price: item.price
      })),
      totalPrice: total,
      shippingPrice: shipping,
      payment: {
        method: 'cod',
      },
      distance: distance
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("storage"));
        router.push(`/order-tracking?orderId=${data.orderId}`);
      } else {
        setError(data.message || "Failed to place order. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 0; // Free delivery
  const total = subtotal + shipping;

  if (loading && step !== 3) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-green" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream/10 pt-28 pb-12">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-brand-green mb-10 text-center">Checkout</h1>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Main Checkout Section */}
          <div className="md:col-span-3">
            <div className="space-y-6">
              {/* Step 1: Info */}
              <motion.div 
                className={`bg-white p-8 rounded-3xl shadow-sm border ${step === 1 ? 'border-brand-gold' : 'border-gray-100'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-400'}`}>
                    1
                  </div>
                  <h3 className="text-xl font-bold text-brand-green">Personal Details</h3>
                </div>

                {step === 1 ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-brand-gold outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Phone Number</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-brand-gold outline-none"
                        placeholder="+91 9949131747"
                      />
                    </div>
                    <button 
                      onClick={() => setStep(2)}
                      disabled={!formData.name || !formData.phone}
                      className="w-full py-4 bg-brand-green text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      Next Step
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-brand-green">
                    <p className="font-medium">{formData.name} • {formData.phone}</p>
                    <button onClick={() => setStep(1)} className="text-xs font-bold underline">Edit</button>
                  </div>
                )}
              </motion.div>

              {/* Step 2: Delivery Area Check */}
              <motion.div 
                className={`bg-white p-8 rounded-3xl shadow-sm border ${step === 2 ? 'border-brand-gold' : 'border-gray-100'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-400'}`}>
                    2
                  </div>
                  <h3 className="text-xl font-bold text-brand-green">Delivery Validation</h3>
                </div>

                {step === 2 && (
                  <div className="space-y-6">
                    <p className="text-sm text-gray-500">
                      We only deliver within 40km of our store in East Godavari, Andhra Pradesh. Please allow location access to verify.
                    </p>
                    
                    <button 
                      onClick={handleGetLocation}
                      disabled={calculating}
                      className="w-full py-4 bg-brand-gold text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                    >
                      {calculating ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          <span>Calculating Distance...</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={20} />
                          <span>Get Current Location</span>
                        </>
                      )}
                    </button>

                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Or Use Pincode Verification</p>
                        <input 
                          type="text" 
                          placeholder="Ex: 533344"
                          maxLength={6}
                          value={formData.pincode}
                          onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                          className="flex-grow p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-gold text-sm"
                        />
                        <button 
                          onClick={handleManualLocation}
                          disabled={formData.pincode.length !== 6}
                          className="px-6 py-3 bg-brand-green text-white font-bold rounded-xl text-xs hover:bg-brand-gold transition-colors disabled:opacity-50"
                        >
                          Verify
                        </button>
                      </div>

                    <AnimatePresence>
                      {distance !== null && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className={`p-4 rounded-2xl flex items-start space-x-3 ${distance <= DELIVERY_RADIUS_KM ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}
                        >
                          {distance <= DELIVERY_RADIUS_KM ? (
                            <>
                              <CheckCircle2 className="shrink-0 mt-1" size={18} />
                              <div>
                                <p className="font-bold">You are in delivery zone!</p>
                                <p className="text-sm">Distance: {distance} km. Store is nearby.</p>
                                <div className="mt-4">
                                  <label className="text-xs font-bold uppercase mb-2 block">Delivery Address Details</label>
                                  <textarea 
                                    className="w-full p-3 bg-white border border-emerald-200 rounded-xl outline-none"
                                    placeholder="House No, Landmark, Area..."
                                    rows={3}
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                  />
                                  <button 
                                    onClick={() => setStep(3)}
                                    disabled={!formData.address}
                                    className="w-full py-3 bg-brand-green text-white font-bold rounded-xl shadow-lg mt-4"
                                  >
                                    Review & Pay
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <XCircle className="shrink-0 mt-1" size={18} />
                              <div>
                                <p className="font-bold">Outside Delivery Zone</p>
                                <p className="text-sm">Distance: {distance} km. We currently only deliver within {DELIVERY_RADIUS_KM} km.</p>
                              </div>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {error && (
                      <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 italic">
                        {error}
                      </div>
                    )}
                  </div>
                )}
                
                {step > 2 && (
                  <div className="flex items-center justify-between text-brand-green">
                    <p className="font-medium">In Range • {distance} km away</p>
                    <button onClick={() => setStep(2)} className="text-xs font-bold underline">Change</button>
                  </div>
                )}
              </motion.div>

              {/* Step 3: Payment */}
              <motion.div 
                className={`bg-white p-8 rounded-3xl shadow-sm border ${step === 3 ? 'border-brand-gold' : 'border-gray-100'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-400'}`}>
                    3
                  </div>
                  <h3 className="text-xl font-bold text-brand-green">Payment Mode</h3>
                </div>

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="p-4 border-2 border-brand-green bg-brand-green/5 rounded-2xl flex items-center justify-between">
                       <div className="flex items-center space-x-3 text-brand-green font-bold text-lg">
                          <CheckCircle2 fill="currentColor" className="text-brand-green" />
                          <span>Cash on Delivery (COD)</span>
                       </div>
                       <span className="text-brand-green font-black">PRO</span>
                    </div>

                    <p className="text-xs text-center text-gray-400 font-bold uppercase tracking-widest">
                       Secure Checkout Powered by 9 Nutzz
                    </p>

                    <button 
                      onClick={placeOrder}
                      disabled={loading || (distance !== null && distance > 40)}
                      className="w-full py-5 bg-brand-green text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 className="animate-spin mx-auto" /> : `Place Order (₹${total})`}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Sidebar Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-gold/5 sticky top-28">
               <h3 className="text-xl font-bold text-brand-green mb-6 border-b pb-4">Brief Summary</h3>
               <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-gray-600 font-medium">{item.name}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <button onClick={() => updateQuantity(item._id, -1)} className="p-1 hover:bg-gray-100 rounded text-brand-green"><Minus size={12} /></button>
                          <span className="font-bold text-brand-green text-xs">x{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, 1)} className="p-1 hover:bg-gray-100 rounded text-brand-green"><Plus size={12} /></button>
                        </div>
                      </div>
                      <span className="font-bold text-brand-green">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
               </div>
               
               <div className="space-y-3 pt-4 border-t border-dashed">
                 <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                 </div>
                  <div className="flex justify-between text-sm text-gray-500 items-baseline">
                     <span>Delivery Fee</span>
                     <span className="text-emerald-500 uppercase text-[10px] font-black tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">Free</span>
                  </div>
                 <div className="flex justify-between items-center text-lg font-bold text-brand-green pt-2">
                    <span>Total Amount</span>
                    <span className="text-2xl font-black">₹{total}</span>
                 </div>
               </div>
               
               <div className="mt-8 bg-brand-gold/10 p-4 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-brand-gold tracking-widest text-center mb-1">Estimated Delivery</p>
                  <p className="text-center font-bold text-brand-green">30 - 90 Minutes</p>
               </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
