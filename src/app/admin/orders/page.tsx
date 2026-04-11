"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListOrdered, Search, Filter, MoreVertical, CheckCircle, Clock, Truck, Package, XCircle, Loader2, MapPin, DollarSign, Check, Trash2 } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" })
      });
      if (res.ok) {
        alert("✅ Delivered Successfully!");
        setOrders(orders.map(o => o._id === id ? { ...o, status: "delivered", payment: { ...o.payment, status: "completed" } } : o));
      } else {
        alert("❌ Failed to update order status.");
      }
    } catch (err) {
      alert("❌ Error communicating with server.");
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
              <p className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider">Total Revenue</p>
              <p className="text-lg font-black text-emerald-700 leading-tight">₹{totalRevenue}</p>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">
                  <th className="px-6 py-5">Order Info</th>
                  <th className="px-6 py-5">Customer</th>
                  <th className="px-6 py-5 text-center">Distance Check</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-brand-cream/10 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-black text-brand-green bg-brand-cream inline-block px-2 py-0.5 rounded-md border border-brand-gold/30">{order.orderId}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-700 text-sm">{order.customer.name}</p>
                      <p className="text-xs text-gray-400">{order.customer.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                        ${(order.distance || 0) > 20 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-brand-green/10 text-brand-green border border-brand-green/20'}`}>
                        {order.distance || 0} km
                      </span>
                      {order.distance > 20 && (
                        <p className="text-[8px] text-red-500 font-bold mt-1 uppercase">Outside Zone</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(order.status)} w-fit`}>
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-brand-green">₹{order.payment?.totalAmount || order.totalPrice}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                          <button 
                            onClick={() => markAsDelivered(order._id)}
                            className="flex items-center space-x-1 px-3 py-2 bg-emerald-500 text-white text-[10px] uppercase tracking-wider font-black rounded-lg hover:shadow-lg hover:bg-emerald-600 transition-all"
                          >
                            <Check size={14} />
                            <span>Deliver</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg flex items-center space-x-1">
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
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No active orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-6 bg-gray-50 flex items-center justify-between border-t text-xs text-gray-400 font-bold uppercase tracking-widest">
          <p>Live Sync: Active</p>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-white border rounded-xl text-brand-green hover:bg-brand-gold hover:text-white transition-all shadow-sm"
            >
              Refresh Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
