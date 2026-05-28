"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import InquiryModal from "@/components/InquiryModal";

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  const { toggle: toggleCart, isInCart } = useCart();
  const [inquiryOpen, setInquiryOpen] = useState(false);

  return (
    <div className="bg-[#F8F4ED] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <h1 className="text-2xl font-black text-stone-800">
            My Wishlist
            <span className="ml-2 text-[#C9A55A]">({items.length})</span>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <svg className="w-16 h-16 text-stone-200 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <p className="text-stone-400 text-sm mb-4">Your wishlist is empty.</p>
            <Link href="/products" className="inline-block bg-[#C9A55A] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#B8935A] transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((product) => (
                <div key={product.id} className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-stone-400 hover:shadow-lg transition-all duration-200 relative">
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="relative aspect-square bg-stone-50 overflow-hidden">
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="p-3 pb-2">
                      <p className="text-stone-700 text-sm font-medium line-clamp-2 leading-snug">{product.name}</p>
                      <p className="text-[#C9A55A] text-xs mt-1.5 font-semibold tracking-wide">{product.category}</p>
                      <div className="mt-2 flex gap-1.5">
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCart({ id: product.id, name: product.name, category: product.category, image: product.image }); }}
                          className={`w-9 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all border ${
                            isInCart(product.id) ? "bg-orange-500 border-orange-500" : "bg-white border-stone-200 hover:border-orange-400"
                          }`}
                        >
                          <svg className={`w-4 h-4 ${isInCart(product.id) ? "text-white" : "text-stone-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setInquiryOpen(true); }}
                          className="flex-1 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg py-1 transition-colors"
                        >
                          Inquiry Now
                        </button>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => remove(product.id)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-orange-50 transition-colors z-10"
                    title="Remove from wishlist"
                  >
                    <svg className="w-4 h-4 text-orange-500 fill-orange-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/products" className="text-[#C9A55A] text-sm font-semibold hover:text-[#B8935A] transition-colors">
                ← Continue Browsing
              </Link>
            </div>
          </>
        )}
      </div>
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
}
