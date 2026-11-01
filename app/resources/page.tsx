import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { contentMetadata } from "@/lib/content";
import {
  ContentHero,
  ContentSectionBlock,
  GuideCards,
  ProjectCards,
  ContentCTA,
} from "@/components/ManufacturingContent";
export const metadata = contentMetadata(
  "Resources — Resin Buying Guides & Development Projects",
  "Find resin manufacturing buying guides, development projects, factory insights and product updates from KELIKULI.",
  "/resources",
);
export default async function ResourcesPage() {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      excerpt: true,
    },
  });
  const groups = [
    {
      id: "factory-insights",
      title: "Factory Insights",
      description:
        "Existing factory, company and industry articles. Product-specific quotations and testing requirements should be confirmed with the team.",
      items: posts.filter((p) => p.category !== "New Product"),
    },
    {
      id: "new-product-development",
      title: "New Product Development",
      description:
        "Product ideas and collection updates from the archive. An announcement or concept image does not by itself confirm a customer order or approved physical sample.",
      items: posts.filter((p) => p.category === "New Product"),
    },
  ];
  return (
    <div className="bg-[#faf8f4]">
      <ContentHero
        eyebrow="KELIKULI / Resources"
        title="Plan the product. Understand the process."
        description="Practical purchasing guidance, clearly labeled development projects and updates from the existing article archive."
      />
      <nav
        aria-label="Resource categories"
        className="border-b border-stone-200 bg-white"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap gap-5 px-5 py-5 text-sm font-semibold">
          <Link href="/buying-guides">Buying Guides</Link>
          <Link href="/case-studies">Case Studies & Projects</Link>
          <a href="#factory-insights">Factory Insights</a>
          <a href="#new-product-development">New Product Development</a>
        </div>
      </nav>
      <ContentSectionBlock title="Buying Guides">
        <GuideCards />
      </ContentSectionBlock>
      <ContentSectionBlock title="Case Studies & Development Projects">
        <ProjectCards />
      </ContentSectionBlock>
      {groups.map((group) => (
        <div id={group.id} key={group.id} className="scroll-mt-20">
          <ContentSectionBlock title={group.title}>
            <p className="mb-7 max-w-3xl text-sm leading-7 text-stone-600">
              {group.description}
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.items.map((post) => (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
                  className="rounded-2xl border border-stone-200 bg-white p-6"
                >
                  <p className="text-xs text-stone-500">{post.category}</p>
                  <h3 className="mt-3 text-lg font-semibold">{post.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
            {!group.items.length && (
              <p className="text-sm text-stone-500">
                No published articles in this collection yet.
              </p>
            )}
          </ContentSectionBlock>
        </div>
      ))}
      <ContentCTA context={{ source: "/resources" }} />
    </div>
  );
}
