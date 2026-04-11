"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, Clock, MapPin, AlertCircle } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Suspense, useState, useEffect } from "react";

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  
  const [status, setStatus] = useState<string>("Pending");
  const [user, setUser] = useState<any>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  
  // Track specific order if ID provided
  useEffect(() => {
    if (orderId) {
       // Mock progression or we could fetch the specific order here
       setStatus("Pending");
       
       // If we want real status:
       fetch("/api/orders").then(res => res.json()).then(data => {
         const specificOrder = data.find((o: any) => o.orderId === orderId);
         if (specificOrder) {
           setStatus(specificOrder.status.charAt(0).toUpperCase() + specificOrder.status.slice(1));
         }
       });
    }
  }, [orderId]);

  // Load user data and history if logged in
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    setUser(userData);
    if (userData) {
      fetch("/api/orders")
        .then(res => res.json())
        .then(data => {
             const userHistory = data.filter((o: any) => o.customer?.name === userData.name);
             setUserOrders(userHistory);
        })
        .catch(err => console.error(err));
    }
  }, []);

  const steps = [
    { name: "Pending", icon: <Clock size={24} />, description: "Order received" },
    { name: "Packed", icon: <Package size={24} />, description: "Quality check passed" },
    { name: "Out for Delivery", icon: <Truck size={24} />, description: "Nearby your location" },
    { name: "Delivered", icon: <CheckCircle size={24} />, description: "Successfully handed over" },
  ];

  const currentStepIndex = steps.findIndex(s => s.name === status);

  if (!orderId) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <AlertCircle size={80} className="text-brand-gold mb-6" />
        <h2 className="text-2xl font-black text-brand-green mb-4">No order found</h2>
        <p className="text-gray-500 mb-8 max-w-md">Please enter your order ID or phone number to track your delicious 9 Nutzz order.</p>
        <div className="flex bg-white p-2 rounded-2xl shadow-lg w-full max-w-sm border border-brand-gold/10">
           <input type="text" placeholder="Enter Order ID (e.g. ORD-123)" className="bg-transparent flex-grow px-4 outline-none" />
           <button className="px-6 py-3 bg-brand-green text-white font-bold rounded-xl shadow-md">Track</button>
        </div>
        
        {user && userOrders.length > 0 && (
          <div className="mt-10 text-left w-full max-w-sm">
             <h3 className="font-bold text-sm text-brand-green uppercase tracking-widest mb-3 text-center">Your Recent Orders</h3>
             <div className="space-y-3">
               {userOrders.slice(0, 3).map((o: any) => (
                  <Link href={`/order-tracking?orderId=${o.orderId}`} key={o._id} className="block p-4 bg-white border border-brand-gold/20 rounded-2xl shadow-sm hover:shadow-md hover:border-brand-gold transition-all">
                     <div className="flex justify-between items-center mb-1">
                        <p className="font-black text-brand-green text-sm">{o.orderId}</p>
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${o.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                           {o.status}
                        </span>
                     </div>
                     <p className="text-xs text-gray-500 font-medium">{new Date(o.createdAt).toLocaleDateString()} • ₹{o.payment?.totalAmount || '0'}</p>
                  </Link>
               ))}
             </div>
          </div>
        )}
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
              <p className="text-sm text-gray-500 mt-1 italic">Order will be delivered in 30-60 mins</p>
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
                 style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }} />
            
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

          <div className="grid md:grid-cols-2 gap-8 pt-10 border-t border-dashed">
            <div className="flex items-start space-x-4">
               <div className="p-3 bg-brand-green/10 text-brand-green rounded-xl">
                  <MapPin size={24} />
               </div>
               <div>
                 <p className="text-xs font-bold text-gray-400 uppercase mb-1">Delivery Location</p>
                 <p className="text-brand-green font-medium">Verified Address within 20km zone.</p>
               </div>
            </div>
            <div className="flex items-start space-x-4">
               <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-xl">
                  <Clock size={24} />
               </div>
               <div>
                 <p className="text-xs font-bold text-gray-400 uppercase mb-1">Estimated Time</p>
                 <p className="text-brand-green font-medium">30 - 45 Minutes From Now</p>
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
