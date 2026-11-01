import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { services, type ContentSection } from "@/data/manufacturing";
import { buyingGuides } from "@/data/buying-guides";
import { developmentProjects } from "@/data/development-projects";
import { quoteHref, siteUrl, type QuoteContext } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import ProductImage from "@/components/ProductImage";

export const contentWidth = "mx-auto max-w-6xl px-5 sm:px-8";
export function ContentHero({
  eyebrow,
  title,
  description,
  image,
  caption,
  context,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
  caption?: string;
  context?: QuoteContext;
}) {
  return (
    <section className="bg-[#211c17] text-white">
      <div
        className={`${contentWidth} grid items-center gap-10 py-14 sm:py-20 ${image ? "lg:grid-cols-[1.1fr_1fr]" : ""}`}
      >
        <div>
          <Link
            href="/resources"
            className="text-xs font-semibold uppercase tracking-[.2em] text-[#dbc18c]"
          >
            {eyebrow}
          </Link>
          <h1
            className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
            {description}
          </p>
          {context && <QuoteActions context={context} />}
        </div>
        {image && (
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-800">
              <Image
                src={image}
                alt={caption || title}
                fill
                preload
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {caption && (
              <figcaption className="mt-3 text-xs leading-5 text-stone-400">
                {caption}
              </figcaption>
            )}
          </figure>
        )}
      </div>
    </section>
  );
}
export function QuoteActions({
  context,
  similar = false,
}: {
  context: QuoteContext;
  similar?: boolean;
}) {
  return (
    <div className="mt-7 flex flex-wrap gap-3">
      <Link
        href={quoteHref(context)}
        className="rounded-full bg-[#d3b576] px-6 py-3 text-sm font-bold text-[#211c17] transition hover:bg-[#e2c994]"
      >
        {similar ? "Get a Similar Quote" : "Get a Quote"}{" "}
        <span aria-hidden>↗</span>
      </Link>
      <Link
        href={quoteHref(context, true)}
        className="rounded-full border border-current/30 px-6 py-3 text-sm font-semibold transition hover:opacity-70"
      >
        Upload Your Design
      </Link>
    </div>
  );
}
export function ContentSectionBlock({
  title,
  children,
  eyebrow,
}: {
  title: string;
  children: ReactNode;
  eyebrow?: string;
}) {
  return (
    <section className={`${contentWidth} py-12 sm:py-16`}>
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-stone-500">
          {eyebrow}
        </p>
      )}
      <h2 className="mb-7 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
        {title}
      </h2>
      {children}
    </section>
  );
}
export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-sm leading-6 text-stone-600">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#a47d34]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
export function EditorialSections({
  sections,
}: {
  sections: ContentSection[];
}) {
  return (
    <div className="space-y-10">
      {sections.map((section, i) => (
        <section
          id={`section-${i + 1}`}
          key={section.title}
          className="scroll-mt-24"
        >
          <h2 className="mb-4 text-2xl font-semibold text-stone-900">
            {section.title}
          </h2>
          {section.paragraphs.map((p) => (
            <p key={p} className="mb-4 leading-8 text-stone-600">
              {p}
            </p>
          ))}
          {section.checklist && <BulletList items={section.checklist} />}
        </section>
      ))}
    </div>
  );
}
export function SpecificationList({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white px-5">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-2 py-5 sm:grid-cols-[160px_1fr]">
          <dt className="text-sm font-semibold text-stone-900">{label}</dt>
          <dd className="text-sm leading-6 text-stone-600">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
export function ServiceCards({ slugs }: { slugs?: string[] }) {
  return (
    <div
      className={`grid gap-4 ${slugs?.length === 1 ? "max-w-3xl" : "md:grid-cols-2 lg:grid-cols-3"}`}
    >
      {services
        .filter((s) => !slugs || slugs.includes(s.slug))
        .map((s, i) => (
          <Link
            key={s.slug}
            href={`/services/${s.slug}`}
            className="group rounded-2xl border border-stone-200 bg-white p-6 transition hover:border-[#a47d34] hover:shadow-sm"
          >
            <p className="mb-7 text-xs font-semibold text-[#99732f]">
              {String(i + 1).padStart(2, "0")} / SERVICE
            </p>
            <h3 className="text-lg font-semibold text-stone-900">{s.title}</h3>
            <p className="mt-3 text-sm leading-6 text-stone-600">{s.summary}</p>
            <p className="mt-5 text-sm font-semibold text-[#886322]">
              Explore service <span aria-hidden>↗</span>
            </p>
          </Link>
        ))}
    </div>
  );
}
export function GuideCards({ slugs }: { slugs?: string[] }) {
  return (
    <div
      className={`grid gap-4 ${slugs?.length === 1 ? "max-w-3xl" : "md:grid-cols-2 lg:grid-cols-3"}`}
    >
      {buyingGuides
        .filter((g) => !slugs || slugs.includes(g.slug))
        .map((g) => (
          <Link
            key={g.slug}
            href={`/buying-guides/${g.slug}`}
            className="rounded-2xl border border-stone-200 bg-white p-6 transition hover:border-[#a47d34]"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[#99732f]">
              Buying guide
            </p>
            <h3 className="mt-4 text-xl font-semibold text-stone-900">
              {g.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-stone-600">{g.summary}</p>
            <p className="mt-5 text-sm font-semibold text-[#886322]">
              Read guide ↗
            </p>
          </Link>
        ))}
    </div>
  );
}
export function ProjectCards({ slugs }: { slugs?: string[] }) {
  return (
    <div
      className={`grid gap-5 ${slugs?.length === 1 ? "max-w-3xl" : "md:grid-cols-3"}`}
    >
      {developmentProjects
        .filter((p) => !slugs || slugs.includes(p.slug))
        .map((p) => (
          <Link
            key={p.slug}
            href={`/case-studies/${p.slug}`}
            className={`overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:border-[#a47d34] ${slugs?.length === 1 ? "md:grid md:grid-cols-2" : ""}`}
          >
            <div className="relative aspect-[4/3] bg-stone-100">
              <Image
                src={p.image}
                alt={p.imageCaption}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#99732f]">
                Product Development Project
              </p>
              <h3 className="mt-3 text-xl font-semibold text-stone-900">
                {p.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                {p.summary}
              </p>
            </div>
          </Link>
        ))}
    </div>
  );
}
export async function RelatedProducts({
  category,
  source,
  service,
  project,
}: {
  category: string;
  source: string;
  service: string;
  project?: string;
}) {
  const products = await prisma.product.findMany({
    where: {
      status: "active",
      OR: [
        { category: { contains: category, mode: "insensitive" } },
        { name: { contains: category, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, image: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });
  return (
    <ContentSectionBlock
      title="Explore related products"
      eyebrow="From the public catalog"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {products.map((p) => (
          <article
            key={p.id}
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
          >
            <Link href={`/products/${p.id}`}>
              <div className="relative aspect-[4/3]">
                <ProductImage
                  src={p.image}
                  alt={p.name}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain"
                />
              </div>
              <h3 className="px-5 pt-4 text-base font-semibold text-stone-900">
                {p.name}
              </h3>
            </Link>
            <Link
              className="block px-5 py-4 text-sm font-semibold text-[#886322]"
              href={quoteHref({
                source,
                service,
                project,
                product: String(p.id),
              })}
            >
              Discuss this product ↗
            </Link>
          </article>
        ))}
      </div>
      <Link
        href="/products"
        className="mt-6 inline-block text-sm font-semibold text-stone-700 underline underline-offset-4"
      >
        Browse the complete product catalog
      </Link>
    </ContentSectionBlock>
  );
}
export function ContentCTA({ context }: { context: QuoteContext }) {
  return (
    <section className="bg-[#eee6d7]">
      <div className={`${contentWidth} py-12`}>
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#80602a]">
          Custom Lab · Project inquiry
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-stone-900">
          Bring your brief. Let’s define the next step.
        </h2>
        <p className="mt-4 max-w-2xl leading-7 text-stone-600">
          Share artwork, target quantity, dimensions and destination. We will
          review the scope before confirming price, MOQ or timing.
        </p>
        <QuoteActions context={context} />
      </div>
    </section>
  );
}
export function ContentSchema({
  title,
  description,
  path,
  type,
  image,
}: {
  title: string;
  description: string;
  path: string;
  type: "Service" | "Article";
  image?: string;
}) {
  const item = {
    "@context": "https://schema.org",
    "@type": type,
    name: title,
    ...(type === "Article"
      ? {
          headline: title,
          author: {
            "@type": "Organization",
            name: "KELIKULI",
            url: `${siteUrl}/about-us`,
          },
        }
      : {
          provider: { "@type": "Organization", name: "KELIKULI", url: siteUrl },
        }),
    description,
    url: `${siteUrl}${path}`,
    ...(image ? { image: `${siteUrl}${image}` } : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(item).replace(/</g, "\\u003c"),
      }}
    />
  );
}
