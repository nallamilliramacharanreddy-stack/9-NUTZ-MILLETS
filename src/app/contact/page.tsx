"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Globe } from "lucide-react";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white pt-28">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-brand-gold uppercase tracking-[0.3em] mb-4 block">Get In Touch</span>
          <h1 className="text-4xl md:text-5xl font-black text-brand-green">Contact Our Team</h1>
          <p className="text-gray-500 mt-4">We are here to help you start your millet journey.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-6 group">
                <div className="w-14 h-14 bg-brand-green/5 text-brand-green rounded-2xl flex items-center justify-center group-hover:bg-brand-gold group-hover:text-white transition-all shadow-sm">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-green mb-2 uppercase tracking-widest text-xs">Store Address</h3>
                  <p className="text-gray-500 font-medium">9 NUTZ MILLETS NEAR YSR STATUE, <br/>LN PURAM, GOLLALA MAMIDADA, AP.</p>
                </div>
              </div>

              <div className="flex items-start space-x-6 group">
                <div className="w-14 h-14 bg-brand-green/5 text-brand-green rounded-2xl flex items-center justify-center group-hover:bg-brand-gold group-hover:text-white transition-all shadow-sm">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-green mb-2 uppercase tracking-widest text-xs">Phone Number</h3>
                  <p className="text-gray-500 font-medium">+91 9949131747</p>
                </div>
              </div>

              <div className="flex items-start space-x-6 group">
                <div className="w-14 h-14 bg-brand-green/5 text-brand-green rounded-2xl flex items-center justify-center group-hover:bg-brand-gold group-hover:text-white transition-all shadow-sm">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-green mb-2 uppercase tracking-widest text-xs">Email Address</h3>
                  <p className="text-gray-500 font-medium">nallamilliramacharanreddy@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-brand-cream/20 rounded-[40px] border border-brand-green/5">
               <h4 className="text-xl font-bold text-brand-green mb-4">Store Hours</h4>
               <div className="space-y-2 text-sm text-gray-500 font-medium">
                  <div className="flex justify-between"><span>Mon - Sat</span><span>9:00 AM - 9:00 PM</span></div>
                  <div className="flex justify-between"><span>Sunday</span><span>10:00 AM - 6:00 PM</span></div>
               </div>
            </div>
          </div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12"
          >
             <h3 className="text-2xl font-black text-brand-green mb-8">Send Us a Message</h3>
             <form className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Full Name</label>
                   <input type="text" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Email</label>
                   <input type="email" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Message</label>
                   <textarea className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold transition-all" rows={4} />
                </div>
                <button className="w-full py-5 bg-brand-green text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center space-x-3">
                   <span>Send Message</span>
                   <Send size={20} />
                </button>
             </form>
          </motion.div>
        </div>
      </div>
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
