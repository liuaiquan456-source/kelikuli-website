import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  metadataBase: new URL("https://kelikuli.com"),
  title: {
    default: "Custom Resin Toys & Figurines Manufacturer | Kelikuli",
    template: "%s | Kelikuli",
  },
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
    images: [{ url: "https://kelikuli.com/images/kelikulilogo.png", width: 1200, height: 630, alt: "Kelikuli Resin Toy Factory" }],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Kelikuli Resin Toys & Crafts",
  alternateName: "Yiwu Kelikuli Cultural & Creative Co., Ltd.",
  foundingDate: "2005",
  description:
    "Kelikuli is a China-based resin toy and figurine factory offering OEM/ODM custom manufacturing for wholesale brands worldwide since 2005.",
  logo: "https://kelikuli.com/images/kelikulilogo.png",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Yiwu",
    addressRegion: "Zhejiang",
    addressCountry: "CN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+86-139-5795-9550",
    email: "860861@qq.com",
    contactType: "sales",
    availableLanguage: ["English", "Chinese"],
  },
  knowsAbout: [
    "resin toy manufacturing",
    "OEM ODM figurines",
    "blind box collectibles",
    "wholesale resin crafts",
    "custom resin figurines",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
