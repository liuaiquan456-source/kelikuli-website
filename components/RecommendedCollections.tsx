import Link from "next/link";
import Image from "next/image";

const collections = [
  { label: "Custom Character",  href: "/products/custom-resin-toys",      img: "/images/collections/col-1.png" },
  { label: "Cartoon Series",    href: "/products/resin-figurines",         img: "/images/collections/col-2.png" },
  { label: "Prince Series",     href: "/products/resin-figurines",         img: "/images/collections/col-3.png" },
  { label: "Astronaut Series",  href: "/products/custom-resin-toys",      img: "/images/collections/col-4.png" },
  { label: "Christmas Series",  href: "/products/seasonal-resin-crafts",  img: "/images/collections/col-5.png" },
  { label: "Garden Series",     href: "/products/zakka-series",           img: "/images/collections/col-6.png" },
  { label: "Lucky Cat Series",  href: "/products/lucky-cat",              img: "/images/collections/col-7.png" },
  { label: "Blind Box Series",  href: "/products/blind-box",              img: "/images/collections/col-8.png" },
];

export default function RecommendedCollections() {
  return (
    <section className="py-14 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 text-center mb-10">
          Recommended Resin Toy Collections
        </h2>

        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6">
            {collections.map((col) => (
              <Link
                key={col.label}
                href={col.href}
                className="flex-none w-36 sm:w-44 snap-start group"
              >
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-stone-200 mb-3 bg-stone-100 group-hover:shadow-md transition-shadow">
                  <Image
                    src={col.img}
                    alt={`${col.label} — Kelikuli resin toy collection`}
                    fill
                    sizes="(max-width: 640px) 144px, 176px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-stone-700 text-sm font-medium text-center group-hover:text-[#C9A55A] transition-colors leading-tight">
                  {col.label}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[#C9A55A] font-semibold hover:text-[#A8843A] transition-colors text-sm"
          >
            View All Product Collections
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
