"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

export default function AdminSettings() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    setUser(userData);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.message || "Failed to change password");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100"
      >
         <div className="mb-10 flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-50 text-brand-gold rounded-2xl flex items-center justify-center">
               <ShieldCheck size={28} />
            </div>
            <div>
               <h2 className="text-2xl font-black text-brand-green">Security Controls</h2>
               <p className="text-gray-400 text-sm">Update your administrative credentials.</p>
            </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">New Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
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
                <span>Admin password successfully updated!</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-brand-green text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:translate-y-[-2px] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Update Secure Password</span>}
            </button>
         </form>

         <div className="mt-12 p-6 bg-gray-50 rounded-3xl text-xs text-gray-500 flex items-start space-x-3">
            <AlertCircle size={16} className="shrink-0 text-brand-gold" />
            <p>Changing your admin password will not log you out, but please ensure you remember your new credentials for the next session.</p>
         </div>
      </motion.div>
    </div>
  );
}
