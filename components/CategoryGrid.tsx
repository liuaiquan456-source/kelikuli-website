import Link from "next/link";
import { getTranslator } from "@/lib/i18n";

const categories = [
  {
    key: "home.categories.figurines",
    title: "Resin Figurines",
    description:
      "Hand-painted matte resin figurines for collectibles, retail, and brand gifting. Custom character development available.",
    href: "/products/resin-figurines",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <circle cx="12" cy="5" r="2.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v5m-3 2.5 1.5 4m3-4-1.5 4M9 10.5h6" />
      </svg>
    ),
    color: "bg-[#F5EDD8] text-[#C9A55A]",
  },
  {
    key: "home.categories.blindBox",
    title: "Blind Box Collectibles",
    description:
      "Mystery blind box series with full art direction, packaging, and character IP development for brands and retailers.",
    href: "/products/blind-box",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    color: "bg-violet-50 text-violet-600",
  },
  {
    key: "home.categories.zakka",
    title: "Zakka Resin Ornaments",
    description:
      "Charming Zakka-style resin home decor — miniature figures, animals, and lifestyle pieces for wholesale and retail.",
    href: "/products/zakka-series",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    color: "bg-green-50 text-green-600",
  },
  {
    key: "home.categories.seasonal",
    title: "Seasonal Resin Crafts",
    description:
      "Christmas, Halloween, Easter, and holiday-themed resin gifts. Ready-to-wholesale seasonal collections updated annually.",
    href: "/products/seasonal-resin-crafts",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    color: "bg-red-50 text-red-600",
  },
  {
    key: "home.categories.customToys",
    title: "Custom Resin Toys",
    description:
      "Fully custom resin toy development from sketch to mass production. OEM/ODM for brands, IPs, and promotional campaigns.",
    href: "/products/custom-resin-toys",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    color: "bg-amber-50 text-amber-700",
  },
  {
    key: "home.categories.snowGlobes",
    title: "Snow Globes & More",
    description:
      "Resin snow globes, fridge magnets, and piggy banks. Great for souvenirs, promotional gifts, and gift shop wholesale.",
    href: "/products",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    color: "bg-sky-50 text-sky-600",
  },
];

export default async function CategoryGrid() {
  const t = await getTranslator();
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-[#C9A55A] font-semibold text-sm uppercase tracking-widest mb-3">
            {t("home.categories.eyebrow", "Our Products")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
            {t("home.categories.heading", "Resin Craft Categories")}
          </h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto">
            {t("home.categories.intro", "From collectible figurines to branded blind boxes — we manufacture a wide range of hand-painted resin products for global buyers.")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.href + cat.title}
              href={cat.href}
              className="group bg-white rounded-2xl p-7 border border-stone-100 shadow-sm hover:shadow-md hover:border-[#F0DFA8] transition-all duration-200"
            >
              <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200`}>
                {cat.icon}
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-[#C9A55A] transition-colors">
                {t(`${cat.key}.title`, cat.title)}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                {t(`${cat.key}.description`, cat.description)}
              </p>
              <div className="mt-4 flex items-center gap-1 text-[#C9A55A] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                {t("home.categories.learnMore", "Learn more")}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
