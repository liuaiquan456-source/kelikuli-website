"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import FaqSection from "@/components/FaqSection";
import { useTranslation } from "@/components/I18nProvider";

const faqs: { categoryKey: string; category: string; items: { key: string; q: string; a: string }[] }[] = [
  {
    categoryKey: "faq.cat.ordering", category: "Ordering & MOQ",
    items: [
      {
        key: "faq.ordering.1",
        q: "What is your minimum order quantity (MOQ)?",
        a: "Our standard MOQ is 100 pieces per design. For custom OEM/ODM orders with your own artwork or IP, MOQ starts at 200 pieces per design. We can discuss lower quantities for sample orders — please contact us for details.",
      },
      {
        key: "faq.ordering.2",
        q: "Can I order samples before placing a bulk order?",
        a: "Yes. We offer pre-production samples (paid) so you can approve quality, color, and finish before committing to a full production run. Sample lead time is typically 7–15 business days.",
      },
      {
        key: "faq.ordering.3",
        q: "What payment terms do you accept?",
        a: "We accept T/T (bank transfer), PayPal, and Western Union. Standard terms are 30% deposit before production and 70% balance before shipment. For long-term partners we can discuss net payment terms.",
      },
      {
        key: "faq.ordering.4",
        q: "Do you have a product catalog?",
        a: "Yes. Please contact us via the inquiry form or WhatsApp and we will send you our latest catalog in PDF format, including current pricing and MOQ details.",
      },
    ],
  },
  {
    categoryKey: "faq.cat.custom", category: "Custom & OEM/ODM",
    items: [
      {
        key: "faq.custom.1",
        q: "Can you produce my own IP character or brand design?",
        a: "Absolutely. We specialize in OEM/ODM manufacturing. Provide us with your artwork files (AI, PSD, or 3D files) and we handle mold making, production, painting, and finishing. We sign NDAs to protect your IP.",
      },
      {
        key: "faq.custom.2",
        q: "What file formats do you need for custom orders?",
        a: "For 2D artwork: AI, EPS, or high-resolution PSD (300 dpi+). For 3D sculptures: STL, OBJ, or ZBrush files. If you only have reference images, our design team can create 3D models for you (design fee applies).",
      },
      {
        key: "faq.custom.3",
        q: "What is the lead time for custom products?",
        a: "Mold development takes 15–25 business days. Mass production after mold approval is typically 25–40 business days depending on quantity and complexity. We provide a detailed timeline at order confirmation.",
      },
      {
        key: "faq.custom.4",
        q: "Can you add custom packaging, tags, or inserts?",
        a: "Yes. We offer full custom packaging solutions including blind boxes, gift boxes, hang tags, poly bags, and inner foam/cardboard inserts with your branding.",
      },
    ],
  },
  {
    categoryKey: "faq.cat.quality", category: "Products & Quality",
    items: [
      {
        key: "faq.quality.1",
        q: "What materials do you use?",
        a: "Our products are made from high-quality polyresin (cold-cast resin), PVC, and ABS plastic depending on the product type. All materials comply with EN71, ASTM F963, and REACH safety standards. We can provide test reports on request.",
      },
      {
        key: "faq.quality.2",
        q: "Are your products safe for children?",
        a: "Products intended for ages 3+ are tested to EN71 (Europe) and ASTM F963 (US) safety standards. Please specify the target age group when inquiring so we can recommend the appropriate material and testing.",
      },
      {
        key: "faq.quality.3",
        q: "What finishing options are available?",
        a: "We offer hand-painting, spray painting, electroplating, UV coating, antique finish, glitter, and glow-in-the-dark options. Color matching to Pantone references is standard for bulk orders.",
      },
      {
        key: "faq.quality.4",
        q: "Can you do quality inspection before shipment?",
        a: "Yes. We perform in-house QC at multiple stages: post-molding, post-painting, and pre-shipment. We can also arrange third-party inspections (SGS, QIMA, etc.) at the buyer's request and cost.",
      },
    ],
  },
  {
    categoryKey: "faq.cat.shipping", category: "Shipping & Logistics",
    items: [
      {
        key: "faq.shipping.1",
        q: "Which countries do you ship to?",
        a: "We ship worldwide. Main destinations include the USA, UK, EU countries, Australia, Canada, Japan, and Southeast Asia. We work with freight forwarders for sea freight (FCL/LCL) and express couriers (DHL, FedEx, UPS) for smaller orders.",
      },
      {
        key: "faq.shipping.2",
        q: "What are the shipping costs and lead times?",
        a: "Sea freight (LCL) to the US/Europe takes approximately 25–40 days and is the most economical for large orders. Air freight takes 5–10 days. Express courier (DHL/FedEx) takes 3–7 days for smaller shipments. We quote shipping costs based on actual weight/volume.",
      },
      {
        key: "faq.shipping.3",
        q: "Do you handle customs clearance?",
        a: "We ship EXW or FOB Guangzhou/Shenzhen by default. We can arrange CIF or DDP shipments for an additional fee, which includes customs clearance at the destination. Please let us know your preferred Incoterm when ordering.",
      },
      {
        key: "faq.shipping.4",
        q: "Can you provide HS codes and commercial invoices for customs?",
        a: "Yes. We provide all necessary export documents including commercial invoice, packing list, Bill of Lading/Airway Bill, and certificate of origin. HS codes are provided for all products.",
      },
    ],
  },
  {
    categoryKey: "faq.cat.workingWithUs", category: "Working With Us",
    items: [
      {
        key: "faq.working.1",
        q: "How do I get started?",
        a: "Simply submit an inquiry via the form on this website, WhatsApp us directly, or email us with your product requirements. We typically respond within 24 hours on business days.",
      },
      {
        key: "faq.working.2",
        q: "Do you work with small businesses and startups?",
        a: "Yes. We work with brands at all stages — from first-time importers to large retailers. We can advise on the best approach for your budget and volume.",
      },
      {
        key: "faq.working.3",
        q: "Do you have a showroom or factory I can visit?",
        a: "Our factory is located in Guangdong, China. We welcome factory visits by appointment. Please contact us in advance so we can arrange your visit and ensure the right team members are available.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-200 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left flex items-start justify-between gap-4 py-5 px-1 group"
      >
        <span className="text-stone-800 font-medium text-sm leading-relaxed group-hover:text-orange-600 transition-colors">
          {q}
        </span>
        <span className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all mt-0.5 ${open ? "rotate-45 border-orange-500 text-orange-500" : "border-stone-300 text-stone-500"}`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      {open && (
        <p className="text-stone-600 text-sm leading-relaxed pb-5 px-1">{a}</p>
      )}
    </div>
  );
}

export default function FaqClient() {
  const { t } = useTranslation();
  return (
    <div>
      {/* Hero */}
      <section className="bg-stone-900 py-16 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-3">{t("faq.eyebrow", "Help Centre")}</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5">
            {t("header.nav.faq", "Frequently Asked Questions")}
          </h1>
          <p className="text-stone-300 text-lg leading-relaxed">
            {t("faq.heroDesc", "Everything you need to know about ordering, custom manufacturing, shipping, and working with Kelikuli.")}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-3">
        <Breadcrumb items={[{ label: t("header.nav.faq", "FAQ") }]} />
      </div>

      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-4">
                {t(section.categoryKey, section.category)}
              </h2>
              <div className="bg-stone-50 rounded-2xl px-5">
                {section.items.map((item) => (
                  <FaqItem key={item.key} q={t(`${item.key}.q`, item.q)} a={t(`${item.key}.a`, item.a)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DB-driven FAQs added from admin */}
      <FaqSection page="faq" title={t("faq.moreFaqs", "More FAQs")} />

      {/* CTA */}
      <section className="py-16 bg-[#F5EDD8]">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-stone-900 mb-3">{t("faq.ctaTitle", "Still have questions?")}</h2>
          <p className="text-stone-600 text-sm mb-6">
            {t("faq.ctaDesc", "Our team is ready to help with pricing, samples, custom orders, and anything else you need.")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="bg-stone-900 text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-stone-700 transition-colors"
            >
              {t("footer.contactUs", "Contact Us")}
            </Link>
            <a
              href="https://wa.me/8613724393505"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-green-600 transition-colors"
            >
              {t("faq.whatsappUs", "WhatsApp Us")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
