"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Mail,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Key,
  ArrowRight,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setError(data.message || "Failed to process request");
      }
    } catch (err) {
      setError("Something went wrong. Check connection.");
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
          className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 md:p-12 border border-brand-gold/5 relative overflow-hidden"
        >
          {/* Glass Decor */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-green/5 rounded-full blur-3xl -ml-16 -mb-16" />

          <div className="text-center mb-10 relative z-10">
            <div className="w-16 h-16 bg-brand-gold/10 text-brand-gold rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Key size={32} />
            </div>
            <h1 className="text-3xl font-black text-brand-green tracking-tight">
              Forgot Password?
            </h1>
            <p className="text-gray-400 text-sm mt-2 font-medium px-4">
              Don't worry! Enter your email to receive a secure 6-digit OTP code to reset your password.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form 
                key="forgot-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit} 
                className="space-y-6 relative z-10"
              >
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white transition-all text-sm font-bold text-brand-green shadow-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-brand-green text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_10px_30px_rgba(26,93,26,0.3)] hover:shadow-[0_15px_35px_rgba(26,93,26,0.4)] hover:translate-y-[-2px] active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 text-xs"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="success-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 relative z-10"
              >
                <div className="p-8 bg-emerald-50 text-emerald-700 rounded-[30px] text-center space-y-4 border border-emerald-100">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>

                  <div>
                    <p className="font-black text-xl">OTP Sent!</p>
                    <p className="text-emerald-600/80 mt-1 font-medium text-sm">
                      Check your email <b>{email}</b> for the verification code.
                    </p>
                  </div>

                  <div className="w-full h-1.5 bg-emerald-200/50 rounded-full overflow-hidden mt-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2 }}
                      className="h-full bg-emerald-500"
                    />
                  </div>

                  <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-50 pt-2">
                    Redirecting to Reset...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] uppercase font-black tracking-widest flex items-center space-x-3 border border-red-100 relative z-10"
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="mt-10 text-center relative z-10">
            <Link
              href="/login"
              className="text-[10px] uppercase font-black tracking-widest text-brand-green hover:text-brand-gold flex items-center justify-center space-x-2 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}
