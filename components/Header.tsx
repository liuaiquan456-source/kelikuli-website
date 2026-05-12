"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import InquiryModal from "@/components/InquiryModal";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Custom Service", href: "/custom-oem-odm" },
  { label: "News", href: "/news" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#1E1812]/60 backdrop-blur-md border-b border-[#C9A55A]/20 shadow-lg"
          : "bg-[#1E1812] border-b border-[#C9A55A]/20"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/images/kelikulilogo.png"
              alt="Kelikuli"
              width={120}
              height={40}
              className="h-9 w-auto rounded-md"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors pb-0.5 ${
                  pathname === link.href
                    ? "text-[#C9A55A] border-b-2 border-[#C9A55A]"
                    : "text-stone-300 hover:text-[#C9A55A]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => setInquiryOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-1.5 rounded-full transition-colors shadow-sm"
            >
              Inquiry Now
            </button>
          </nav>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/products" className="text-stone-400 hover:text-[#C9A55A] transition-colors p-1" aria-label="Search products">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
              </svg>
            </Link>
          </div>

          {/* Mobile: language + inquiry + hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setInquiryOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors shadow-sm"
            >
              Inquiry Now
            </button>
            <button
              className="p-2 text-stone-300 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile right-side drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer panel */}
          <div
            className="absolute top-0 right-0 h-full w-72 bg-[#1E1812] flex flex-col shadow-2xl"
            style={{ animation: "slideInRight 0.25s ease-out" }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-14 border-b border-[#C9A55A]/20 shrink-0">
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <Image
                  src="/images/kelikulilogo.png"
                  alt="Kelikuli"
                  width={100}
                  height={34}
                  className="h-8 w-auto rounded-md"
                />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3.5 rounded-xl text-sm font-medium transition-colors mb-1 ${
                    pathname === link.href
                      ? "bg-[#C9A55A]/15 text-[#C9A55A]"
                      : "text-stone-300 hover:bg-white/5 hover:text-[#C9A55A]"
                  }`}
                >
                  {pathname === link.href && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A55A] shrink-0" />
                  )}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Bottom actions */}
            <div className="px-4 py-5 border-t border-[#C9A55A]/20 space-y-3 shrink-0">
              <div className="flex items-center justify-between px-1">
                <span className="text-stone-400 text-xs">Language</span>
                <LanguageSwitcher />
              </div>
              <button
                onClick={() => { setInquiryOpen(true); setMobileOpen(false); }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-3 rounded-xl transition-colors shadow-sm"
              >
                Inquiry Now
              </button>
            </div>
          </div>
        </div>
      )}

      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </>
  );
}
