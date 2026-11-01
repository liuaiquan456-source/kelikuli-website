"use client";
import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { publicSourcePath } from "@/lib/content";
import { recordInquiryLanding } from "@/lib/quote-analytics";

export default function QuoteAnalytics({
  measurementId,
}: {
  measurementId: string;
}) {
  const pathname = usePathname();
  const initialized = useRef(false);
  const lastPath = useRef("");
  const valid = /^G-[A-Z0-9]+$/.test(measurementId);
  useEffect(() => {
    recordInquiryLanding(pathname);
    const safe = publicSourcePath(pathname);
    if (!valid || !safe) return;
    window.dataLayer ||= [];
    window.gtag ||= (...args: unknown[]) => {
      window.dataLayer!.push(args);
    };
    window.kelikuliGa4Id = measurementId;
    const location = `${window.location.origin}${safe}`;
    if (!initialized.current) {
      window.gtag("js", new Date());
      window.gtag("config", measurementId, {
        send_page_view: false,
        page_location: location,
        page_referrer: "",
        allow_google_signals: false,
      });
      initialized.current = true;
    }
    if (lastPath.current !== safe) {
      window.gtag("event", "page_view", {
        send_to: measurementId,
        page_location: location,
        page_path: safe,
        page_title: safe,
        page_referrer: lastPath.current
          ? `${window.location.origin}${lastPath.current}`
          : "",
      });
      lastPath.current = safe;
    }
  }, [pathname, measurementId, valid]);
  return valid && publicSourcePath(pathname) ? (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      strategy="afterInteractive"
    />
  ) : null;
}
