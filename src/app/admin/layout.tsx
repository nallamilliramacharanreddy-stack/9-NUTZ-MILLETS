"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, ListOrdered, Settings, LogOut, ChevronRight, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage"));
    router.push("/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin" },
    { name: "Products", icon: <ShoppingBag size={20} />, href: "/admin/products" },
    { name: "Orders", icon: <ListOrdered size={20} />, href: "/admin/orders" },
    { name: "Users", icon: <Users size={20} />, href: "/admin/users" },
    { name: "Settings", icon: <Settings size={20} />, href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-green text-white hidden md:flex flex-col fixed h-full z-20">
        <div className="p-8 border-b border-emerald-800">
           <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center">
                 <span className="text-brand-green font-bold">9</span>
              </div>
              <span className="text-xl font-black">Admin Panel</span>
           </Link>
        </div>
        
        <nav className="flex-grow p-4 mt-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all font-medium text-sm
                      ${isActive ? 'bg-brand-gold text-brand-green' : 'text-emerald-100 hover:bg-emerald-800'}`}
                  >
                    <div className="flex items-center space-x-3">
                       {item.icon}
                       <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight size={16} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-emerald-800">
           <button 
             onClick={handleLogout}
             className="flex items-center space-x-3 p-3 w-full text-emerald-100 hover:text-white transition-colors text-sm font-medium"
           >
              <LogOut size={20} />
              <span>Logout</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow md:ml-64 relative min-h-screen">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
           <h2 className="font-bold text-brand-green capitalize">{pathname.split("/").pop() || "Dashboard"}</h2>
           <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                 <p className="text-xs font-bold text-brand-green leading-none">Admin User</p>
                 <p className="text-[10px] text-gray-400 font-medium">Store Manager</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-brand-green font-bold">
                 AD
              </div>
           </div>
        </header>
        
        <div className="p-8">
           {children}
        </div>
      </main>
    </div>
  );
}
