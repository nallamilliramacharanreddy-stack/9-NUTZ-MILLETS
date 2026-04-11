"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Heart, Share2, Globe } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-green text-white py-16">
      <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Section */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center space-x-2 grayscale brightness-0 invert">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-brand-green font-bold text-xl">9</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-none">Nutzz</h1>
              <p className="text-[10px] uppercase tracking-widest text-[#d4af37] font-semibold">Millets</p>
            </div>
          </Link>
          <p className="text-emerald-100 text-sm leading-relaxed max-w-xs">
            Bringing the ancient goodness of millets to your modern table. 100% organic, 100% healthy, 100% delicious snacks and cookies.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="#" className="p-2 bg-emerald-800 rounded-full hover:bg-brand-gold transition-colors">
              <Heart size={18} />
            </Link>
            <Link href="#" className="p-2 bg-emerald-800 rounded-full hover:bg-brand-gold transition-colors">
              <Share2 size={18} />
            </Link>
            <Link href="#" className="p-2 bg-emerald-800 rounded-full hover:bg-brand-gold transition-colors">
              <Globe size={18} />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold mb-6 text-brand-gold">Quick Links</h3>
          <ul className="space-y-4 text-emerald-100 text-sm">
            <li><Link href="/shop" className="hover:text-white transition-colors">Shop All</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
            <li><Link href="/order-tracking" className="hover:text-white transition-colors">Track Your Order</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-lg font-bold mb-6 text-brand-gold">Categories</h3>
          <ul className="space-y-4 text-emerald-100 text-sm">
            <li><Link href="/shop?category=cookies" className="hover:text-white transition-colors">Millet Cookies</Link></li>
            <li><Link href="/shop?category=laddus" className="hover:text-white transition-colors">Millet Laddus</Link></li>
            <li><Link href="/shop?category=snacks" className="hover:text-white transition-colors">Healthy Snacks</Link></li>
            <li><Link href="/shop?category=grains" className="hover:text-white transition-colors">Organic Grains</Link></li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold mb-6 text-brand-gold">Store Address</h3>
          <div className="flex items-start space-x-3 text-emerald-100 text-sm">
            <MapPin size={18} className="text-brand-gold shrink-0 mt-1" />
            <p>9 NUTZ MILLETS NEAR YSR STATUE, LN PURAM, GOLLALA MAMIDADA, AP.</p>
          </div>
          <div className="flex items-center space-x-3 text-emerald-100 text-sm">
            <Phone size={18} className="text-brand-gold shrink-0" />
            <p>+91 9949131747</p>
          </div>
          <div className="flex items-center space-x-3 text-emerald-100 text-sm">
            <Mail size={18} className="text-brand-gold shrink-0" />
            <p>nallamilliramacharanreddy@gmail.com</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-8 mt-16 pt-8 border-t border-emerald-800 text-center text-xs text-emerald-300">
        <p>© {currentYear} 9 Nutzz Millets. All rights reserved. Eat Healthy, Live Strong.</p>
        <p className="mt-2 flex items-center justify-center gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Delivery</Link>
        </p>
      </div>
    </footer>
  );
}
