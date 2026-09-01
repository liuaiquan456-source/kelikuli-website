import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const DEFAULT_LANGUAGE = "en";
export const LANG_COOKIE = "lang";
const RTL_LANGUAGES = new Set(["ar", "he", "fa", "ur"]);

export function isRtl(languageCode: string): boolean {
  return RTL_LANGUAGES.has(languageCode);
}

const ENGLISH_LANGUAGE = {
  code: "en", name: "English", nativeName: "English", flag: "🇬🇧", isDefault: true, active: true, sortOrder: 0,
};

// English is the base language and is never stored in the `language` table,
// so always expose it first so users can switch back from a translated locale.
function withEnglish<T extends { code: string }>(langs: T[]): (T | typeof ENGLISH_LANGUAGE)[] {
  return langs.some((l) => l.code === DEFAULT_LANGUAGE) ? langs : [ENGLISH_LANGUAGE, ...langs];
}

export const getActiveLanguages = cache(async () => {
  try {
    const langs = await prisma.language.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
    return withEnglish(langs);
  } catch {
    return [ENGLISH_LANGUAGE];
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
