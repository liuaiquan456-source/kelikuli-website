"use client";
import { createContext, useContext, useMemo } from "react";

interface I18nContextValue {
  lang: string;
  t: (key: string, fallback: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  t: (_key, fallback) => fallback,
});

export default function I18nProvider({
  lang,
  dict,
  children,
}: {
  lang: string;
  dict: Record<string, string>;
  children: React.ReactNode;
}) {
  const value = useMemo<I18nContextValue>(
    () => ({ lang, t: (key, fallback) => dict[key] || fallback }),
    [lang, dict]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  return useContext(I18nContext);
}
