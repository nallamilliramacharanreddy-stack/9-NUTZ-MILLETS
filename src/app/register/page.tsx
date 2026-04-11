"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Phone, Loader2, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";
import Footer from "@/components/Footer";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // OTP State
  const [step, setStep] = useState(1); // 1: Registration Form, 2: OTP Verification
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    if (params.get("shortcut") === "otp" && email) {
      setFormData(prev => ({ ...prev, email }));
      setStep(2);
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2);
        setTimer(60); // 60s cooldown for resend
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.message || "Verification failed");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setResending(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, action: "resend" }),
      });

      if (res.ok) {
        setTimer(60);
        alert("New OTP sent successfully!");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      setError("Faild to resend. Check connection.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream/10 pt-28 pb-12 flex flex-col">
      <div className="container mx-auto px-4 flex-grow flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-8 md:p-12 border border-brand-gold/5 relative overflow-hidden"
        >
          {/* Glass Decor */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-green/5 rounded-full blur-3xl -ml-16 -mb-16" />

          <div className="text-center mb-10 relative z-10">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6 text-xl font-black text-brand-green">
              <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center">
                <span className="text-brand-gold font-bold">9</span>
              </div>
              <span className="tracking-tighter uppercase">9 Nutzz Millets</span>
            </Link>
            <h1 className="text-3xl font-black text-brand-green tracking-tight">
              {step === 1 ? "Create Account" : "Verify Email"}
            </h1>
            <p className="text-gray-400 text-sm mt-2 font-medium">
              {step === 1 ? "Join our mission for a healthier India" : `Enter the 6-digit code sent to ${formData.email}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="register-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit} 
                className="space-y-5 relative z-10"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" required placeholder="Full Name"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white transition-all text-sm font-bold text-brand-green"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="tel" required placeholder="Phone Number"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white transition-all text-sm font-bold text-brand-green"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email" required placeholder="Email Address"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white transition-all text-sm font-bold text-brand-green"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="password" required placeholder="Create Password"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white transition-all text-sm font-bold text-brand-green"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-brand-green text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_10px_30px_rgba(26,93,26,0.3)] hover:shadow-[0_15px_35px_rgba(26,93,26,0.4)] hover:translate-y-[-2px] active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 text-xs"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      <span>Continue</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOTP} 
                className="space-y-6 relative z-10"
              >
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={20} />
                  <input 
                    type="text" 
                    required 
                    maxLength={6}
                    placeholder="Enter 6-Digit Code"
                    className="w-full pl-12 pr-4 py-5 bg-brand-green/5 border-2 border-brand-green/10 rounded-2xl outline-none focus:border-brand-gold focus:bg-white transition-all text-center text-2xl font-black tracking-[0.5em] text-brand-green placeholder:text-gray-300 placeholder:tracking-normal placeholder:text-sm"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </div>

                <div className="flex flex-col items-center space-y-4">
                  <button 
                    type="submit"
                    disabled={verifying || otp.length !== 6 || success}
                    className="w-full py-5 bg-brand-gold text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-3 disabled:opacity-50 text-xs"
                  >
                    {verifying ? <Loader2 className="animate-spin" size={18} /> : <span>Verify & Finish</span>}
                  </button>

                  <button 
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resending || timer > 0}
                    className="text-[10px] font-black uppercase tracking-widest text-brand-green hover:text-brand-gold transition-colors flex items-center space-x-2 disabled:opacity-30"
                  >
                    {resending ? <Loader2 className="animate-spin" size={12} /> : <RefreshCw size={12} />}
                    <span>{timer > 0 ? `Resend Code in ${timer}s` : "Resend Verification Code"}</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] uppercase font-black tracking-widest flex items-center space-x-3 border border-red-100"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-brand-green/10 text-brand-green rounded-2xl text-[10px] uppercase font-black tracking-widest flex items-center space-x-3 border border-brand-green/20"
              >
                <CheckCircle2 size={16} className="shrink-0" />
                <span>Welcome! Account verified. Loading dashboard...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 text-center relative z-10">
            {step === 1 ? (
               <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                Already part of the family?{" "}
                <Link href="/login" className="text-brand-gold hover:text-brand-green transition-colors">
                  Sign In Here
                </Link>
              </p>
            ) : (
              <button 
                onClick={() => setStep(1)}
                className="text-[10px] uppercase font-black tracking-widest text-gray-400 hover:text-brand-green transition-colors"
              >
                ← Back to registration
              </button>
            )}
          </div>
        </motion.div>
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}
