"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Users, DollarSign, Package, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDeleteOrder = async (id: string, orderId: string) => {
    if (!confirm(`Are you sure you want to remove Order #${orderId}? this action cannot be undone.`)) return;
    
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (res.ok) {
        setRecentOrders(prev => prev.filter(o => o._id !== id));
        // Also refresh stats to be safe
        fetchDashboardData();
      } else {
        const data = await res.json().catch(() => ({ message: "Failed to delete order" }));
        alert(data.message || "Failed to delete order. Please check permissions.");
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" })
      ]);
      
      const products = await productsRes.json();
      const orders = await ordersRes.json();

      if (productsRes.ok && ordersRes.ok) {
        const totalRevenue = orders
          .filter((o: any) => o.status === 'delivered')
          .reduce((acc: number, o: any) => acc + (o.payment?.totalAmount || 0), 0);
        const activeOrders = orders.filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled').length;
        
        setStats([
          { name: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: <DollarSign size={24} />, trend: "+12.5%", positive: true },
          { name: "Active Orders", value: activeOrders.toString(), icon: <Package size={24} />, trend: "+2", positive: true },
          { name: "Products", value: products.length.toString(), icon: <ShoppingBag size={24} />, trend: "Sync", positive: true },
          { name: "Total Orders", value: orders.length.toString(), icon: <Users size={24} />, trend: "+8.2%", positive: true },
        ]);

        setRecentOrders(orders.slice(0, 5));
      }
    } catch (err) {
      console.error("Dashboard Sync Failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
         <Loader2 className="animate-spin text-brand-gold" size={48} />
         <p className="text-brand-green font-bold animate-pulse uppercase tracking-widest text-xs">Generating Dashboard Insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:border-brand-gold transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 text-brand-green rounded-2xl flex items-center justify-center group-hover:bg-brand-gold group-hover:text-white transition-colors">
                {stat.icon}
              </div>
              <div className={`flex items-center space-x-1 text-xs font-bold ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                <span>{stat.trend}</span>
                {stat.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.name}</p>
            <h3 className="text-2xl font-black text-brand-green mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="text-lg font-bold text-brand-green">Live Feed: Recent Deliveries</h3>
            <button className="text-xs font-bold text-brand-gold uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-[0.2em]">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Distance</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 font-bold text-brand-green text-sm">{order.orderId}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{order.customer.name}</td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${order.distance > 20 ? 'bg-red-50 text-red-500' : 'bg-brand-gold/10 text-brand-gold'}`}>{order.distance} km</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold">
                       <span className={`px-3 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {order.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 font-black text-brand-green">₹{order.payment?.totalAmount || '0'}</td>
                    <td className="px-6 py-4 text-center">
                        <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             handleDeleteOrder(order._id, order.orderId);
                          }}
                          className="p-2 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove Order"
                        >
                          <Trash2 size={16} />
                        </button>
                     </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No recent orders yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales Chart Helper (Visual) */}
        <div className="bg-brand-green rounded-3xl shadow-xl p-8 text-white relative flex flex-col justify-between overflow-hidden">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-gold opacity-10 rounded-full blur-2xl" />
           <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl" />
           
           <div className="relative z-10">
              <TrendingUp className="text-brand-gold mb-6" size={48} />
              <h3 className="text-2xl font-black mb-2 leading-tight">Millet Market<br /> Trend</h3>
              <p className="text-emerald-300 text-sm">Dashboard is now synced with live MongoDB data.</p>
           </div>
           
           <div className="mt-12 relative z-10">
              <div className="w-full h-3 bg-emerald-800 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: "100%" }}
                   className="h-full bg-brand-gold"
                 />
              </div>
              <div className="flex justify-between mt-3 text-xs font-bold tracking-widest opacity-80 uppercase">
                 <span>Status</span>
                 <span>Live</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
