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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-3 md:px-8",
        scrolled || isOpen ? "bg-white/90 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
            <span className="text-brand-gold font-bold text-xl">9</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand-green leading-none">Nutzz</h1>
            <p className="text-[10px] uppercase tracking-widest text-brand-gold font-semibold">Millets</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-brand-green hover:text-brand-gold transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 md:space-x-5">
          <button className="p-2 text-brand-green hover:bg-brand-gold/10 rounded-full transition-colors hidden sm:block">
            <Search size={20} />
          </button>

          <Link href="/cart" className="relative p-2 text-brand-green hover:bg-brand-gold/10 rounded-full transition-colors">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-brand-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden md:flex items-center space-x-4">
              <Link href={user.role === 'admin' ? "/admin" : "/profile/settings"} className="text-xs font-bold text-brand-green bg-brand-gold/10 px-4 py-2 rounded-full hover:bg-brand-gold/20 transition-all">
                {user.name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:flex items-center space-x-2 text-sm font-bold text-brand-green hover:text-brand-gold transition-colors">
              <User size={18} />
              <span>Login</span>
            </Link>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-brand-green hover:bg-brand-gold/10 rounded-full transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
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
