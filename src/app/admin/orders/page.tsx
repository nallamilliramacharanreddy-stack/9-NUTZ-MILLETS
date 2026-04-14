"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListOrdered, Search, Filter, MoreVertical, CheckCircle, Clock, Truck, Package, XCircle, Loader2, MapPin, DollarSign, Check, Trash2, ChevronDown, ChevronUp, Eye, ShoppingCart, MapPinned } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (res.ok) setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const markAsDelivered = async (id: string) => {
    if (updatingId) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" })
      });
      const data = await res.json();
      
      if (res.ok) {
        setOrders(orders.map(o => o._id === id ? { ...o, status: "delivered", payment: { ...o.payment, status: "completed" } } : o));
        alert("✅ Order Marked as Delivered Successfully!");
      } else {
        alert(`❌ Failed: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      alert("❌ Error communicating with server. Check your connection.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (id: string, orderId: string) => {
    if (!window.confirm(`🚨 CRITICAL WARNING! Are you absolute sure you want to PERMANENTLY DELETE Order #${orderId}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders(orders.filter((o) => o._id !== id));
        alert("✅ Order deleted successfully.");
      } else {
        const error = await res.json();
        alert(`❌ Failed: ${error.message}`);
      }
    } catch (err) {
      alert("❌ Server Error.");
    }
  };

  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.payment?.totalAmount || o.price || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "packed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "shipped":
      case "out for delivery": return "bg-purple-100 text-purple-700 border-purple-200";
      case "delivered": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return <Clock size={14} />;
      case "packed": return <Package size={14} />;
      case "shipped":
      case "out for delivery": return <Truck size={14} />;
      case "delivered": return <CheckCircle size={14} />;
      case "cancelled": return <XCircle size={14} />;
      default: return null;
    }
  };

  const filteredOrders = orders.filter(o =>
    o.orderId.toLowerCase().includes(search.toLowerCase()) ||
    o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer?.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-brand-green">Manage Orders</h2>
          <p className="text-gray-500 text-sm">Monitor deliveries and validate distances.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center space-x-3 shadow-sm mr-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
              <DollarSign size={18} />
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold text-emerald-600 tracking-wider">Total Revenue</p>
              <p className="text-xl font-black text-emerald-700 leading-tight">₹{totalRevenue}</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by ID or Phone"
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-gold text-sm shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-brand-green transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-brand-gold" size={40} />
            <p className="text-brand-green font-bold animate-pulse">Syncing Deliveries...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-black tracking-[0.2em]">
                    <th className="px-6 py-5 w-10"></th>
                    <th className="px-6 py-5">Order Info</th>
                    <th className="px-6 py-5">Customer & Address</th>
                    <th className="px-6 py-5">Ordered Items</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Amount</th>
                    <th className="px-6 py-5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                    <React.Fragment key={order._id}>
                      <tr 
                        className={`hover:bg-brand-cream/10 transition-colors group cursor-pointer ${expandedOrderId === order.orderId ? 'bg-brand-cream/5' : ''}`}
                        onClick={() => setExpandedOrderId(expandedOrderId === order.orderId ? null : order.orderId)}
                      >
                        <td className="px-6 py-4">
                          {expandedOrderId === order.orderId ? <ChevronUp size={18} className="text-brand-gold" /> : <ChevronDown size={18} className="text-gray-400 group-hover:text-brand-gold" />}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <p className="font-black text-brand-green bg-brand-cream inline-block px-2 py-0.5 rounded-md border border-brand-gold/30 text-sm">{order.orderId}</p>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4 max-w-[200px]">
                          <p className="font-bold text-gray-700 text-base">{order.customer.name}</p>
                          <p className="text-xs text-gray-400">{order.customer.phone}</p>
                          <p className="text-xs text-brand-green font-medium mt-1 line-clamp-2">{order.customer.address}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {order.items?.map((item: any, i: number) => (
                              <p key={i} className="text-sm font-bold text-gray-600 leading-tight">
                                {item.name} <span className="text-brand-gold text-xs">x{item.quantity}</span>
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(order.status)} w-fit`}>
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-brand-green">₹{order.payment?.totalAmount || order.totalPrice}</td>
                        <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center space-x-2">
                            {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                              <button 
                                onClick={() => markAsDelivered(order._id)}
                                disabled={updatingId === order._id}
                                className="flex items-center space-x-1 px-3 py-2 bg-emerald-500 text-white text-[10px] uppercase tracking-wider font-black rounded-lg hover:shadow-lg hover:bg-emerald-600 transition-all disabled:opacity-50"
                              >
                                {updatingId === order._id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Check size={14} />
                                )}
                                <span>{updatingId === order._id ? "Updating..." : "Deliver"}</span>
                              </button>
                            ) : (
                              <span className="text-xs font-black uppercase tracking-wider text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg flex items-center space-x-1">
                                <CheckCircle size={14} />
                                <span>Done</span>
                              </span>
                            )}
                            
                            <button 
                              title="Delete Order Record"
                              onClick={() => handleDeleteOrder(order._id, order.orderId)}
                              className="p-2 bg-red-50 text-red-300 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {expandedOrderId === order.orderId && (
                          <tr className="bg-gray-50/50">
                            <td colSpan={7} className="px-6 py-0 border-none overflow-hidden">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="py-6 space-y-6"
                              >
                                {renderExpandedDetails(order)}
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No active orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Hidden on desktop) */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <div key={order._id} className="p-4 space-y-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedOrderId(expandedOrderId === order.orderId ? null : order.orderId)}
                  >
                    <div className="flex flex-col">
                      <p className="font-black text-brand-green bg-brand-cream inline-block px-2 py-0.5 rounded-md border border-brand-gold/30 text-xs w-fit">#{order.orderId}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </span>
                      {expandedOrderId === order.orderId ? <ChevronUp size={16} className="text-brand-gold" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-gray-800 text-lg">{order.customer.name}</p>
                      <p className="text-sm font-bold text-brand-green mt-1">{order.customer.phone}</p>
                    </div>
                    <p className="text-xl font-black text-brand-green">₹{order.payment?.totalAmount || order.totalPrice}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                       {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                          <button 
                            onClick={() => markAsDelivered(order._id)}
                            disabled={updatingId === order._id}
                            className="flex items-center space-x-1 px-4 py-2 bg-emerald-500 text-white text-[10px] uppercase tracking-wider font-black rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {updatingId === order._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} />
                            )}
                            <span>{updatingId === order._id ? "Updating..." : "Deliver Now"}</span>
                          </button>
                        ) : (
                          <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 border border-gray-100 px-3 py-2 rounded-xl flex items-center space-x-1">
                            <CheckCircle size={14} />
                            <span>Completed</span>
                          </div>
                        )}
                        <button 
                          onClick={() => handleDeleteOrder(order._id, order.orderId)}
                          className="p-2.5 bg-red-50 text-red-400 rounded-xl"
                        >
                          <Trash2 size={16} />
                        </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedOrderId === order.orderId && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pt-4 border-t border-gray-50 overflow-hidden"
                      >
                        {renderExpandedDetails(order)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )) : (
                <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">No active orders found.</div>
              )}
            </div>
          </>
        )}

        {/* Live Sync Footer */}
        <div className="p-6 bg-gray-50 flex flex-col sm:flex-row items-center justify-between border-t gap-4">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Live Inventory & Order Sync: Active</span>
          </p>
          <button
            onClick={fetchOrders}
            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-brand-green font-black text-[10px] uppercase tracking-widest hover:bg-brand-gold hover:text-white hover:border-brand-gold transition-all shadow-sm"
          >
            Manual Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

// Extract the expanded details to a reusable function to keep code DRY
function renderExpandedDetails(order: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      {/* Shipping Address */}
      <div className="bg-white p-4 lg:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col space-y-4">
        <div className="flex items-center space-x-2 text-brand-green">
          <MapPinned size={18} />
          <h4 className="text-[10px] font-black uppercase tracking-widest">Delivery Address</h4>
        </div>
        <div className="space-y-4">
          <p className="text-base text-gray-700 font-medium leading-relaxed">
            {order.customer.address}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
            <div>
              <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Pincode</p>
              <p className="text-lg font-black text-brand-green">{order.customer.pincode}</p>
            </div>
            {order.customer.altPhone && (
              <div>
                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Alt Phone</p>
                <p className="text-lg font-black text-brand-green">{order.customer.altPhone}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white p-4 lg:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col space-y-4">
        <div className="flex items-center space-x-2 text-brand-gold">
          <ShoppingCart size={18} />
          <h4 className="text-[10px] font-black uppercase tracking-widest">Ordered Items ({order.items?.length || 0})</h4>
        </div>
        <div className="space-y-3">
          {order.items?.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
              <div className="flex items-center space-x-3">
                {item.image && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-white p-1 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Qty: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-black text-brand-green">₹{item.price * item.quantity}</p>
                <p className="text-[9px] text-gray-400 font-bold">₹{item.price}</p>
              </div>
            </div>
          ))}
          {(!order.items || order.items.length === 0) && (
            <p className="text-sm text-gray-400 italic py-4 text-center">No item details available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
