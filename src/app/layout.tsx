import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "9 Nutzz Millets | Premium Organic Millet Foods",
  description: "Eat Healthy. Live Strong. Premium millet cookies, laddus, and snacks from the heart of India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased`}>
        <Navbar />
        <main>{children}</main>
        {/* Footer will be added here */}
      </body>
    </html>
  );
}
