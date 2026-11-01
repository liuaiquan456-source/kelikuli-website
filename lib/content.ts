import type { Metadata } from "next";

export const siteUrl = "https://kelikuli.com";
export function contentMetadata(
  title: string,
  description: string,
  path: string,
  image = "/images/factory-workshop.jpg",
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}${path}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${path}`,
      images: [{ url: `${siteUrl}${image}`, alt: title }],
    },
  };
}

export type QuoteContext = {
  source?: string;
  service?: string;
  project?: string;
  product?: string;
};
export function quoteHref(context: QuoteContext = {}, upload = false) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(context))
    if (value) params.set(key, value);
  return `/get-a-quote${params.size ? `?${params}` : ""}${upload ? "#upload" : ""}`;
}

// Keep customer-provided text and query strings out of analytics and source URLs.
export function publicSourcePath(value: unknown): string {
  if (typeof value !== "string" || value.length > 500) return "";
  const clean = value.split(/[?#]/)[0];
  return /^\/(?:$|custom-oem-odm$|products(?:\/\d+)?$|services\/[a-z0-9-]+$|buying-guides(?:\/[a-z0-9-]+)?$|case-studies(?:\/[a-z0-9-]+)?$|resources$|industries$|faq$|about-us$|contact$|get-a-quote$|news(?:\/[a-z0-9-]+)?$|cart$|wishlist$)/.test(
    clean,
  )
    ? clean
    : "";
}
