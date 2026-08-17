import { getTranslator } from "@/lib/i18n";

const brands = [
  "Pure Design",
  "Nordic Living",
  "Tiny World",
  "Artisan Studio",
  "Play House",
  "Creative Collective",
];

export default async function TrustedBrands() {
  const t = await getTranslator();
  return (
    <section className="py-10 bg-white border-y border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-stone-400 mb-8">
          {t("home.trustedBrands.heading", "Trusted by Global Brands")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-5 lg:gap-14">
          {brands.map((brand) => (
            <span
              key={brand}
              className="text-stone-300 font-black text-sm sm:text-base lg:text-lg tracking-tight uppercase hover:text-stone-500 transition-colors cursor-default"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
