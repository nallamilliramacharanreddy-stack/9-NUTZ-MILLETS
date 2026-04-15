"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { 
  Search, Star, ChevronRight, Package, 
  MapPin, MessageSquare, Download, AlertCircle, RefreshCcw,
  CreditCard, Info
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { Suspense, useState, useEffect, useMemo } from "react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  _id: string;
  orderId: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    pincode: string;
  };
  items: OrderItem[];
  payment: {
    method: string;
    status: string;
    totalAmount: number;
    surcharge?: number;
  };
  status: string;
  createdAt: string;
}

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [trackingInput, setTrackingInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch User Orders on mount
  useEffect(() => {
    let isMounted = true;
    
    fetch("/api/orders", { credentials: "include" })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
        return data as Order[];
      })
      .then(data => {
        if (isMounted) {
          setUserOrders(Array.isArray(data) ? data : []);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("Fetch Error:", err);
          setError(err.message || "Something went wrong while fetching your orders.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // 2. Derive currentOrder and status using useMemo to satisfy linter
  const { currentOrder, status, searchError } = useMemo(() => {
    if (!orderId) return { currentOrder: null, status: "Pending", searchError: null };
    
    const q = orderId.toLowerCase();
    const match = userOrders.find((o: Order) => 
      o.orderId.toLowerCase() === q ||
      o.customer?.phone?.includes(q) ||
      o.customer?.email?.toLowerCase() === q
    );

    if (match) {
      const s = match.status || "pending";
      return { 
        currentOrder: match, 
        status: s.charAt(0).toUpperCase() + s.slice(1), 
        searchError: null 
      };
    }

    // Only show "Order not found" if we've actually loaded orders
    return { 
      currentOrder: null, 
      status: "Pending", 
      searchError: !loading ? "Order not found. Please check the ID or try searching with your phone number." : null 
    };
  }, [orderId, userOrders, loading]);

  const handleTrackSearch = () => {
    if (trackingInput.trim()) {
      router.push(`/order-tracking?orderId=${trackingInput.trim()}`);
    }
  };

  const currentStepIndex = status === "Delivered" ? 1 : 0;
  
  const steps = [
    { name: "Ordered", date: currentOrder ? new Date(currentOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : "" },
    { name: "Delivered", date: status === "Delivered" ? "Today" : "" },
  ];

  const displayError = error || searchError;

  if (loading && userOrders.length === 0) {
     return (
       <div className="py-32 flex flex-col items-center justify-center bg-gray-50 min-h-screen">
         <RefreshCcw className="animate-spin text-brand-gold mb-4" size={40} />
         <p className="text-brand-green font-bold animate-pulse uppercase tracking-widest text-xs">Locating your order matches...</p>
       </div>
     );
  }

  // LIST VIEW: ALL ORDERS
  if (!orderId) {
    return (
      <div className="bg-gray-50 min-h-screen pb-20">
        <div className="max-w-5xl mx-auto px-4 pt-10">
          <div className="flex bg-white items-center rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
            <input 
              type="text" 
              placeholder="Search your orders here" 
              className="flex-grow px-6 py-4 outline-none text-gray-700 bg-transparent text-sm" 
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTrackSearch()}
            />
            <button 
              onClick={handleTrackSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 font-bold flex items-center space-x-2 transition-colors"
            >
              <Search size={18} />
              <span className="hidden sm:inline">Search Orders</span>
            </button>
          </div>

          <div className="space-y-4">
            {userOrders.length > 0 ? (
              userOrders.map((o: Order) => (
                <Link 
                  key={o._id} 
                  href={`/order-tracking?orderId=${o.orderId}`}
                  className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow relative group"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Item Images - Show first item or product preview */}
                    <div className="w-24 h-24 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100 relative">
                      <Image 
                        src={o.items?.[0]?.image || "/placeholder.png"} 
                        alt={o.items?.[0]?.name} 
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800 line-clamp-1 mb-1">
                            {o.items?.length > 1 ? `${o.items[0].name} + ${o.items.length - 1} more items` : o.items?.[0]?.name}
                          </h3>
                          <p className="text-xs text-gray-400 font-medium">Order ID: #{o.orderId}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{o.payment?.totalAmount}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${o.status === 'delivered' ? 'bg-green-500' : 'bg-orange-500'}`} />
                          <p className="text-sm font-bold text-gray-700">
                            {o.status === 'delivered' ? `Delivered on ${new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : `Status: ${o.status.charAt(0).toUpperCase() + o.status.slice(1)}`}
                          </p>
                        </div>
                        
                        <div className="mt-4 sm:mt-0 flex items-center text-blue-600 font-bold text-sm hover:underline">
                          <Star size={14} className="mr-2" />
                          Rate & Review Product
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-20">
                <Package size={60} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-500">No orders found</h3>
                <p className="text-gray-400">You haven&apos;t placed any orders yet. Start your shopping journey today!</p>
                <Link href="/shop" className="inline-block mt-6 px-8 py-3 bg-brand-green text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all">
                   Shop Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // DETAIL VIEW: TRACKING
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        {/* Breadcrumbs */}
        <div className="flex items-center text-[11px] text-gray-400 font-medium mb-8 space-x-2">
           <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
           <ChevronRight size={10} />
           <Link href="/admin" className="hover:text-blue-600 transition-colors">My Account</Link>
           <ChevronRight size={10} />
           <Link href="/order-tracking" className="hover:text-blue-600 transition-colors">My Orders</Link>
           <ChevronRight size={10} />
           <span className="text-gray-600 font-bold">{orderId}</span>
        </div>

        {displayError ? (
          <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-red-100 max-w-2xl mx-auto">
             <AlertCircle size={60} className="mx-auto text-red-500 mb-4" />
             <h2 className="text-2xl font-black text-gray-800 mb-2">Order Not Found</h2>
             <p className="text-gray-500 mb-8">{displayError}</p>
             <Link 
                href="/order-tracking"
                className="inline-block px-8 py-3 bg-brand-green text-white font-bold rounded-lg"
             >
                Go to My Orders
             </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Column: Tracking and Items */}
            <div className="lg:col-span-8 space-y-4">
              {/* Order Info Bar */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-wrap justify-between items-center gap-4">
                 <div>
                    <h1 className="text-lg font-bold text-gray-800 mb-1">Order Details for #{orderId}</h1>
                    <p className="text-xs text-gray-400 font-medium">Tracking can be done via Order Details Section.</p>
                 </div>
              </div>

              {/* Status & Timeline */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                 <div className="flex flex-col md:flex-row gap-12">
                    {/* Item Snapshot */}
                    <div className="flex gap-4 min-w-[300px]">
                       <div className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-100 overflow-hidden relative">
                          <Image 
                            src={currentOrder?.items?.[0]?.image || "/placeholder.png"} 
                            alt={currentOrder?.items?.[0]?.name || "Product"}
                            fill
                            className="object-cover" 
                          />
                       </div>
                       <div>
                          <h3 className="font-bold text-sm text-gray-800 line-clamp-2 leading-tight mb-2">
                             {currentOrder?.items?.[0]?.name} {currentOrder?.items && currentOrder.items.length > 1 && `+ ${currentOrder.items.length - 1} more items`}
                          </h3>
                          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-2">Seller: 9 Nutzz Millets</p>
                          <p className="font-extrabold text-lg text-gray-900">₹{currentOrder?.payment?.totalAmount}</p>
                       </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex-grow">
                        <div className="relative pl-12 space-y-12">
                           {/* Connecting Line */}
                           <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-100 transition-all duration-1000 overflow-hidden">
                              <div 
                                 className="w-full bg-green-500 transition-all duration-1000" 
                                 style={{ height: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                              />
                           </div>

                           {steps.map((step, idx) => {
                              const isActive = idx <= currentStepIndex;
                              const isCurrent = idx === currentStepIndex;

                              return (
                                 <div key={idx} className="relative">
                                    <div className={`absolute -left-12 w-12 flex justify-center z-10 
                                      ${isCurrent ? 'animate-pulse' : ''}`}>
                                       <div className={`w-4 h-4 rounded-full border-2 transition-all duration-500 ${isActive ? 'bg-green-500 border-green-200' : 'bg-white border-gray-200'}`}>
                                          {isActive && <div className="w-full h-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full" /></div>}
                                       </div>
                                    </div>
                                    <div>
                                       <div className="flex items-center space-x-3 mb-1">
                                          <p className={`font-bold text-sm ${isActive ? 'text-gray-800' : 'text-gray-300'}`}>{step.name}</p>
                                          {step.date && <p className="text-xs text-brand-gold font-bold">{step.date}</p>}
                                       </div>
                                       {isActive && isCurrent && (
                                          <p className="text-[11px] text-gray-400 font-medium italic">Your item has been {idx === 0 ? "ordered" : "delivered"}.</p>
                                       )}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                        
                    </div>
                 </div>
                 
              </div>
            </div>

            {/* Right Column: Sidebars */}
            <div className="lg:col-span-4 space-y-4">
               {/* Delivery Details */}
               <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-[0.1em]">Delivery details</h3>
                  <div className="space-y-6">
                     <div className="flex items-start space-x-3">
                        <MapPin size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                           <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Shipping Address</p>
                           <p className="text-sm font-bold text-gray-800">{currentOrder?.customer?.name}</p>
                           <p className="text-sm text-gray-500 leading-relaxed font-medium mt-1">
                              {currentOrder?.customer?.address}, {currentOrder?.customer?.pincode}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-start space-x-3">
                        <div className="w-[18px] flex-shrink-0" /> {/* Spacer */}
                        <div>
                           <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Contact Details</p>
                           <p className="text-sm font-bold text-gray-800">{currentOrder?.customer?.phone}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Price Details */}
               <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-[0.1em]">Price details</h3>
                  <div className="space-y-4 text-sm">
                     <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Listing price</span>
                        <span className="font-bold text-gray-800">₹{Math.round((currentOrder?.payment?.totalAmount || 0) * 1.5)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                           <span className="text-gray-500 font-medium">Special price</span>
                           <Info size={14} className="text-gray-300" />
                        </div>
                        <span className="font-bold text-gray-800">₹{currentOrder?.payment?.totalAmount}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                           <span className="text-gray-500 font-medium">Total fees</span>
                           <ChevronRight size={14} className="text-gray-300 rotate-90" />
                        </div>
                        <span className="font-bold text-gray-800">₹{currentOrder?.payment?.surcharge || 29}</span>
                     </div>
                     
                     <div className="pt-4 border-t border-dashed border-gray-100 mt-4 flex justify-between items-end">
                        <span className="text-base font-bold text-gray-800">Total amount</span>
                        <div className="text-right">
                           <p className="text-xl font-black text-gray-900 leading-none">₹{currentOrder?.payment?.totalAmount}</p>
                        </div>
                     </div>

                     <div className="bg-gray-50 p-4 rounded-xl mt-6 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                           <CreditCard size={18} className="text-gray-400" />
                           <span className="text-xs font-bold text-gray-600">Paid By</span>
                        </div>
                        <span className="text-xs font-black text-brand-green uppercase tracking-widest">{currentOrder?.payment?.method || "Cash On Delivery"}</span>
                     </div>

                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-28 md:pt-36">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-brand-green animate-pulse">Loading tracking details...</div>}>
         <OrderTrackingContent />
      </Suspense>
      <Footer />
    </div>
  );
}
