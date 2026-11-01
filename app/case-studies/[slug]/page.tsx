import Link from "next/link";
import { notFound } from "next/navigation";
import { developmentProjects } from "@/data/development-projects";
import { contentMetadata } from "@/lib/content";
import {
  ContentHero,
  ContentSectionBlock,
  SpecificationList,
  BulletList,
  ServiceCards,
  GuideCards,
  RelatedProducts,
  ContentCTA,
  QuoteActions,
} from "@/components/ManufacturingContent";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const p = developmentProjects.find((x) => x.slug === slug);
  return p
    ? contentMetadata(
        `${p.title} — Development Project`,
        p.summary,
        `/case-studies/${slug}`,
        p.image,
      )
    : {};
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = developmentProjects.find((x) => x.slug === slug);
  if (!p) notFound();
  const source = `/case-studies/${p.slug}`;
  const context = { source, service: p.service, project: p.slug };
  return (
    <div className="bg-[#faf8f4]">
      <ContentHero
        eyebrow="Product Development Project"
        title={p.title}
        description={p.summary}
        image={p.image}
        caption={p.imageCaption}
      />
      <ContentSectionBlock title="Evidence & current stage">
        <div className="rounded-2xl border border-[#d2bf94] bg-[#f3ecdE] p-6">
          <p className="font-semibold">
            Development brief · completed order not verified
          </p>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            This page documents a proposed development path using existing
            public material. It does not claim an approved physical sample, a
            customer order, completed production or sales results.
          </p>
          <Link
            href={p.evidenceHref}
            className="mt-4 inline-block text-sm font-semibold underline underline-offset-4"
          >
            Source material: {p.evidence}
          </Link>
        </div>
      </ContentSectionBlock>
      <ContentSectionBlock title="Proposed buyer brief">
        <p className="max-w-3xl text-lg leading-8 text-stone-600">{p.brief}</p>
        <QuoteActions context={context} similar />
      </ContentSectionBlock>
      <ContentSectionBlock title="Product specification to confirm">
        <SpecificationList rows={p.specifications} />
      </ContentSectionBlock>
      <ContentSectionBlock title="Development path & approval status">
        <ol className="grid gap-4 md:grid-cols-2">
          {p.stages.map(([title, detail], i) => (
            <li
              key={title}
              className="rounded-2xl border border-stone-200 bg-white p-6"
            >
              <p className="text-xs font-semibold text-[#99732f]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">{detail}</p>
            </li>
          ))}
        </ol>
      </ContentSectionBlock>
      <ContentSectionBlock title="Questions this project needs to resolve">
        <BulletList items={p.questions} />
      </ContentSectionBlock>
      <ContentSectionBlock title="Related manufacturing service">
        <ServiceCards slugs={[p.service]} />
      </ContentSectionBlock>
      <ContentSectionBlock title="Prepare for your own project">
        <GuideCards slugs={[p.guide]} />
      </ContentSectionBlock>
      <RelatedProducts
        category={p.category}
        source={source}
        service={p.service}
        project={p.slug}
      />
      <ContentCTA context={context} />
    </div>
  );
}
