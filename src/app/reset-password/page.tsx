"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2, ShieldCheck, Hash, Eye, EyeOff, RefreshCcw, Clock } from "lucide-react";
import Footer from "@/components/Footer";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const [step, setStep] = useState(1); // 1: OTP, 2: New Password
  const [otp, setOtp] = useState(searchParams.get("otp") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError("Email missing. Please go back and try again.");
      return;
    }

    setResending(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setTimeLeft(180);
        setCanResend(false);
        setOtp("");
        setError(null);
      } else {
        setError("Failed to resend OTP");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email address is missing. Please restart the forgot password process.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    if (timeLeft <= 0) {
      setError("OTP has expired. Please request a new one.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, type: 'reset' }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2);
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-brand-gold/5"
    >
      <div className="text-center mb-10">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-500 ${step === 1 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
           {step === 1 ? <Hash size={32} /> : <ShieldCheck size={32} />}
        </div>
        <h1 className="text-2xl font-bold text-brand-green">
          {step === 1 ? "Verify OTP" : "Secure Your Account"}
        </h1>
        <p className="text-gray-400 text-sm mt-2 px-4">
          {step === 1 
            ? `We've sent a 6-digit code to your email. Enter it below to continue.` 
            : "Verification successful! Please create a strong new password for your account."
          }
        </p>
      </div>

      <form onSubmit={step === 1 ? handleVerifyOTP : handleResetPassword} className="space-y-6">
        <div className="space-y-4">
          {step === 1 ? (
            <>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  placeholder="6-Digit OTP"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white transition-all shadow-sm font-bold tracking-[0.5em] text-center"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              
              <div className="flex items-center justify-between px-2">
                <div className={`flex items-center space-x-2 text-xs font-bold ${timeLeft < 30 ? 'text-red-500' : 'text-gray-400'}`}>
                   <Clock size={14} />
                   <span>{timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'OTP Expired'}</span>
                </div>
                
                <button 
                  type="button"
                  disabled={!canResend || resending}
                  onClick={handleResendOTP}
                  className="text-xs font-bold text-brand-gold hover:text-brand-green disabled:opacity-30 transition-colors flex items-center space-x-1"
                >
                  {resending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                  <span>Resend OTP</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  autoFocus
                  placeholder="New Password"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white transition-all shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-green transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="Confirm New Password"
                  className={`w-full pl-12 pr-12 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:bg-white transition-all shadow-sm ${
                    confirmPassword && password !== confirmPassword 
                      ? "border-red-300 focus:ring-red-500" 
                      : confirmPassword && password === confirmPassword
                      ? "border-emerald-300 focus:ring-emerald-500"
                      : "border-gray-100 focus:ring-brand-gold"
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && (
                   <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {password === confirmPassword ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : (
                        <AlertCircle size={18} className="text-red-500" />
                      )}
                   </div>
                )}
              </div>
              
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-4">
                  Passwords do not match
                </p>
              )}
            </div>
          )}
        </div>

        <button 
          type="submit"
          disabled={loading || success || (step === 1 && timeLeft <= 0)}
          className="w-full py-4 bg-brand-green text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : success ? (
            <CheckCircle2 size={20} />
          ) : (
            <>
              <span>{step === 1 ? "Verify OTP" : "Update Password"}</span>
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
            className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-center space-x-3 border border-red-100"
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm flex items-center space-x-3 border border-emerald-100"
          >
            <CheckCircle2 size={18} />
            <span>Password updated! Redirecting to login...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-brand-cream/10 pt-28 pb-12 flex flex-col">
      <div className="container mx-auto px-4 flex-grow flex items-center justify-center">
        <Suspense fallback={<Loader2 className="animate-spin text-brand-gold" size={40} />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}
