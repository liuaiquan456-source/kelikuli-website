import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Custom Resin Toys & Figurines Manufacturer | Kelikuli",
  description:
    "Kelikuli manufactures custom resin toys, figurines, blind box collectibles, Zakka ornaments, and seasonal resin crafts with OEM/ODM service since 2005.",
  keywords: [
    "custom resin toys manufacturer",
    "resin figurines manufacturer",
    "resin crafts wholesale",
    "custom blind box manufacturer",
    "OEM ODM resin figurines",
    "hand painted resin ornaments",
    "Zakka resin ornaments wholesale",
    "seasonal resin crafts supplier",
    "collectible figurines manufacturer",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Kelikuli",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
