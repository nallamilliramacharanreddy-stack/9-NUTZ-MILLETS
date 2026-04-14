"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Loader2, CheckCircle2, AlertCircle, Settings, User, Phone, Mail, ShieldCheck, UserCircle, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type ActiveTab = "profile" | "security";

export default function ProfileSettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState({ name: "", phone: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    if (!userData) {
      router.push("/login");
    } else {
      setUser(userData);
      setProfileData({
        name: userData.name || "",
        phone: userData.phone || ""
      });
    }
  }, [router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Profile updated successfully!");
        // Update local storage
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        // Dispatch storage event for Navbar update
        window.dispatchEvent(new Event("storage"));
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Password changed successfully!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setError(data.message || "Failed to change password");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 md:px-8 py-32 flex-grow max-w-4xl">
        <div className="flex flex-col md:flex-row gap-8">
           {/* Sidebar */}
           <div className="w-full md:w-64 space-y-2">
              <div className="p-6 bg-brand-green text-white rounded-3xl shadow-lg mb-6">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                    <User size={24} />
                 </div>
                 <h2 className="font-bold text-lg leading-tight">{user.name}</h2>
                 <p className="text-xs text-emerald-200 uppercase tracking-widest mt-1">{user.role}</p>
              </div>
              
              <button 
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center space-x-3 p-4 font-bold rounded-2xl transition-all ${
                  activeTab === "profile" 
                  ? "bg-brand-gold text-white shadow-md scale-[1.02]" 
                  : "bg-white text-brand-green hover:bg-gray-50 border border-gray-100"
                }`}
              >
                 <UserCircle size={20} />
                 <span>Edit Profile</span>
              </button>

              <button 
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center space-x-3 p-4 font-bold rounded-2xl transition-all ${
                  activeTab === "security" 
                  ? "bg-brand-gold text-white shadow-md scale-[1.02]" 
                  : "bg-white text-brand-green hover:bg-gray-50 border border-gray-100"
                }`}
              >
                 <ShieldCheck size={20} />
                 <span>Security</span>
              </button>
           </div>

           {/* Main Content */}
           <div className="flex-grow">
              <AnimatePresence mode="wait">
                {activeTab === "profile" ? (
                  <motion.div 
                    key="profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100"
                  >
                    <div className="mb-8">
                      <h1 className="text-2xl font-black text-brand-green mb-1">Personal Details</h1>
                      <p className="text-sm text-gray-400">Manage your profile information.</p>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                              type="text" 
                              required
                              placeholder="Your full name"
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                              value={profileData.name}
                              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                              type="tel" 
                              required
                              placeholder="10 digit mobile number"
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                              value={profileData.phone}
                              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 opacity-50">Email Address (Read-only)</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input 
                              type="email" 
                              disabled
                              className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-100 rounded-2xl text-gray-400 cursor-not-allowed"
                              value={user.email}
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
                          <span>{success}</span>
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={loading}
                        className="px-10 py-4 bg-brand-green text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center space-x-3 disabled:opacity-50 w-full sm:w-auto"
                      >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Save Profile Changes</span>}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="security"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100"
                  >
                    <div className="mb-8">
                      <h1 className="text-2xl font-black text-brand-green mb-1">Security Settings</h1>
                      <p className="text-sm text-gray-400">Update your password to keep your account secure.</p>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Current Password</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                              type={showCurrentPassword ? "text" : "password"} 
                              required
                              placeholder="Enter current password"
                              className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-green transition-colors"
                            >
                              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">New Password</label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <input 
                                type={showNewPassword ? "text" : "password"} 
                                required
                                placeholder="Min. 8 chars"
                                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-green transition-colors"
                              >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Confirm New Password</label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                required
                                placeholder="Repeat new password"
                                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-green transition-colors"
                              >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
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
                          <span>{success}</span>
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={loading}
                        className="px-10 py-4 bg-brand-green text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center space-x-3 disabled:opacity-50 w-full sm:w-auto"
                      >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Update Password</span>}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-amber-50 rounded-[32px] p-8 border border-amber-100 mt-8">
                 <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 bg-brand-gold text-white rounded-full flex items-center justify-center shadow-sm">
                       <ShieldCheck size={20} />
                    </div>
                    <h4 className="font-bold text-brand-green text-sm uppercase tracking-widest">Security & Privacy</h4>
                 </div>
                 <p className="text-gray-600 text-sm leading-relaxed">
                    Protecting your data is our priority. Your personal information is encrypted and never shared with third parties. Use a strong password to keep your account safe.
                 </p>
              </div>
           </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
