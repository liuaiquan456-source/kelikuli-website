"use client";
import { useState, useEffect, useRef } from "react";

const languages = [
  { code: "en",    label: "English",    flag: "🇬🇧" },
  { code: "zh-CN", label: "中文",       flag: "🇨🇳" },
  { code: "ja",    label: "日本語",     flag: "🇯🇵" },
  { code: "ko",    label: "한국어",     flag: "🇰🇷" },
  { code: "ar",    label: "العربية",   flag: "🇸🇦" },
  { code: "es",    label: "Español",    flag: "🇪🇸" },
  { code: "fr",    label: "Français",   flag: "🇫🇷" },
  { code: "vi",    label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "ms",    label: "Melayu",     flag: "🇲🇾" },
  { code: "id",    label: "Indonesia",  flag: "🇮🇩" },
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
        className="flex items-center gap-1.5 text-stone-400 hover:text-[#C9A55A] transition-colors p-1"
        aria-label="Language"
      >
        <span className="text-lg leading-none">{currentLang?.flag ?? "🌐"}</span>
        <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white shadow-xl rounded-xl border border-stone-100 py-1.5 z-50 max-h-80 overflow-y-auto">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => translate(lang.code)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2.5 ${
                current === lang.code
                  ? "text-[#C9A55A] bg-[#F5EDD8] font-semibold"
                  : "text-stone-600 hover:bg-[#F5EDD8] hover:text-[#C9A55A]"
              }`}
            >
              <span className="text-base leading-none">{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>
      )}

      <div id="google_translate_element" className="hidden" />
    </div>
  );
}
