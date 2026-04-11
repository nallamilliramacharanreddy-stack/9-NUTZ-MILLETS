"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, User as UserIcon, ShieldAlert, ShieldCheck, Trash2, Edit, X, Save, Plus, Mail, Phone, Lock, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal States
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user"
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string, email: string) => {
    if (email === "9NUTZMILLETSGMD@gmail.com") {
      alert("⚠️ Root Admin cannot be deleted!");
      return;
    }
    
    if (!window.confirm("🚨 CRITICAL WARNING! Are you absolute sure you want to PERMANENTLY DELETE this user? This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter((u) => u._id !== id));
        alert("✅ User deleted permanently.");
      } else {
        const error = await res.json();
        alert(`❌ Failed: ${error.message}`);
      }
    } catch (err) {
      alert("❌ Server Error.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${editingUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });

      if (res.ok) {
        const { user } = await res.json();
        setUsers(users.map(u => u._id === user._id ? { ...u, ...user } : u));
        setEditingUser(null);
        alert("✅ User updated successfully!");
      } else {
        const error = await res.json();
        alert(`❌ Update Failed: ${error.message}`);
      }
    } catch (err) {
      alert("❌ Server Error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        const { user } = await res.json();
        setUsers([user, ...users]);
        setShowAddModal(false);
        setNewUser({ name: "", email: "", password: "", phone: "", role: "user" });
        alert("✅ New user created successfully!");
      } else {
        const error = await res.json();
        alert(`❌ Creation Failed: ${error.message}`);
      }
    } catch (err) {
      alert("❌ Server Error.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-brand-green">Manage Users</h2>
          <p className="text-gray-500 text-sm">Monitor customer registrations and security status.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Name or Email"
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-gold text-sm shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-6 py-2.5 bg-brand-green text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:bg-brand-gold transition-all"
          >
            <Plus size={16} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-brand-gold" size={40} />
            <p className="text-brand-green font-bold animate-pulse">Syncing User Directory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">
                  <th className="px-6 py-5">User</th>
                  <th className="px-6 py-5">Contact Details</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">Security Status</th>
                  <th className="px-6 py-5">Joined</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                  const isLocked = user.lockUntil && new Date(user.lockUntil) > new Date();
                  const isRootAdmin = user.email === "9NUTZMILLETSGMD@gmail.com";
                  
                  return (
                    <tr key={user._id} className="hover:bg-brand-cream/10 transition-colors group">
                      <td className="px-6 py-4 flex items-center space-x-4">
                        <div className="w-10 h-10 bg-brand-green/5 rounded-xl flex items-center justify-center shrink-0">
                           <UserIcon size={20} className="text-brand-green opacity-50" />
                        </div>
                        <div>
                           <p className="font-bold text-brand-green text-sm flex items-center space-x-2">
                             <span>{user.name}</span>
                             {isRootAdmin && <ShieldCheck size={12} className="text-brand-gold" />}
                           </p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user._id.substring(user._id.length - 6)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-600 text-sm">{user.email}</p>
                        <p className="text-xs text-brand-gold font-bold">{user.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-gray-100 text-gray-500'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isLocked ? (
                          <div className="flex items-center space-x-2 text-red-500 bg-red-50 px-3 py-1.5 rounded-lg w-fit border border-red-100">
                            <ShieldAlert size={14} />
                            <span className="text-[10px] uppercase font-black tracking-widest">Locked Out</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit border border-emerald-100">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] uppercase font-black tracking-widest">Secure</span>
                          </div>
                        )}
                        {user.loginAttempts > 0 && !isLocked && (
                          <p className="text-[10px] text-amber-500 font-bold mt-1.5 ml-1">{user.loginAttempts} failed attempts</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <button 
                            title="Edit User"
                            onClick={() => setEditingUser(user)}
                            className="p-2 bg-gray-50 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-xl transition-all"
                          >
                            <Edit size={16} />
                          </button>
                          
                          <button 
                            title="Delete User"
                            onClick={() => handleDelete(user._id, user.email)}
                            disabled={isRootAdmin}
                            className="p-2 bg-red-50 text-red-300 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 bg-brand-green text-white flex items-center justify-between">
                 <div>
                   <h3 className="text-xl font-black italic">Register New User</h3>
                   <p className="text-xs font-bold opacity-70 uppercase tracking-widest mt-1">Manual Account Creation</p>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Charan Reddy"
                      className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all text-sm font-medium"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email ID</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        type="email" 
                        required
                        placeholder="user@example.com"
                        className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all text-sm font-medium"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        type="text" 
                        required
                        placeholder="9876543210"
                        className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all text-sm font-medium"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Temp Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all text-sm font-medium"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Role</label>
                    <select 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all text-sm font-bold text-brand-green"
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    >
                       <option value="user">Standard User</option>
                       <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-brand-gold text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-sm mt-4"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      <UserPlus size={18} />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 bg-brand-cream/50 border-b border-brand-gold/10 flex items-center justify-between">
                 <div>
                   <h3 className="text-xl font-black text-brand-green">Edit User Profile</h3>
                   <p className="text-xs font-bold text-brand-gold uppercase tracking-widest mt-1">{editingUser.email}</p>
                 </div>
                 <button onClick={() => setEditingUser(null)} className="p-2 bg-white hover:bg-gray-100 rounded-full transition-colors text-gray-500 shadow-sm border border-gray-100">
                    <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
                {editingUser.email === "9NUTZMILLETSGMD@gmail.com" && (
                  <div className="p-4 bg-amber-50 rounded-2xl mb-6">
                    <p className="text-xs text-amber-700 font-bold"><ShieldAlert className="inline mr-2" size={14}/>Master account privileges are locked.</p>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all text-sm font-medium text-brand-green"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                     <input 
                       type="text" 
                       required
                       className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all text-sm font-medium text-brand-green"
                       value={editingUser.phone}
                       onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Role</label>
                     <select 
                       disabled={editingUser.email === "9NUTZMILLETSGMD@gmail.com"}
                       className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all text-sm font-bold text-brand-green disabled:opacity-50"
                       value={editingUser.role}
                       onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                     >
                        <option value="user">Standard User</option>
                        <option value="admin">Administrator</option>
                     </select>
                   </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full py-5 bg-brand-green text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-2xl hover:bg-brand-gold transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (
                      <>
                        <Save size={18} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
