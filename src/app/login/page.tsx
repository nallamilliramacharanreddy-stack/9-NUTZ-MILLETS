"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("storage"));
        setTimeout(() => {
          router.push(data.user.role === 'admin' ? "/admin" : "/shop");
        }, 1500);
      } else if (data.needsVerification) {
        setError(data.message);
        setTimeout(() => {
          router.push(`/register?email=${encodeURIComponent(data.email)}&shortcut=otp`);
        }, 2000);
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream/10 pt-28 pb-12 flex flex-col">
      <div className="container mx-auto px-4 flex-grow flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-brand-gold/5"
        >
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center">
                <span className="text-brand-gold font-bold text-xl">9</span>
              </div>
              <span className="text-2xl font-black text-brand-green tracking-tighter">Nutzz</span>
            </Link>
            <h1 className="text-2xl font-bold text-brand-green">Welcome Back!</h1>
            <p className="text-gray-400 text-sm mt-2">Sign in to your healthy millet account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white transition-all shadow-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white transition-all shadow-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div className="text-right">
              <Link href="/forgot-password" size={14} className="text-xs font-bold text-brand-gold hover:underline uppercase tracking-wider">
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit"
              disabled={loading || success}
              className="w-full py-4 bg-brand-green text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : success ? (
                <CheckCircle2 size={20} />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-center space-x-3 border border-red-100"
              >
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm flex items-center space-x-3 border border-emerald-100"
              >
                <CheckCircle2 size={18} className="shrink-0" />
                <span>Login successful! Redirecting...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link href="/register" className="text-brand-gold font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}
