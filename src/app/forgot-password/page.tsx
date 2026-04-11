"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Mail,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Key,
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
          router.push(
            `/reset-password?email=${encodeURIComponent(email)}`
          );
        }, 2000);
      } else {
        setError(data.message || "Failed to process request");
      }
    } catch (err) {
      setError("Something went wrong");
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
            <div className="w-16 h-16 bg-brand-gold/10 text-brand-gold rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Key size={32} />
            </div>
            <h1 className="text-2xl font-bold text-brand-green">
              Forgot Password?
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Enter your email to receive a 6-digit OTP code.
            </p>
          </div>

          {!success ? (
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brand-green text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <span>Send OTP Code</span>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-6 bg-emerald-50 text-emerald-700 rounded-3xl text-sm flex flex-col items-center text-center space-y-4 border border-emerald-100">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>

                <div>
                  <p className="font-bold text-lg">
                    OTP Sent Successfully!
                  </p>
                  <p className="text-emerald-600/80 mt-1">
                    Please check your email <b>{email}</b> for the 6-digit code.
                  </p>
                </div>

                <div className="w-full h-1 bg-emerald-200/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2 }}
                    className="h-full bg-emerald-500"
                  />
                </div>

                <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">
                  Redirecting to verification page...
                </p>
              </div>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-center space-x-3 border border-red-100"
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/login"
              className="text-sm font-bold text-brand-green hover:text-brand-gold flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={16} />
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
