"use client";
import { useState } from "react";
import InquiryModal from "@/components/InquiryModal";

export default function InquiryButton({ label = "Start Your Custom Project" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-[#C9A55A] hover:bg-[#B8935A] text-white font-bold px-8 py-3.5 rounded-full text-sm transition-colors shadow-lg"
      >
        {label}
      </button>
      <InquiryModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
