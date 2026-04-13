"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Heart, Share2, Globe } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-green relative overflow-hidden text-white py-24">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Section */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center space-x-3 group animate-pulse-slow">
              <div className="w-12 h-12 bg-white rounded-[20px] flex items-center justify-center shadow-2xl">
                <span className="text-brand-green font-black text-2xl tracking-tighter">9</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white leading-none tracking-tighter uppercase">Nutzz</h1>
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-brand-gold leading-none mt-1">Millets</p>
              </div>
            </Link>
            <p className="text-emerald-100/70 text-sm leading-relaxed max-w-xs font-medium">
              Bringing the ancient superfood goodness of millets to your modern table. 100% organic, handcrafted snacks for a healthier you.
            </p>
            <div className="flex items-center space-x-3">
              {[
                { icon: <Heart size={18} />, href: "#" },
                { icon: <Share2 size={18} />, href: "#" },
                { icon: <Globe size={18} />, href: "#" }
              ].map((social, i) => (
                <Link 
                  key={i} 
                  href={social.href} 
                  className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-brand-gold hover:text-white hover:scale-110 transition-all duration-300"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-brand-gold">Navigation</h3>
            <ul className="space-y-4">
              {["Shop All", "Our Story", "Track Your Order", "Contact Us"].map((link) => (
                <li key={link}>
                  <Link 
                    href={`/${link.toLowerCase().replace(/ /g, '-')}`} 
                    className="text-emerald-100/60 hover:text-brand-gold text-[13px] font-bold transition-all flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-[2px] bg-brand-gold mr-0 group-hover:mr-2 transition-all duration-300"></span>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-brand-gold">Shop Categories</h3>
            <ul className="space-y-4">
              {[
                { label: "Millet Cookies", slug: "cookies" },
                { label: "Millet Laddus", slug: "laddus" },
                { label: "Healthy Snacks", slug: "snacks" },
                { label: "Organic Grains", slug: "grains" }
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link 
                    href={`/shop?category=${cat.slug}`} 
                    className="text-emerald-100/60 hover:text-brand-gold text-[13px] font-bold transition-all flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-[2px] bg-brand-gold mr-0 group-hover:mr-2 transition-all duration-300"></span>
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-brand-gold">Get In Touch</h3>
            <div className="flex items-start space-x-4 group cursor-pointer">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all">
                <MapPin size={18} />
              </div>
              <p className="text-emerald-100/70 text-[13px] font-medium leading-relaxed">9 NUTZ MILLETS NEAR YSR STATUE,<br />LN PURAM, AP.</p>
            </div>
            <div className="flex items-center space-x-4 group cursor-pointer">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all">
                <Phone size={18} />
              </div>
              <p className="text-emerald-100/70 text-[13px] font-bold">+91 9949131747</p>
            </div>
            <div className="flex items-center space-x-4 group cursor-pointer">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all">
                <Mail size={18} />
              </div>
              <p className="text-emerald-100/70 text-[13px] font-bold break-all">nallamilli@gmail.com</p>
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-100/40">
            © {currentYear} 9 Nutzz Millets. Handcrafted with heart.
          </p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-[10px] uppercase font-black tracking-widest text-emerald-100/40 hover:text-brand-gold transition-colors">Privacy</Link>
            <Link href="/terms" className="text-[10px] uppercase font-black tracking-widest text-emerald-100/40 hover:text-brand-gold transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
