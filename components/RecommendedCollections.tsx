import Link from "next/link";
import Image from "next/image";

const featured = {
  label: "Christmas Series",
  href: "/products?category=Christmas+Series",
  img: "/images/collections/col-5.png",
};

const gridItems = [
  { label: "Prince Series",     href: "/products?category=Prince+Series",     img: "/images/collections/col-3.png" },
  { label: "Garden Series",     href: "/products?category=Garden+Series",     img: "/images/collections/col-6.png" },
  { label: "Astronaut Series",  href: "/products?category=Astronaut+Series",  img: "/images/collections/col-4.png" },
  { label: "Blind Box Series",  href: "/products?category=Blind+Box+Series",  img: "/images/collections/col-8.png" },
];

export default function RecommendedCollections() {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900">
            Recommended Products
          </h2>
          <div className="w-8 h-0.5 bg-stone-800 mx-auto mt-3" />
        </div>

        <div className="flex gap-3 h-[420px] sm:h-[500px] md:h-[540px]">

          {/* Featured large image — left */}
          <Link
            href={featured.href}
            className="relative flex-[3] rounded-xl overflow-hidden group cursor-pointer"
          >
            <Image
              src={featured.img}
              alt={`${featured.label} — Kelikuli wholesale resin toys`}
              fill
              sizes="(max-width: 640px) 60vw, 55vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-4 py-4 flex items-end justify-between">
              <span className="text-white font-semibold text-sm sm:text-base leading-tight">
                {featured.label}
              </span>
              <svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* 2×2 grid — right */}
          <div className="flex-[2] grid grid-cols-2 grid-rows-2 gap-3">
            {gridItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="relative rounded-xl overflow-hidden group cursor-pointer"
              >
                <Image
                  src={item.img}
                  alt={`${item.label} — Kelikuli wholesale resin toys`}
                  fill
                  sizes="(max-width: 640px) 20vw, 22vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2 sm:px-3 py-2 sm:py-3 flex items-end justify-between">
                  <span className="text-white font-medium text-[10px] sm:text-xs md:text-sm leading-tight">
                    {item.label}
                  </span>
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
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
