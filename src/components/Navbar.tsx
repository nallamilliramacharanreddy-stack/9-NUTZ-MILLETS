"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Menu, X, User, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const updateHeader = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((acc: number, item: any) => acc + item.quantity, 0));

      const userData = JSON.parse(localStorage.getItem("user") || "null");
      setUser(userData);
      
      // Attempt silent refresh if user exists
      if (userData) {
        fetch("/api/auth/refresh-token", { method: "POST" }).catch(() => {
          // If refresh fails, session is likely expired
           console.warn("Silent refresh failed");
        });
      }
    };

    updateHeader();
    window.addEventListener("storage", updateHeader);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", updateHeader);
    };
  }, []);

  // Do not show global navbar on admin routes to prevent overlap
  // This must be after all hooks to avoid rendering errors
  if (pathname.startsWith("/admin")) return null;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("storage"));
    router.push("/login");
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Our Story", href: "/about" },
    { name: "Track Order", href: "/order-tracking" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 py-4 md:px-12",
        scrolled || isOpen ? "bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] py-3" : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group relative">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-12 h-12 bg-brand-green rounded-[18px] flex items-center justify-center shadow-lg"
          >
            <span className="text-brand-gold font-black text-2xl tracking-tighter">9</span>
          </motion.div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-brand-green leading-none tracking-tighter uppercase">Nutzz</h1>
            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-brand-gold leading-none mt-1">Millets</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-[11px] uppercase font-black tracking-[0.2em] transition-all hover:text-brand-gold relative group",
                pathname === link.href ? "text-brand-gold" : "text-brand-green/70"
              )}
            >
              {link.name}
              <span className={cn(
                "absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full",
                pathname === link.href ? "w-full" : "w-0"
              )} />
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center bg-gray-100/50 rounded-2xl p-1 border border-gray-200/50">
             <button className="p-2.5 text-brand-green hover:bg-white hover:shadow-sm rounded-xl transition-all">
                <Search size={18} />
             </button>
          </div>

          <Link href="/cart" className="relative p-3 text-brand-green bg-white shadow-sm border border-gray-100 rounded-2xl hover:scale-110 active:scale-95 transition-all">
            <ShoppingCart size={18} />
            <AnimatePresence>
               {cartCount > 0 && (
                 <motion.span 
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   exit={{ scale: 0 }}
                   className="absolute -top-2 -right-2 bg-brand-gold text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md ring-2 ring-brand-gold/10"
                 >
                   {cartCount}
                 </motion.span>
               )}
            </AnimatePresence>
          </Link>

          {user ? (
            <div className="hidden lg:flex items-center space-x-6 pl-4 border-l border-gray-200">
              <Link href={user.role === 'admin' ? "/admin" : "/profile/settings"} className="flex items-center space-x-3 group">
                 <div className="w-10 h-10 bg-brand-green/5 rounded-2xl flex items-center justify-center text-brand-green border border-brand-green/10 group-hover:bg-brand-green group-hover:text-white transition-all">
                    <User size={18} />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-widest text-brand-gold">Account</span>
                    <span className="text-xs font-bold text-brand-green">{user.name.split(' ')[0]}</span>
                 </div>
              </Link>
              <button 
                onClick={handleLogout} 
                className="text-[9px] font-black text-gray-400 hover:text-red-500 transition-colors uppercase tracking-[0.2em] border border-gray-100 px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="hidden lg:flex items-center space-x-2 px-6 py-3 bg-brand-green text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-brand-green/20 hover:shadow-brand-green/40 hover:translate-y-[-2px] transition-all"
            >
              <User size={14} />
              <span>Join Us</span>
            </Link>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 bg-white shadow-sm border border-gray-100 rounded-2xl text-brand-green transition-all"
          >
            <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
               {isOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white/95 backdrop-blur-lg border-t mt-3 overflow-hidden rounded-3xl mx-4 shadow-xl"
          >
            <div className="flex flex-col space-y-4 p-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-bold text-brand-green hover:text-brand-gold transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-6 border-t flex flex-col space-y-4">
                {user ? (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-green font-bold">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-brand-green">{user.name}</p>
                        <p className="text-xs text-gray-400">Welcome back!</p>
                      </div>
                    </div>
                    <Link
                      href={user.role === 'admin' ? "/admin" : "/profile/settings"}
                      onClick={() => setIsOpen(false)}
                      className="w-full py-4 bg-brand-green text-white font-bold rounded-2xl flex items-center justify-center space-x-2"
                    >
                      <span>{user.role === 'admin' ? 'Admin Dashboard' : 'My Account'}</span>
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                      className="w-full py-3 border border-red-100 text-red-500 font-bold rounded-2xl"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 bg-brand-green text-white font-bold rounded-2xl flex items-center justify-center space-x-2"
                  >
                    <span>Login / Register</span>
                  </Link>
                )}
                <p className="text-xs text-gray-400 text-center font-medium uppercase tracking-widest pt-4">Eat Healthy. Live Strong.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
