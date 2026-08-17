import Link from "next/link";
import Image from "next/image";
import { getTranslator } from "@/lib/i18n";

const steps = [
  {
    key: "home.oemProcess.step1",
    num: "01",
    title: "Idea & Artwork Review",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    key: "home.oemProcess.step2",
    num: "02",
    title: "3D Design / Prototype",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
  {
    key: "home.oemProcess.step3",
    num: "03",
    title: "Mold Development",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    key: "home.oemProcess.step4",
    num: "04",
    title: "Resin Casting",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
  },
  {
    key: "home.oemProcess.step5",
    num: "05",
    title: "Hand Painting",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    key: "home.oemProcess.step6",
    num: "06",
    title: "QC & Packaging",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default async function OEMProcess() {
  const t = await getTranslator();
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left: steps */}
          <div className="flex-1">
            <p className="text-[#C9A55A] text-xs font-bold uppercase tracking-widest mb-2">
              {t("home.oemProcess.eyebrow", "One-Stop Service")}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4">
              {t("home.oemProcess.heading", "One-Stop OEM/ODM Resin Toy Service")}
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-8">
              {t("home.oemProcess.intro", "Kelikuli provides one-stop OEM/ODM resin toy services for brands, wholesalers, and gift companies. From 3D design, mold making, resin casting, hand painting to bulk production, we create custom resin figurines, blind box toys, ornaments, and collectible crafts.")}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {steps.map((step) => (
                <div key={step.num} className="flex flex-col items-start">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#C9A55A] font-black text-sm">{step.num}</span>
                    <div className="w-8 h-8 rounded-lg bg-[#F5EDD8] text-[#C9A55A] flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  <p className="text-stone-700 text-sm font-semibold leading-tight">{t(step.key, step.title)}</p>
                </div>
              ))}
            </div>

            <Link
              href="/custom-oem-odm"
              className="mt-8 inline-flex items-center gap-2 text-[#C9A55A] font-semibold hover:text-[#A8843A] text-sm transition-colors"
            >
              {t("home.oemProcess.learnMore", "Learn More About Our Process")}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Right: 2x2 image grid */}
          <div className="flex-1 max-w-md w-full">
            <div className="grid grid-cols-2 gap-3 relative">
              {[
                { label: "Raw Casting",      src: "/images/process/process-1.png" },
                { label: "Hand Painting",    src: "/images/process/process-2.png" },
                { label: "Quality Check",    src: "/images/process/process-3.png" },
                { label: "Finished Products",src: "/images/process/process-4.png" },
              ].map((img) => (
                <div
                  key={img.label}
                  className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100"
                >
                  <Image
                    src={img.src}
                    alt={`${img.label} — Kelikuli resin toy manufacturing process`}
                    fill
                    sizes="(max-width: 768px) 45vw, 200px"
                    className="object-cover"
                  />
                </div>
              ))}

              {/* Quality badge overlay */}
              <div className="absolute -bottom-3 -right-3 bg-orange-500 text-white rounded-xl px-3 py-2 shadow-lg">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span className="font-bold text-xs leading-tight">{t("home.oemProcess.qualityBadge", "Quality in Every Step")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
