"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, Clock, MapPin, AlertCircle, RefreshCcw } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Suspense, useState, useEffect } from "react";

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  
  const [status, setStatus] = useState<string>("Pending");
  const [user, setUser] = useState<any>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [trackingInput, setTrackingInput] = useState("");
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Track specific order if ID provided
  useEffect(() => {
    if (orderId) {
       setLoading(true);
       fetch("/api/orders").then(res => res.json()).then(data => {
         const q = orderId.toLowerCase();
         const matches = data.filter((o: any) => 
            o.orderId.toLowerCase() === q ||
            o.customer?.phone?.includes(q) ||
            o.items?.some((item: any) => item.name.toLowerCase().includes(q))
         );

         if (matches.length === 1) {
           setCurrentOrder(matches[0]);
           const s = matches[0].status || "pending";
           setStatus(s.charAt(0).toUpperCase() + s.slice(1));
         } else if (matches.length > 1) {
           setCurrentOrder(null);
           setUserOrders(matches);
         } else {
           setCurrentOrder(null);
         }
         setLoading(false);
       }).catch(err => {
         console.error(err);
         setLoading(false);
       });
    }
  }, [orderId]);

  // Load user data and history if logged in
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    setUser(userData);
    if (userData && !orderId) {
      fetch("/api/orders")
        .then(res => res.json())
        .then(data => {
             const userHistory = data.filter((o: any) => o.customer?.name === userData.name || o.customer?.phone === userData.phone);
             setUserOrders(userHistory);
        })
        .catch(err => console.error(err));
    }
  }, []);

  const steps = [
    { name: "Ordered", icon: <Clock size={24} />, description: "Order received" },
    { name: "Delivered", icon: <CheckCircle size={24} />, description: "Successfully handed over" },
  ];

  const handleTrackSearch = () => {
    if (trackingInput.trim()) {
      window.location.href = `/order-tracking?orderId=${trackingInput.trim()}`;
    }
  };

  const currentStepIndex = status === "Delivered" ? 1 : 0;

  if (!orderId) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <AlertCircle size={80} className="text-brand-gold mb-6" />
        <h2 className="text-2xl font-black text-brand-green mb-4">No order found</h2>
        <p className="text-gray-500 mb-8 max-w-md">Please enter your order ID or phone number to track your delicious 9 Nutzz order.</p>
        <div className="flex bg-white p-2 rounded-2xl shadow-lg w-full max-w-sm border border-brand-gold/10">
           <input 
             type="text" 
             placeholder="Enter Order ID, Phone or Item..." 
             className="bg-transparent flex-grow px-4 outline-none text-sm" 
             value={trackingInput}
             onChange={(e) => setTrackingInput(e.target.value)}
             onKeyPress={(e) => e.key === 'Enter' && handleTrackSearch()}
           />
           <button 
             onClick={handleTrackSearch}
             className="px-6 py-3 bg-brand-green text-white font-bold rounded-xl shadow-md"
           >
             Track
           </button>
        </div>
        
        
        {userOrders.length > 0 && (
          <div className="mt-10 text-left w-full max-w-sm">
             <h3 className="font-bold text-sm text-brand-green uppercase tracking-widest mb-3 text-center">{orderId && userOrders.length > 0 ? "Matching Orders" : "Your Recent Orders"}</h3>
             <div className="space-y-4">
               {userOrders.slice(0, 10).map((o: any) => (
                  <Link href={`/order-tracking?orderId=${o.orderId}`} key={o._id} className="block p-5 bg-white border border-brand-gold/20 rounded-2xl shadow-md hover:shadow-lg hover:border-brand-gold transition-all">
                     <div className="flex justify-between items-center mb-1">
                        <p className="font-black text-brand-green text-sm">{o.orderId}</p>
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${o.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                           {o.status}
                        </span>
                     </div>
                     <div className="mb-3">
                        <p className="text-[10px] font-black text-brand-gold uppercase tracking-wider">{o.customer?.name}</p>
                        <p className="text-xs text-gray-500 font-medium">{new Date(o.createdAt).toLocaleDateString()} • ₹{o.payment?.totalAmount || '0'}</p>
                     </div>
                     
                     <div className="space-y-1.5 mt-3 pt-3 border-t border-gray-100">
                        {o.items?.map((item: any, i: number) => (
                           <div key={i} className="flex justify-between text-[11px] text-gray-600">
                              <span className="font-medium truncate pr-4">{item.quantity}x {item.name}</span>
                              <span className="font-bold text-gray-400">₹{item.price * item.quantity}</span>
                           </div>
                        ))}
                     </div>
                  </Link>
               ))}
             </div>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
     return (
       <div className="py-32 flex flex-col items-center justify-center">
         <RefreshCcw className="animate-spin text-brand-gold mb-4" size={40} />
         <p className="text-brand-green font-bold animate-pulse uppercase tracking-widest text-xs">Locating your order...</p>
       </div>
     );
  }

  return (
    <div className="py-20 md:py-32 container mx-auto px-4 md:px-8 max-w-4xl min-h-[80vh]">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-brand-gold/5 relative overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-bl-[100px] -z-0" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-bold text-brand-gold uppercase tracking-[0.2em] mb-2">Live Tracking</p>
              <h2 className="text-3xl font-black text-brand-green">Order #{orderId}</h2>
              <p className="text-sm text-gray-500 mt-1 italic">Order will be delivered as soon as possible</p>
            </div>
            <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center animate-pulse">
                 <Truck size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none mb-1">Status</p>
                <p className="font-bold text-emerald-900 leading-none">{status}</p>
              </div>
            </div>
          </div>

          {/* Tracking Pipeline */}
          <div className="relative mt-16 mb-20 px-10">
            {/* Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0 hidden md:block" />
            <div className="absolute top-1/2 left-0 h-1 bg-brand-green -translate-y-1/2 z-0 hidden md:block transition-all duration-1000" 
                 style={{ width: `${Math.max(0, currentStepIndex) / (steps.length - 1) * 100}%` }} />
            
            <div className="grid md:grid-cols-4 gap-12 relative z-10">
              {steps.map((step, idx) => {
                const isActive = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                
                return (
                  <div key={step.name} className="flex flex-col items-center">
                    <motion.div 
                      initial={false}
                      animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 transition-all duration-500
                        ${isActive ? 'bg-brand-green text-white border-white' : 'bg-white text-gray-300 border-gray-100'}`}
                    >
                      {step.icon}
                    </motion.div>
                    <div className="mt-4 text-center">
                      <p className={`font-bold text-sm ${isActive ? 'text-brand-green' : 'text-gray-300'}`}>{step.name}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {currentOrder && (
            <div className="mt-12 mb-12">
               <h3 className="text-xl font-black text-brand-green mb-6 uppercase tracking-tighter">Ordered Items</h3>
               <div className="space-y-4">
                  {currentOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                       <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-gray-200 p-1">
                             <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                          </div>
                          <div>
                            <p className="font-bold text-brand-green">{item.name}</p>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Qty: {item.quantity}</p>
                          </div>
                       </div>
                       <p className="font-black text-brand-green">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
               </div>
               
               <div className="mt-8 p-6 bg-brand-green/5 rounded-3xl border border-brand-green/10">
                  <div className="flex justify-between text-sm mb-2">
                     <span className="text-gray-500 font-medium">Payment Status</span>
                     <span className={`font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded ${currentOrder.payment?.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {currentOrder.payment?.status}
                     </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                     <span className="text-gray-500 font-medium">Payment Method</span>
                     <span className="text-brand-green font-bold uppercase text-[10px] tracking-widest">{currentOrder.payment?.method}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-brand-green/10">
                     <span className="font-black text-brand-green uppercase tracking-tighter">Total Paid</span>
                     <span className="text-2xl font-black text-brand-green">₹{currentOrder.payment?.totalAmount}</span>
                  </div>
               </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 pt-10 border-t border-dashed">
            <div className="flex items-start space-x-4">
               <div className="p-3 bg-brand-green/10 text-brand-green rounded-xl">
                  <MapPin size={24} />
               </div>
               <div>
                 <p className="text-xs font-bold text-gray-400 uppercase mb-1">Delivery Address</p>
                 <p className="text-brand-green font-bold text-sm truncate max-w-[200px]">{currentOrder.customer?.name}</p>
                 <p className="text-brand-green font-medium text-xs leading-relaxed">{currentOrder.customer?.address}, {currentOrder.customer?.pincode}</p>
                 <p className="text-brand-green font-bold text-xs mt-1">{currentOrder.customer?.phone}</p>
               </div>
            </div>
            <div className="flex items-start space-x-4">
               <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-xl">
                  <Clock size={24} />
               </div>
               <div>
                 <p className="text-xs font-bold text-gray-400 uppercase mb-1">Estimated Time</p>
                 <p className="text-brand-green font-medium">Coming Soon</p>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
          <Link href="/shop" className="px-10 py-4 bg-brand-green text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all">
              Order More Delights
          </Link>
          <div className="mt-6">
            <p className="text-sm text-gray-500">Need help? <Link href="/contact" className="text-brand-gold font-bold underline">Contact Support</Link></p>
          </div>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <div className="min-h-screen bg-brand-cream/10 pt-10">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Tracking...</div>}>
         <OrderTrackingContent />
      </Suspense>
      <Footer />
    </div>
  );
}
