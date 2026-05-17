"use client";
import { useState, useEffect } from "react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-200 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left flex items-start justify-between gap-4 py-5 px-1 group"
      >
        <span className="text-stone-800 font-medium text-sm leading-relaxed group-hover:text-orange-600 transition-colors">
          {q}
        </span>
        <span className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all mt-0.5 ${open ? "rotate-45 border-orange-500 text-orange-500" : "border-stone-300 text-stone-500"}`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      {open && (
        <p className="text-stone-600 text-sm leading-relaxed pb-5 px-1 whitespace-pre-line">{a}</p>
      )}
    </div>
  );
}

export default function FaqSection({ page, title = "Frequently Asked Questions" }: { page: string; title?: string }) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    fetch(`/api/faqs?page=${page}`)
      .then((r) => r.json())
      .then((data) => setFaqs(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [page]);

  if (faqs.length === 0) return null;

  return (
    <section className="py-14 bg-stone-50 border-t border-stone-100">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-stone-900 mb-8 text-center">{title}</h2>
        <div className="bg-white rounded-2xl px-5 shadow-sm border border-stone-100">
          {faqs.map((faq) => (
            <FaqItem key={faq.id} q={faq.question} a={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
