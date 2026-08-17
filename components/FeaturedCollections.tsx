import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getTranslator } from "@/lib/i18n";

const categoryColors: Record<string, string> = {
  "Astronaut Series":  "from-sky-100 to-blue-50",
  "Christmas Series":  "from-red-100 to-rose-50",
  "Figurines":         "from-pink-100 to-rose-50",
  "Garden Series":     "from-green-100 to-emerald-50",
  "Halloween Series":  "from-orange-100 to-amber-50",
  "Lucky Cat":         "from-amber-100 to-yellow-50",
  "Piggy Bank":        "from-violet-100 to-purple-50",
  "Prince Series":     "from-indigo-100 to-blue-50",
  "Resin Crafts":      "from-teal-100 to-cyan-50",
};

const bottomBadges = [
  {
    key: "home.featured.badge1",
    title: "Strict Quality Control",
    sub: "From raw materials to finished products",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    key: "home.featured.badge2",
    title: "OEM/ODM Support",
    sub: "Low MOQ & flexible solutions",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: "home.featured.badge3",
    title: "On-Time Delivery",
    sub: "Fast lead time & reliable shipping",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "home.featured.badge4",
    title: "Worldwide Shipping",
    sub: "Export to 30+ countries",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64" />
      </svg>
    ),
  },
];

// Priority order for featured display
const featuredOrder = [
  "Figurines",
  "Astronaut Series",
  "Lucky Cat",
  "Christmas Series",
  "Garden Series",
  "Halloween Series",
  "Piggy Bank",
  "Prince Series",
  "Resin Crafts",
];

export default async function FeaturedCollections() {
  const t = await getTranslator();
  // Get one representative product (with image) per category
  let categoryProducts: { category: string; image: string | null; id: number }[] = [];
  try {
    const rows = await prisma.product.findMany({
      where: { status: "active", image: { not: "" } },
      select: { id: true, category: true, image: true },
      orderBy: { id: "asc" },
    });

    const seen = new Set<string>();
    for (const row of rows) {
      if (!seen.has(row.category) && row.image) {
        seen.add(row.category);
        categoryProducts.push(row);
      }
    }

    // Sort by featured priority, then alphabetically
    categoryProducts.sort((a, b) => {
      const ai = featuredOrder.indexOf(a.category);
      const bi = featuredOrder.indexOf(b.category);
      if (ai === -1 && bi === -1) return a.category.localeCompare(b.category);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    // Take top 6
    categoryProducts = categoryProducts.slice(0, 6);
  } catch {
    // DB unavailable — render nothing
  }

  return (
    <section className="py-14 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900">
            {t("home.featured.heading", "Featured Resin Toy Collections")}
          </h2>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1 text-[#C9A55A] hover:text-[#A8843A] font-semibold text-sm transition-colors"
          >
            {t("home.featured.viewAll", "View All Products")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Product grid */}
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {categoryProducts.map((item) => {
              const color = categoryColors[item.category] ?? "from-stone-100 to-stone-50";
              return (
                <Link
                  key={item.category}
                  href={`/products?category=${encodeURIComponent(item.category)}`}
                  className="group flex flex-col"
                >
                  <div className={`aspect-square bg-gradient-to-br ${color} rounded-2xl border border-stone-200 overflow-hidden mb-2.5 group-hover:shadow-md transition-shadow relative`}>
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.category}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                      />
                    )}
                  </div>
                  <p className="text-stone-700 text-xs font-medium text-center group-hover:text-[#C9A55A] transition-colors">
                    {item.category}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mb-10 text-center text-stone-400 text-sm py-8">
            {t("home.featured.loading", "Products loading...")}
          </div>
        )}

        {/* Bottom badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-stone-200 pt-8">
          {bottomBadges.map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5EDD8] text-[#C9A55A] flex items-center justify-center shrink-0">
                {b.icon}
              </div>
              <div>
                <p className="font-semibold text-stone-900 text-sm">{t(`${b.key}.title`, b.title)}</p>
                <p className="text-stone-500 text-xs">{t(`${b.key}.sub`, b.sub)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
