"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/components/I18nProvider";

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

// Country code → language code, used only for first-visit auto-detection
const countryLangMap: Record<string, string> = {
  JP: "ja", KR: "ko",
  CN: "zh-CN", TW: "zh-CN", HK: "zh-CN", MO: "zh-CN",
  VN: "vi", MY: "ms", ID: "id", SG: "ms",
  SA: "ar", AE: "ar", EG: "ar", MA: "ar", DZ: "ar",
  IQ: "ar", KW: "ar", QA: "ar", BH: "ar", JO: "ar",
  LB: "ar", LY: "ar", OM: "ar", TN: "ar", YE: "ar",
  SD: "ar", SY: "ar",
  ES: "es", MX: "es", AR: "es", CO: "es", PE: "es",
  VE: "es", CL: "es", EC: "es", GT: "es", CU: "es",
  BO: "es", DO: "es", HN: "es", PY: "es", SV: "es",
  NI: "es", CR: "es", PA: "es", UY: "es",
  FR: "fr", BE: "fr", CH: "fr", LU: "fr",
  SN: "fr", CI: "fr", CM: "fr", CD: "fr",
};

function getCookie(name: string) {
  const m = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return m ? m[2] : null;
}
function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000`;
}

async function detectLanguageByIP(available: Set<string>): Promise<string | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    const country: string = (data.country_code ?? "").toUpperCase();
    const lang = countryLangMap[country];
    if (lang && available.has(lang)) return lang;
  } catch { /* ignore */ }

  const prefix = (navigator.language ?? "en").split("-")[0].toLowerCase();
  const browserMap: Record<string, string> = {
    zh: "zh-CN", ja: "ja", ko: "ko", ar: "ar",
    es: "es", fr: "fr", vi: "vi", ms: "ms", id: "id",
  };
  const guess = browserMap[prefix];
  return guess && available.has(guess) ? guess : null;
}

export default function LanguageSwitcher() {
  const router = useRouter();
  const { lang: current } = useTranslation();
  const [open, setOpen] = useState(false);
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/languages")
      .then((r) => r.json())
      .then((data: LanguageOption[]) => {
        setLanguages(Array.isArray(data) ? data : []);

        if (!getCookie("lang_user_set") && !getCookie("lang")) {
          const available = new Set(data.map((l) => l.code));
          detectLanguageByIP(available).then((detected) => {
            if (detected && detected !== "en") {
              setCookie("lang", detected);
              router.refresh();
            }
          });
        }
      })
      .catch(() => setLanguages([]));

    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [router]);

  const choose = (code: string) => {
    setOpen(false);
    setCookie("lang_user_set", "1");
    setCookie("lang", code);
    router.refresh();
  };

  const currentLang = languages.find((l) => l.code === current);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-stone-400 hover:text-[#C9A55A] transition-colors p-1"
        aria-label="Language"
      >
        <span className="text-lg leading-none">{currentLang?.flag || "🌐"}</span>
        <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white shadow-xl rounded-xl border border-stone-100 py-1.5 z-50 max-h-80 overflow-y-auto">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => choose(l.code)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2.5 ${
                current === l.code
                  ? "text-[#C9A55A] bg-[#F5EDD8] font-semibold"
                  : "text-stone-600 hover:bg-[#F5EDD8] hover:text-[#C9A55A]"
              }`}
            >
              <span className="text-base leading-none">{l.flag || "🌐"}</span>
              {l.nativeName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
