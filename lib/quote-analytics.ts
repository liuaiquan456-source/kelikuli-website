import { publicSourcePath } from "./content";
import { normalizeAttribution, type InquiryAttribution } from "./inquiry-data";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    kelikuliGa4Id?: string;
  }
}
export function inquiryLandingPage() {
  try {
    return publicSourcePath(sessionStorage.getItem("kelikuli.inquiryLanding"));
  } catch {
    return "";
  }
}
export function recordInquiryLanding(path: string) {
  const safe = publicSourcePath(path);
  if (!safe || safe === "/get-a-quote") return;
  try {
    if (!inquiryLandingPage())
      sessionStorage.setItem("kelikuli.inquiryLanding", safe);
  } catch {
    /* Storage is optional. */
  }
}
export function trackSavedInquiry(attribution: InquiryAttribution) {
  if (typeof window === "undefined" || !window.kelikuliGa4Id || !window.gtag)
    return;
  const safe = normalizeAttribution(attribution);
  // Only controlled identifiers and paths leave the site. No contact details,
  // free-text fields, quantities, countries or attachment names go to GA4.
  window.gtag("event", "generate_lead", {
    send_to: window.kelikuliGa4Id,
    lead_source: "website_quote",
    source_page: safe.sourcePage,
    landing_page: safe.landingPage,
    service: safe.service,
    project: safe.project,
    product_id: safe.productId,
    page_location: `${window.location.origin}${publicSourcePath(window.location.pathname) || "/get-a-quote"}`,
  });
}
