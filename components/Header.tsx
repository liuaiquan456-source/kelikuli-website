"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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

interface SearchResult {
  type: "product" | "news";
  id: string;
  title: string;
  category: string;
  image?: string;
  href: string;
}

export default function Header() {
  const logo = "/images/kelikulilogo.png";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [allData, setAllData] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openSearch = useCallback(async () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
    if (allData.length > 0) return;
    const [productsData, postsData] = await Promise.all([
      fetch("/api/products?status=active").then((r) => r.json()).catch(() => []),
      fetch("/api/posts?published=true").then((r) => r.json()).catch(() => ({ posts: [] })),
    ]);
    const products = Array.isArray(productsData) ? productsData : [];
    const posts = Array.isArray(postsData?.posts) ? postsData.posts : [];
    const items: SearchResult[] = [
      ...products.map((p: { id: number; name: string; category: string; image?: string }) => ({
        type: "product" as const, id: String(p.id), title: p.name,
        category: p.category, image: p.image, href: `/products/${p.id}`,
      })),
      ...posts.map((p: { slug: string; title: string; category: string; image?: string }) => ({
        type: "news" as const, id: p.slug, title: p.title,
        category: p.category, image: p.image, href: `/news/${p.slug}`,
      })),
    ];
    setAllData(items);
  }, [allData.length]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    setSearchResults(allData.filter((r) => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)).slice(0, 8));
  }, [searchQuery, allData]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSearchOpen(false); };
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => { document.removeEventListener("keydown", handleKey); document.removeEventListener("mousedown", handleClick); };
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
              src={logo}
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
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={openSearch}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors rounded-full px-3 py-1.5 text-xs"
                aria-label="Search"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
                </svg>
                Search
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-stone-100 z-50 overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2.5 border-b border-stone-100">
                    <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
                    </svg>
                    <input
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && searchResults[0]) { router.push(searchResults[0].href); setSearchOpen(false); setSearchQuery(""); } }}
                      placeholder="Search products, news..."
                      className="flex-1 text-sm text-stone-800 placeholder-stone-400 focus:outline-none bg-transparent"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="text-stone-400 hover:text-stone-600">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {searchResults.length > 0 ? (
                    <div className="py-1.5 max-h-72 overflow-y-auto">
                      {searchResults.map((r) => (
                        <Link
                          key={r.type + r.id}
                          href={r.href}
                          onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-[#F5EDD8] transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-stone-100 shrink-0 overflow-hidden">
                            {r.image
                              ? <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">{r.type === "product" ? "📦" : "📰"}</div>}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-stone-700 line-clamp-1">{r.title}</p>
                            <p className="text-[10px] text-stone-400">{r.type === "product" ? "Product" : "News"} · {r.category}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <p className="text-xs text-stone-400 text-center py-6">No results for "{searchQuery}"</p>
                  ) : (
                    <p className="text-xs text-stone-400 text-center py-6">Type to search products &amp; news</p>
                  )}
                </div>
              )}
            </div>
            <LanguageSwitcher />
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
                  src={logo}
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
