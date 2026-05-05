import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return {};
  return { title: `${post.title} | Kelikuli News`, description: post.excerpt };
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
    } else {
      const withLinks = trimmed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) =>
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

  const related = await prisma.post.findMany({
    where: { status: "published", slug: { not: slug } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { slug: true, title: true, image: true, publishedAt: true },
  });

  const dateStr = post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 10) : "";

  return (
    <div className="bg-[#F8F4ED] min-h-screen">
      {/* Hero image */}
      <div className="relative w-full aspect-[3/1] bg-stone-200">
        {post.image && <Image src={post.image} alt={post.title} fill className="object-cover" priority />}
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-2 text-sm text-stone-400">
        <Link href="/" className="hover:text-[#C9A55A]">Home</Link>
        <span>/</span>
        <Link href="/news" className="hover:text-[#C9A55A]">News</Link>
        <span>/</span>
        <span className="text-stone-600 truncate">{post.title}</span>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
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
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-[#C9A55A] font-semibold hover:text-[#B8935A] transition-colors"
          >
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
                <Link
                  key={r.slug}
                  href={`/news/${r.slug}`}
                  className="group bg-white rounded-xl overflow-hidden border border-stone-100 hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-video bg-stone-100">
                    {r.image && (
                      <Image src={r.image} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="300px" />
                    )}
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
  );
}
