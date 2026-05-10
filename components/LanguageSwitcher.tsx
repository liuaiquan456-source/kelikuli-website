"use client";
import { useState, useEffect, useRef } from "react";

const languages = [
  { code: "en",    label: "English"   },
  { code: "zh-CN", label: "中文"      },
  { code: "ja",    label: "日本語"    },
  { code: "ko",    label: "한국어"    },
  { code: "ar",    label: "العربية"  },
  { code: "es",    label: "Español"   },
  { code: "fr",    label: "Français"  },
  { code: "vi",    label: "Tiếng Việt"},
  { code: "ms",    label: "Melayu"    },
  { code: "id",    label: "Indonesia" },
];

// Country code → Google Translate language code
const countryLangMap: Record<string, string> = {
  // East Asia
  JP: "ja", KR: "ko",
  CN: "zh-CN", TW: "zh-CN", HK: "zh-CN", MO: "zh-CN",
  // Southeast Asia
  VN: "vi", MY: "ms", ID: "id", SG: "ms",
  TH: "th", PH: "tl",
  // Arabic-speaking countries
  SA: "ar", AE: "ar", EG: "ar", MA: "ar", DZ: "ar",
  IQ: "ar", KW: "ar", QA: "ar", BH: "ar", JO: "ar",
  LB: "ar", LY: "ar", OM: "ar", TN: "ar", YE: "ar",
  SD: "ar", SY: "ar",
  // Spanish-speaking countries
  ES: "es", MX: "es", AR: "es", CO: "es", PE: "es",
  VE: "es", CL: "es", EC: "es", GT: "es", CU: "es",
  BO: "es", DO: "es", HN: "es", PY: "es", SV: "es",
  NI: "es", CR: "es", PA: "es", UY: "es",
  // French-speaking countries
  FR: "fr", BE: "fr", CH: "fr", LU: "fr",
  SN: "fr", CI: "fr", CM: "fr", CD: "fr",
};

// Supported language codes in Google Translate config
const SUPPORTED = new Set(languages.map((l) => l.code));

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: { translate: { TranslateElement: new (o: object, el: string) => void } };
  }
}

function getCookie(name: string) {
  const m = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return m ? m[2] : null;
}
function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000`;
}
function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function applyLanguage(code: string, setCurrentFn: (c: string) => void) {
  if (!code || code === "en") return;
  setCookie("googtrans", `/en/${code}`);
  setCurrentFn(code);
  const trySelect = (attempts = 0) => {
    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event("change"));
    } else if (attempts < 20) {
      setTimeout(() => trySelect(attempts + 1), 400);
    }
  };
  trySelect();
}

async function detectLanguageByIP(): Promise<string> {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    const country: string = (data.country_code ?? "").toUpperCase();
    const lang = countryLangMap[country];
    if (lang && SUPPORTED.has(lang)) return lang;
  } catch { /* ignore */ }

  // Fallback: browser language
  const prefix = (navigator.language ?? "en").split("-")[0].toLowerCase();
  const browserMap: Record<string, string> = {
    zh: "zh-CN", ja: "ja", ko: "ko", ar: "ar",
    es: "es", fr: "fr", vi: "vi", ms: "ms", id: "id",
  };
  return browserMap[prefix] ?? "en";
}

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("en");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "zh-CN,ja,ko,ar,es,fr,vi,ms,id,th,tl",
          autoDisplay: false,
        },
        "google_translate_element"
      );

      const userChose = getCookie("lang_user_set");
      const existing  = getCookie("googtrans");

      if (existing) {
        // Restore indicator from saved cookie
        const parts = existing.split("/");
        const code = parts[parts.length - 1];
        if (code && code !== "en") setCurrent(code);
        // Re-apply translation (Google Translate resets on page load)
        if (!userChose) return; // auto-set cookie, just restore
        applyLanguage(code, setCurrent);
      } else if (!userChose) {
        // First visit: detect by IP then apply
        detectLanguageByIP().then((lang) => {
          if (lang && lang !== "en") {
            applyLanguage(lang, setCurrent);
          }
        });
      }
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const translate = (code: string) => {
    setCurrent(code);
    setOpen(false);
    setCookie("lang_user_set", "1"); // remember user's manual choice

    if (code === "en") {
      deleteCookie("googtrans");
      window.location.reload();
      return;
    }
    applyLanguage(code, setCurrent);
  };

  const currentLang = languages.find((l) => l.code === current);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-stone-400 hover:text-[#C9A55A] transition-colors p-1"
        aria-label="Language"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
        {currentLang && current !== "en" && (
          <span className="text-xs font-medium text-[#C9A55A] hidden sm:inline">
            {currentLang.label}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white shadow-xl rounded-xl border border-stone-100 py-1.5 z-50 max-h-80 overflow-y-auto">
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
