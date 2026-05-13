import type { Metadata } from "next";
import ContactForm from "./_form";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Request a Free Quote — Contact Kelikuli Factory",
  description:
    "Get a free quote for custom resin toys, blind box collectibles, and OEM/ODM figurines. Contact Kelikuli factory — 24-hour response guaranteed.",
  alternates: { canonical: "https://kelikuli.com/contact" },
};

export default async function ContactPage() {
  const s = await getSettings();
  return <ContactForm whatsapp={s.whatsapp} wechat={s.wechat} email={s.email} address={s.address} />;
}
