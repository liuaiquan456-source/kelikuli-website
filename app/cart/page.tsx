"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import InquiryModal from "@/components/InquiryModal";
import ProductImage from "@/components/ProductImage";
import { useTranslation } from "@/components/I18nProvider";

export default function CartPage() {
  const { t } = useTranslation();
  const { items, remove, clear, setQuantity, email } = useCart();
  const [inquiryOpen, setInquiryOpen] = useState(false);

  return (
    <div className="bg-[#F8F4ED] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-[#C9A55A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            <h1 className="text-2xl font-black text-stone-800">
              {t("cart.title", "Inquiry Cart")}
              <span className="ml-2 text-[#C9A55A]">({items.length})</span>
            </h1>
          </div>
          {items.length > 0 && (
            <button
              onClick={clear}
              className="text-xs text-stone-400 hover:text-red-500 transition-colors"
            >
              {t("cart.clearAll", "Clear All")}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <svg className="w-16 h-16 text-stone-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            <p className="text-stone-400 text-sm mb-4">{t("cart.empty", "Your inquiry cart is empty.")}</p>
            <Link href="/products" className="inline-block bg-[#C9A55A] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#B8935A] transition-colors">
              {t("cart.browseProducts", "Browse Products")}
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((product) => (
                <div key={product.id} className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-stone-400 hover:shadow-lg transition-all duration-200 relative">
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="relative aspect-square bg-stone-50 overflow-hidden">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3 pb-2">
                      <p className="text-stone-700 text-sm font-medium line-clamp-2 leading-snug">{product.name}</p>
                      <p className="text-[#C9A55A] text-xs mt-1.5 font-semibold tracking-wide">{product.category}</p>
                    </div>
                  </Link>
                  <div className="px-3 pb-2 flex items-center gap-1.5">
                    <span className="text-[10px] text-stone-400">{t("cartDrawer.qty", "Qty")}</span>
                    <input
                      type="number"
                      min={1}
                      value={product.quantity ?? product.moq ?? 1}
                      onChange={(e) => setQuantity(product.id, Number(e.target.value))}
                      className="w-16 border border-stone-200 rounded-md px-1.5 py-0.5 text-xs text-stone-700 focus:outline-none focus:border-[#C9A55A]"
                    />
                    <span className="text-[10px] text-stone-400">{t("cartDrawer.pcs", "pcs")}</span>
                  </div>
                  <div className="px-3 pb-3">
                    <button
                      onClick={() => setInquiryOpen(true)}
                      className="w-full text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg py-1 transition-colors"
                    >
                      {t("header.inquiryNow", "Inquiry Now")}
                    </button>
                  </div>
                  <button
                    onClick={() => remove(product.id)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors z-10"
                    title={t("cart.removeTitle", "Remove from cart")}
                  >
                    <svg className="w-3.5 h-3.5 text-stone-500 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-stone-200 p-6">
              <div>
                <p className="text-stone-700 font-semibold text-sm">
                  {items.length > 1
                    ? t("cart.selectedPlural", "{n} products selected for inquiry").replace("{n}", String(items.length))
                    : t("cart.selectedSingular", "{n} product selected for inquiry").replace("{n}", String(items.length))}
                </p>
                <p className="text-stone-400 text-xs mt-0.5">{t("cart.sendHint", "Send an inquiry to get wholesale pricing")}</p>
              </div>
              <button
                onClick={() => setInquiryOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-8 py-3 rounded-full transition-colors shadow-sm whitespace-nowrap"
              >
                {t("cart.sendInquiry", "Send Inquiry")} ({items.length})
              </button>

            </div>

            <div className="mt-6 text-center">
              <Link href="/products" className="text-[#C9A55A] text-sm font-semibold hover:text-[#B8935A] transition-colors">
                ← {t("cart.continueBrowsing", "Continue Browsing")}
              </Link>
            </div>
          </>
        )}
      </div>
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} cartProducts={items} defaultEmail={email ?? undefined} />
    </div>
  );
}
