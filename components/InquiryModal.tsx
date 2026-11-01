"use client";
import { useEffect, useRef } from "react";
import QuoteForm, { type QuoteProduct } from "@/components/QuoteForm";
import type { QuoteContext } from "@/lib/content";

export default function InquiryModal({
  isOpen,
  onClose,
  cartProducts,
  defaultEmail,
  context,
}: {
  isOpen: boolean;
  onClose: () => void;
  cartProducts?: QuoteProduct[];
  defaultEmail?: string;
  context?: QuoteContext;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const items = dialog.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]",
        );
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialog.current)
        ) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-modal-title"
        tabIndex={-1}
        className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 text-stone-900 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#99732f]">
              Custom Lab · Project inquiry
            </p>
            <h2 id="quote-modal-title" className="mt-2 text-2xl font-semibold">
              Get a Quote
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close quote form"
            onClick={onClose}
            className="rounded-full bg-stone-100 px-3 py-2 text-lg"
          >
            ×
          </button>
        </div>
        <QuoteForm
          context={context}
          cartProducts={cartProducts}
          defaultEmail={defaultEmail}
        />
      </div>
    </div>
  );
}
