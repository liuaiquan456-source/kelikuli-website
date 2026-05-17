"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import InquiryModal from "@/components/InquiryModal";


const slides = [
  {
    src: "/images/banner-6.png",
    alt: "Kelikuli Resin Toy Showroom — custom resin figurines and collectibles display",
    contentType: "main",
  },
  {
    src: "/images/banner-lamp.png",
    alt: "Resin Decoration Light — artistically crafted resin lamps and figurines by Kelikuli",
    contentType: "lamp",
  },
  {
    src: "/images/banner-4.png",
    alt: "Prince Collection — storybook-inspired collectible resin figurines by Kelikuli",
    contentType: "button",
    btnPos: "center",
  },
  {
    src: "/images/banner-2.png",
    alt: "Custom Blind Box Toys — OEM ODM services for collectible figurines and blind box series",
    contentType: "button",
    btnPos: "right",
  },
  {
    src: "/images/banner-3.png",
    alt: "Custom Halloween and Christmas Decor — seasonal resin crafts wholesale manufacturer",
    contentType: "button",
    btnPos: "center",
  },
];

const featureIcons = [
  {
    label: "OEM/ODM\nCustomization",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Custom\nDesign",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    label: "Low MOQ\nManufacture",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    label: "Global\nStandards",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    label: "Strict QC\nProcesses",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
    setIsPaused(false);
  };

  return (
    <>
      <section
        className="relative w-full overflow-hidden bg-stone-900 select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full aspect-[4/3] sm:aspect-[2/1] lg:aspect-[3/1]">
          {slides.map((slide, i) => (
            <div
              key={slide.src}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                i === current ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
              aria-hidden={i !== current}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="100vw"
                className="object-cover object-center"
                priority={i === 0}
                loading="eager"
                draggable={false}
              />

              {/* Slide 1: main */}
              {slide.contentType === "main" && (
                <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black/50 via-black/35 to-transparent">
                  <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-[52%] lg:max-w-[44%] lg:ml-[8%]">
                    <h1 className="font-black leading-tight mb-2">
                      <span className="block text-[#C9A55A] text-xl sm:text-3xl lg:text-4xl xl:text-[2.6rem] drop-shadow-lg uppercase">
                        Resin Figurine
                      </span>
                      <span className="block text-white text-xl sm:text-3xl lg:text-4xl xl:text-[2.6rem] drop-shadow-lg uppercase">
                        Manufacturer
                      </span>
                    </h1>
                    <p className="text-white/80 text-[10px] sm:text-xs lg:text-sm mb-3 font-medium drop-shadow">
                      Custom Resin Toy Factory &nbsp;|&nbsp; Blind Box Manufacturer &nbsp;|&nbsp; Wholesale Resin Figurines
                    </p>
                    <div className="hidden sm:flex gap-2 lg:gap-4 mb-3">
                      {featureIcons.map((f) => (
                        <div key={f.label} className="flex flex-col items-center gap-1">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-black/40 backdrop-blur-sm border border-[#C9A55A]/40 flex items-center justify-center text-[#C9A55A]">
                            {f.icon}
                          </div>
                          <span className="text-[8px] lg:text-[9px] text-white/80 text-center whitespace-pre-line leading-tight font-medium">
                            {f.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="hidden sm:flex items-center mb-3 w-fit">
                      <span className="bg-[#C9A55A] text-white text-[10px] lg:text-xs font-black px-3 py-1.5 rounded-l-full tracking-wide uppercase">
                        Blind Box Customization
                      </span>
                      <span className="bg-white/90 text-stone-700 text-[10px] lg:text-xs font-medium px-3 py-1.5 rounded-r-full italic">
                        Your Vision, Premium Excellence.
                      </span>
                    </div>
                    <div className="hidden lg:grid grid-cols-2 gap-x-4 gap-y-1 mb-4">
                      {["OEM/ODM Custom Orders", "Hand-Painted Quality", "Low MOQ Accepted", "Eco-friendly"].map((item) => (
                        <div key={item} className="flex items-center gap-1.5 text-white/90">
                          <svg className="w-3 h-3 text-[#C9A55A] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[10px] lg:text-xs font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setInquiryOpen(true)}
                      className="bg-[#C9A55A] hover:bg-[#B8935A] text-white font-bold px-5 py-2 rounded-full text-xs lg:text-sm tracking-wide transition-colors shadow-lg"
                    >
                      Get a Quote
                    </button>
                  </div>
                  </div>
                </div>
              )}

              {/* Slide 2: lamp */}
              {slide.contentType === "lamp" && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent">
                  <div className="absolute left-4 sm:left-8 lg:left-[6%] top-1/2 -translate-y-1/2 max-w-[45%] lg:max-w-[38%]">
                    <h2 className="font-black leading-tight drop-shadow-lg uppercase mb-2">
                      <span className="block text-white text-xl sm:text-3xl lg:text-4xl xl:text-[2.8rem]">
                        Resin Decoration
                      </span>
                      <span className="block text-[#C9A55A] text-xl sm:text-3xl lg:text-4xl xl:text-[2.8rem]">
                        Light
                      </span>
                    </h2>
                    <p className="hidden sm:block text-white/75 text-[10px] sm:text-sm lg:text-base font-medium drop-shadow mb-4 italic">
                      Handcrafted Resin Decor for Warm, Cozy Spaces
                    </p>
                    <div className="hidden sm:flex flex-col gap-2 mb-5">
                      <div className="flex items-center gap-2 text-white/90">
                        <svg className="w-4 h-4 text-[#C9A55A] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        <span className="text-xs font-medium">Handcrafted Resin</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/90">
                        <svg className="w-4 h-4 text-[#C9A55A] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
                        </svg>
                        <span className="text-xs font-medium">Warm Ambient Light</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/90">
                        <svg className="w-4 h-4 text-[#C9A55A] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                        <span className="text-xs font-medium">Unique Gift Ideas</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setInquiryOpen(true)}
                      className="bg-[#C9A55A] hover:bg-[#B8935A] text-white font-bold px-5 lg:px-6 py-2.5 rounded-full text-xs lg:text-sm tracking-wide transition-colors shadow-lg"
                    >
                      Get a Quote
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Other slides: simple button */}
          {slides[current].contentType === "button" && (
            <div className={`absolute bottom-8 z-20 flex items-center left-1/2 -translate-x-1/2 ${
              slides[current].btnPos === "right"
                ? "lg:left-auto lg:translate-x-0 lg:right-[20%]"
                : ""
            }`}>
              <button
                onClick={() => setInquiryOpen(true)}
                className="bg-[#C9A55A]/60 hover:bg-[#C9A55A]/80 backdrop-blur-sm border border-[#C4A97A]/50 text-white font-bold px-5 py-2 rounded-full text-sm tracking-wide transition-colors shadow-lg"
              >
                Get a quote
              </button>
            </div>
          )}
        </div>

        {/* Prev arrow */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Next arrow */}
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </section>

      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </>
  );
}
