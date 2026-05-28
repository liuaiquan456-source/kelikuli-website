import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Breadcrumb from "@/components/Breadcrumb";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return {};
  const url = `https://kelikuli.com/news/${slug}`;
  const description = post.excerpt ?? `${post.title} — Read the full article on Kelikuli's resin toy factory blog.`;
  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      publishedTime: post.publishedAt?.toISOString(),
      images: post.image ? [{ url: post.image, alt: post.title }] : [],
    },
  };
}

function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { elements.push(<div key={key++} className="mb-3" />); continue; }
    if (trimmed.startsWith("## ")) {
      elements.push(<h2 key={key++} className="text-xl font-bold text-stone-800 mt-8 mb-3">{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      elements.push(<p key={key++} className="font-bold text-stone-800 mb-1">{trimmed.slice(2, -2)}</p>);
    } else if (trimmed.startsWith("- ")) {
      elements.push(<li key={key++} className="text-stone-600 leading-relaxed ml-4 list-disc">{trimmed.slice(2)}</li>);
    } else if (/^\d+\./.test(trimmed)) {
      elements.push(<li key={key++} className="text-stone-600 leading-relaxed ml-4 list-decimal">{trimmed.replace(/^\d+\.\s*/, "")}</li>);
    } else if (trimmed === "---") {
      elements.push(<hr key={key++} className="border-stone-200 my-6" />);
    } else if (/^!\[([^\]]*)\]\(([^)]+)\)$/.test(trimmed)) {
      const m = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (m) elements.push(
        // eslint-disable-next-line @next/next/no-img-element
        <img key={key++} src={m[2]} alt={m[1]} className="max-w-full rounded-xl my-4 mx-auto block" />
      );
    } else {
      const withLinks = trimmed
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) =>
          `<img src="${src}" alt="${alt}" class="max-w-full rounded-xl my-4 mx-auto block" />`
        )
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/(?<!<img[^>]*)(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) =>
          `<a href="${href}" class="text-[#C9A55A] hover:underline font-medium">${text}</a>`
        );
      elements.push(
        <p key={key++} className="text-stone-600 leading-relaxed mb-2"
          dangerouslySetInnerHTML={{ __html: withLinks }} />
      );
    }
  }
  return elements;
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || post.status !== "published") notFound();

  const pinnedIds: number[] = (() => {
    try { return JSON.parse((post as Record<string, unknown>).relatedProducts as string ?? "[]"); } catch { return []; }
  })();

  const [related, sidebarProducts] = await Promise.all([
    prisma.post.findMany({
      where: { status: "published", slug: { not: slug } },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { slug: true, title: true, image: true, publishedAt: true },
    }),
    pinnedIds.length > 0
      ? prisma.product.findMany({
          where: { id: { in: pinnedIds }, status: "active" },
          select: { id: true, name: true, image: true, category: true },
        })
      : prisma.product.findMany({
          where: { status: "active" },
          orderBy: { createdAt: "desc" },
          take: 6,
          select: { id: true, name: true, image: true, category: true },
        }),
  ]);

  const dateStr = post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 10) : "";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? post.title,
    image: post.image ?? undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "Kelikuli" },
    publisher: {
      "@type": "Organization",
      name: "Kelikuli",
      logo: { "@type": "ImageObject", url: "https://kelikuli.com/images/kelikulilogo.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://kelikuli.com/news/${slug}` },
  };

  return (
    <div className="bg-[#F8F4ED] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* Hero image */}
      <div className="relative w-full aspect-[3/1] bg-stone-200">
        {post.image && <Image src={post.image} alt={post.title} fill className="object-cover" priority sizes="100vw" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-4xl mx-auto">
          <span className="inline-block bg-[#C9A55A] text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
            {post.category}
          </span>
          <h1 className="text-2xl md:text-4xl font-black text-white leading-snug">{post.title}</h1>
          <p className="text-stone-300 text-sm mt-2">{dateStr}</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <Breadcrumb items={[{ label: "News", href: "/news" }, { label: post.title }]} />
      </div>

      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 flex flex-col lg:flex-row gap-8 items-start">

        {/* Left sidebar — products */}
        {sidebarProducts.length > 0 && (
          <aside className="w-full lg:w-56 shrink-0 lg:sticky lg:top-20">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-2">
                <span className="text-[#C9A55A] text-xs">✦</span>
                <h2 className="text-xs font-black uppercase tracking-widest text-stone-700">Our Products</h2>
              </div>
              <div className="p-3 space-y-3">
                {sidebarProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="group flex items-center gap-3 hover:bg-[#F5EDD8] rounded-xl p-2 transition-colors"
                  >
                    <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-stone-100">
                      {p.image
                        ? <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">No img</div>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-stone-700 group-hover:text-[#C9A55A] transition-colors line-clamp-2 leading-snug">{p.name}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">{p.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-stone-100">
                <Link href="/products" className="text-xs font-semibold text-[#C9A55A] hover:text-[#B8935A] transition-colors flex items-center gap-1">
                  View all products
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </aside>
        )}

        {/* Main article */}
        <article className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-stone-100">
            {post.excerpt && (
              <p className="text-stone-500 text-base leading-relaxed border-l-4 border-[#C9A55A] pl-4 mb-8 italic">
                {post.excerpt}
              </p>
            )}
            <div>{renderContent(post.content)}</div>
          </div>

          {/* Back link */}
          <div className="mt-8">
            <Link href="/news" className="inline-flex items-center gap-2 text-[#C9A55A] font-semibold hover:text-[#B8935A] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Back to News
            </Link>
          </div>

          {/* Related articles */}
          {related.length > 0 && (
            <div className="mt-12">
              <h3 className="text-lg font-bold text-stone-800 mb-6">Related Articles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link key={r.slug} href={`/news/${r.slug}`} className="group bg-white rounded-xl overflow-hidden border border-stone-100 hover:shadow-md transition-shadow">
                    <div className="relative aspect-video bg-stone-100">
                      {r.image && <Image src={r.image} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="300px" />}
                    </div>
                    <div className="p-3">
                      <p className="text-stone-400 text-xs mb-1">{r.publishedAt ? new Date(r.publishedAt).toISOString().slice(0, 10) : ""}</p>
                      <p className="text-stone-700 font-semibold text-sm leading-snug group-hover:text-[#C9A55A] transition-colors line-clamp-2">{r.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

      </div>
    </div>
  );
}
