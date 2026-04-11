import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Heart, ShieldCheck, Truck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-28">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-brand-gold uppercase tracking-[0.3em] mb-4 block">Our Story</span>
          <h1 className="text-4xl md:text-6xl font-black text-brand-green leading-tight">Eat Healthy. <br/><span className="gold-text">Live Strong.</span></h1>
        </div>

        <div className="space-y-12 text-gray-600 leading-relaxed text-lg">
          <p>
            At **9 Nutzz Millets**, we believe that ancient wisdom is the key to modern health. Located in the heart of East Godavari, we are dedicated to bringing the nutritional powerhouse of millets back to every dinner table in India.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
             <div className="bg-brand-green/5 p-10 rounded-[40px] border border-brand-green/10">
                <h3 className="text-2xl font-bold text-brand-green mb-4 italic">"Our Mission"</h3>
                <p className="text-sm italic">To provide chemical-free, nutrient-dense millet foods that empower local farmers and nourish our community.</p>
             </div>
             <p className="text-sm">
                From our handmade **Ragi Almond Cookies** to our protein-rich **Millet Energy Laddus**, every product is crafted with care using 100% organic ingredients sourced directly from local farms.
             </p>
          </div>

          <p>
            Founded by a vision to revolutionize snacking, 9 Nutzz Millets stands for purity, quality, and tradition. We don't just sell food; we share a lifestyle centered around wholesome nutrition and sustainable living.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-10 border-y">
            <div className="text-center">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={24} />
               </div>
               <h4 className="font-bold text-brand-green uppercase text-xs tracking-widest">100% Organic</h4>
            </div>
            <div className="text-center">
               <div className="w-12 h-12 bg-amber-50 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart size={24} />
               </div>
               <h4 className="font-bold text-brand-green uppercase text-xs tracking-widest">Heart Healthy</h4>
            </div>
            <div className="text-center">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck size={24} />
               </div>
               <h4 className="font-bold text-brand-green uppercase text-xs tracking-widest">Local Delivery</h4>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
