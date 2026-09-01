"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Fires a lightweight beacon to /api/track on every (public) page view so the
// admin analytics can show visitor country/IP/time.
export default function VisitTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    const payload = JSON.stringify({ path: pathname, referer: document.referrer || "" });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/track", {
          method: "POST",
          body: payload,
          headers: { "Content-Type": "application/json" },
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return null;
}
