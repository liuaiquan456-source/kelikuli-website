"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/components/I18nProvider";
import { useCart } from "@/hooks/useCart";
import InquiryModal from "@/components/InquiryModal";
import ProductThumb from "@/components/ProductThumb";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Right-side quick-shopping panel. Positioned below the sticky header
// (top-14) on purpose so it never covers the site nav.
export default function CartDrawer({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const { items, remove, clear, setQuantity, email, switchAccount } = useCart();
  const [inquiryOpen, setInquiryOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`fixed top-14 left-0 right-0 bottom-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <div
        className={`fixed top-14 right-0 bottom-0 w-full sm:w-96 bg-white z-40 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-stone-100 shrink-0">
          <h2 className="text-sm font-black uppercase tracking-widest text-stone-700">
            {t("cartDrawer.title", "Your Cart")} <span className="text-[#C9A55A]">({items.length})</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {email && (
          <div className="flex items-center justify-between gap-2 px-5 py-2.5 bg-[#FAFAF9] border-b border-stone-100 text-xs shrink-0">
            <span className="text-stone-500 truncate">
              {t("cartDrawer.savedTo", "Saved to")} <span className="font-medium text-stone-700">{email}</span>
            </span>
            <button onClick={switchAccount} className="text-[#C9A55A] font-semibold hover:underline shrink-0">
              {t("cartDrawer.switch", "Switch")}
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-12 h-12 text-stone-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              <p className="text-stone-400 text-sm mb-4">{t("cartDrawer.empty", "Your cart is empty.")}</p>
              <Link
                href="/products"
                onClick={onClose}
                className="inline-block bg-[#C9A55A] text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-[#B8935A] transition-colors"
              >
                {t("cart.browseProducts", "Browse Products")}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((p) => (
                <div key={p.id} className="flex gap-3 p-2.5 bg-white border border-stone-100 rounded-xl">
                  <Link href={`/products/${p.id}`} onClick={onClose} className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-stone-50">
                    <ProductThumb src={p.image} alt={p.name} className="w-14 h-14" imgClassName="w-14 h-14 object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${p.id}`} onClick={onClose}>
                      <p className="text-xs font-medium text-stone-700 line-clamp-2 leading-snug hover:text-[#C9A55A] transition-colors">
                        {p.name}
                      </p>
                    </Link>
                    <p className="text-[10px] text-[#C9A55A] font-semibold mt-1">{p.category}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-stone-400">{t("cartDrawer.qty", "Qty")}</span>
                      <input
                        type="number"
                        min={1}
                        value={p.quantity ?? p.moq ?? 1}
                        onChange={(e) => setQuantity(p.id, Number(e.target.value))}
                        className="w-16 border border-stone-200 rounded-md px-1.5 py-0.5 text-xs text-stone-700 focus:outline-none focus:border-[#C9A55A]"
                      />
                      <span className="text-[10px] text-stone-400">{t("cartDrawer.pcs", "pcs")}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(p.id)}
                    className="shrink-0 self-start text-stone-300 hover:text-red-500 transition-colors"
                    title={t("cartDrawer.remove", "Remove")}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-4 py-4 border-t border-stone-100 space-y-2 shrink-0">
            <button
              onClick={() => setInquiryOpen(true)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-sm"
            >
              {t("cartDrawer.submitInquiry", "Submit Inquiry")} ({items.length})
            </button>
            <button onClick={clear} className="w-full text-xs text-stone-400 hover:text-red-500 transition-colors py-1">
              {t("cart.clearAll", "Clear All")}
            </button>
          </div>
        )}
      </div>

      <InquiryModal
        isOpen={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        cartProducts={items}
        defaultEmail={email ?? undefined}
      />
    </>
  );
}
