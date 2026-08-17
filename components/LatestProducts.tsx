import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTranslator } from "@/lib/i18n";

export default async function LatestProducts() {
  const t = await getTranslator();
  const raw = await prisma.product.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, name: true, category: true, price: true, image: true, images: true },
  });

  const products = raw.map((p) => {
    let thumb = p.image;
    try {
      const imgs = JSON.parse(p.images ?? "[]") as string[];
      if (imgs.length > 0) thumb = imgs[0];
    } catch {}
    return { ...p, thumb };
  });

  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-white border-y border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">{t("home.latestProducts.eyebrow", "New Arrivals")}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900">{t("home.latestProducts.heading", "Latest Products")}</h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#C9A55A] hover:text-[#A8843A] transition-colors"
          >
            {t("home.latestProducts.viewAll", "View All")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="flex-none w-40 sm:w-48 snap-start group"
            >
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-stone-200 mb-3 bg-stone-100 group-hover:shadow-md transition-shadow">
                {p.thumb ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={p.thumb}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-stone-700 text-sm font-medium leading-tight line-clamp-2 group-hover:text-[#C9A55A] transition-colors mb-1">
                {p.name}
              </p>
              <p className="text-xs text-stone-400">{p.category}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[#C9A55A] font-semibold hover:text-[#A8843A] transition-colors text-sm"
          >
            {t("home.latestProducts.viewAllMobile", "View All Products")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
