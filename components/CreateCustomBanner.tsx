"use client";
import { useState } from "react";
import Image from "next/image";
import InquiryModal from "@/components/InquiryModal";

const highlights = [
  {
    label: "Creative Design",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    label: "Premium Quality",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    label: "Global Standards",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
      </svg>
    ),
  },
  {
    label: "Reliable Delivery",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
];


export default function CreateCustomBanner() {
  const [inquiryOpen, setInquiryOpen] = useState(false);

  return (
    <section className="relative bg-stone-900 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/factory-workshop.jpg')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-900/80 to-stone-900/70" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left: text */}
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              Custom Resin Toy OEM Factory<br />— Your Vision, Our Craft
            </h2>
            <p className="text-stone-300 text-base leading-relaxed mb-4">
              As a trusted resin figurine supplier from China, we help brands, wholesalers and creative studios turn original ideas into high-quality resin figurines, blind box collectibles and Zakka decor — from concept to finished product.
            </p>
            <p className="text-stone-300 text-sm leading-relaxed mb-8">
              Kelikuli is a custom resin toy manufacturer with low MOQ — supporting sample orders, small batches and large-volume wholesale resin figurines. Every piece is hand-painted by skilled craftsmen, making us the go-to resin toy OEM manufacturer for brands seeking quality and flexibility.
            </p>
            <button
              onClick={() => setInquiryOpen(true)}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full text-sm tracking-wide transition-colors shadow-lg shadow-orange-900/30"
            >
              Get a Free Quote
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            <div className="mt-10 flex flex-wrap gap-6">
              {highlights.map((h) => (
                <div key={h.label} className="flex items-center gap-2.5 text-stone-300">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-[#C9A55A]/30 flex items-center justify-center text-[#B8935A]">
                    {h.icon}
                  </div>
                  <span className="text-sm font-medium">{h.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: custom examples image */}
          <div className="flex-1 w-full max-w-xs sm:max-w-sm lg:max-w-md">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="/27bf2fe34fd3fae43b575e994f236881.jpg"
                alt="Custom resin toy OEM examples — from sketch to finished product"
                width={600}
                height={750}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

        </div>
      </div>

      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </section>
  );
}
