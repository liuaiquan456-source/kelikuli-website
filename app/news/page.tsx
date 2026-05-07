import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Resin Toy Industry News & Factory Updates",
  description:
    "Stay updated with Kelikuli's latest resin toy industry insights, new product launches, exhibition reviews, and factory news from Zhejiang, China.",
};

const categories = ["All", "Industry Insights", "New Product", "Exhibition Review", "Company News"];

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    select: { id: true, slug: true, title: true, category: true, excerpt: true, image: true, publishedAt: true },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-[#0B1A3A] overflow-hidden py-14 text-center">
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: (((i * 7) % 3) + 1) + "px",
                height: (((i * 7) % 3) + 1) + "px",
                top: ((i * 13) % 100) + "%",
                left: ((i * 17) % 100) + "%",
                opacity: ((i * 3) % 7) / 10 + 0.15,
              }}
            />
          ))}
        </div>
        <div className="relative z-10">
          <h1
            className="text-5xl md:text-6xl font-black text-white tracking-widest mb-4"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", letterSpacing: "0.15em" }}
          >
            Industry News
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-stone-400">
            <Link href="/" className="hover:text-[#C9A55A] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-stone-300">News</span>
          </div>
        </div>
      </section>

      {/* Category filter */}
      <div className="bg-white border-b border-stone-100 sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={cat === "All" ? "/news" : `/news?category=${encodeURIComponent(cat)}`}
              className="flex-none px-4 py-1.5 rounded-full text-sm font-medium border border-stone-200 text-stone-600 hover:border-[#C9A55A] hover:text-[#C9A55A] transition-colors whitespace-nowrap"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Articles */}
      <section className="bg-[#F8F4ED] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {posts.length === 0 ? (
            <p className="text-center text-stone-400 py-20">No articles published yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/news/${post.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-[16/9] bg-stone-100">
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-stone-400 text-sm">No image</div>
                    )}
                    <span className="absolute top-3 left-3 bg-[#C9A55A] text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-stone-400 text-xs mb-2">
                      {post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 10) : ""}
                    </p>
                    <h2 className="text-stone-800 font-bold text-base leading-snug mb-2 group-hover:text-[#C9A55A] transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-stone-500 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
                    <div className="mt-4 flex items-center gap-1 text-[#C9A55A] text-sm font-semibold">
                      Read More
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
