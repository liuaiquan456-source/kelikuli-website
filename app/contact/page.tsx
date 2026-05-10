import type { Metadata } from "next";
import ContactForm from "./_form";

export const metadata: Metadata = {
  title: "Request a Free Quote — Contact Kelikuli Factory",
  description:
    "Get a free quote for custom resin toys, blind box collectibles, and OEM/ODM figurines. Contact Kelikuli factory — 24-hour response guaranteed.",
  alternates: { canonical: "https://kelikuli.com/contact" },
};

export default function ContactPage() {
  return <ContactForm />;
}
