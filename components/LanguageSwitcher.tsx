"use client";
import { useState, useEffect, useRef } from "react";

const languages = [
  { code: "en",    label: "English",  },
  { code: "zh-CN", label: "中文",     },
  { code: "ar",    label: "العربية",  },
  { code: "es",    label: "Español",  },
  { code: "fr",    label: "Français", },
];

// Map browser language prefix → supported Google Translate code
const browserLangMap: Record<string, string> = {
  "zh": "zh-CN",
  "ar": "ar",
  "es": "es",
  "fr": "fr",
  "en": "en",
};

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

function detectBrowserLanguage(): string {
  const lang = (navigator.language || "en").toLowerCase();
  const prefix = lang.split("-")[0];
  return browserLangMap[prefix] ?? "en";
}

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: {
      translate: {
        TranslateElement: new (options: object, element: string) => void;
      };
    };
  }
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("en");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", includedLanguages: "zh-CN,ar,es,fr", autoDisplay: false },
        "google_translate_element"
      );

      // Auto-detect language only on first visit (no existing preference)
      const alreadySet = getCookie("googtrans") || getCookie("lang_user_set");
      if (!alreadySet) {
        const detected = detectBrowserLanguage();
        if (detected !== "en") {
          setCookie("googtrans", `/en/${detected}`);
          setCurrent(detected);
          // Wait for Google Translate select element to appear then trigger it
          const trySelect = (attempts = 0) => {
            const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
            if (select) {
              select.value = detected;
              select.dispatchEvent(new Event("change"));
            } else if (attempts < 15) {
              setTimeout(() => trySelect(attempts + 1), 400);
            }
          };
          trySelect();
        }
      } else {
        // Restore displayed language indicator from existing cookie
        const existing = getCookie("googtrans");
        if (existing) {
          const parts = existing.split("/");
          const code = parts[parts.length - 1];
          if (code && code !== "en") setCurrent(code);
        }
      }
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const translate = (code: string) => {
    setCurrent(code);
    setOpen(false);
    // Mark that user explicitly chose a language — skip auto-detect next time
    setCookie("lang_user_set", "1");

    if (code === "en") {
      deleteCookie("googtrans");
      window.location.reload();
      return;
    }

    setCookie("googtrans", `/en/${code}`);

    const trySelect = (attempts = 0) => {
      const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (select) {
        select.value = code;
        select.dispatchEvent(new Event("change"));
      } else if (attempts < 10) {
        setTimeout(() => trySelect(attempts + 1), 300);
      }
    };
    trySelect();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-stone-400 hover:text-[#C9A55A] transition-colors p-1"
        aria-label="Language"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-white shadow-xl rounded-xl border border-stone-100 py-1.5 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => translate(lang.code)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                current === lang.code
                  ? "text-[#C9A55A] bg-[#F5EDD8] font-semibold"
                  : "text-stone-600 hover:bg-[#F5EDD8] hover:text-[#C9A55A]"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}

      <div id="google_translate_element" className="hidden" />
    </div>
  );
}
