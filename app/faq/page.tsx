import type { Metadata } from "next";
import FaqClient from "./_client";

export const metadata: Metadata = {
  title: "FAQ — Kelikuli Resin Toys Manufacturer",
  description:
    "Answers to common questions about ordering, MOQ, custom OEM/ODM resin toys, shipping, payment, and working with Kelikuli factory.",
  alternates: { canonical: "https://kelikuli.com/faq" },
};

export default function FaqPage() {
  return <FaqClient />;
}
