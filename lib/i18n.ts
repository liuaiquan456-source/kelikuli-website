import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const DEFAULT_LANGUAGE = "en";
export const LANG_COOKIE = "lang";

const FALLBACK_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", isDefault: true, active: true, sortOrder: 0 },
];

export const getActiveLanguages = cache(async () => {
  try {
    const langs = await prisma.language.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
    return langs.length ? langs : FALLBACK_LANGUAGES;
  } catch {
    return FALLBACK_LANGUAGES;
  }
});

export const getCurrentLanguage = cache(async (): Promise<string> => {
  const store = await cookies();
  return store.get(LANG_COOKIE)?.value || DEFAULT_LANGUAGE;
});

export const getTranslationMap = cache(async (languageCode: string): Promise<Record<string, string>> => {
  if (languageCode === DEFAULT_LANGUAGE) return {};
  try {
    const rows = await prisma.translation.findMany({ where: { languageCode } });
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    return {};
  }
});

export async function getTranslator() {
  const lang = await getCurrentLanguage();
  const dict = await getTranslationMap(lang);
  return (key: string, fallback: string) => dict[key] || fallback;
}
