"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    if (userData) {
      setUser(userData);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("user");
      setUser(null);
      window.dispatchEvent(new Event("storage"));
      router.refresh();
    } catch (err) {
      setError("Logout failed. Please try again.");
    }
  };

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
          if (redirect) {
            router.push(redirect);
          } else {
            router.push(
              data.user.role === "admin" ? "/admin" : "/shop"
            );
          }
        }, 1500);
      } else if (data.needsVerification) {
        setError(data.message);

        setTimeout(() => {
          router.push(
            `/register?email=${encodeURIComponent(
              data.email
            )}&shortcut=otp`
          );
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
            <Link
              href="/"
              className="inline-flex items-center space-x-2 mb-6"
            >
              <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center">
                <span className="text-brand-gold font-bold text-xl">
                  9
                </span>
              </div>
              <span className="text-2xl font-black text-brand-green tracking-tighter">
                Nutzz
              </span>
            </Link>

            <h1 className="text-2xl font-bold text-brand-green">
              {user ? `Hi, ${user.name.split(' ')[0]}!` : "Welcome Back!"}
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              {user ? "You are already signed in." : "Sign in to your healthy millet account"}
            </p>
          </div>

          {user ? (
            <div className="space-y-6">
              <div className="bg-brand-cream/30 p-6 rounded-2xl border border-brand-gold/10 text-center">
                <p className="text-sm text-brand-green font-medium mb-4">
                  Manage your orders or switch to a different account.
                </p>
                <div className="flex flex-col gap-3">
                  <Link 
                    href={user.role === 'admin' ? "/admin" : "/shop"}
                    className="w-full py-4 bg-brand-green text-white font-bold rounded-2xl shadow-lg hover:translate-y-[-2px] transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Go to {user.role === 'admin' ? "Admin Panel" : "Shop"}</span>
                    <ArrowRight size={18} />
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full py-4 border-2 border-red-100 text-red-500 font-bold rounded-2xl hover:bg-red-50 transition-all"
                  >
                    Log Out from Account
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                required
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white transition-all shadow-sm"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white transition-all shadow-sm"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-green transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* ✅ FIXED LINK (removed size={14}) */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-brand-gold hover:underline uppercase tracking-wider"
              >
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
          )}

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
              <Link
                href="/register"
                className="text-brand-gold font-bold hover:underline"
              >
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
