"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/components/I18nProvider";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

// Small popup shown the first time a visitor opens the cart: their email
// becomes the key for a per-account, server-saved shortlist.
export default function CartEmailGate({ isOpen, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setError("");
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t("cartGate.invalidEmail", "Please enter a valid email address."));
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[290] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-12 h-12 rounded-full bg-[#F5EDD8] flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-[#C9A55A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-stone-900 mb-1.5">{t("cartGate.title", "Access Your Cart")}</h3>
        <p className="text-stone-500 text-sm mb-5">
          {t("cartGate.desc", "Enter your email to save your product shortlist and pick it up again on any visit.")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            autoFocus
            maxLength={100}
            placeholder={t("cartGate.placeholder", "you@company.com")}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A55A] transition-colors"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#C9A55A] hover:bg-[#B8935A] text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            {t("cartGate.continue", "Continue")}
          </button>
        </form>
      </div>
    </div>
  );
}
