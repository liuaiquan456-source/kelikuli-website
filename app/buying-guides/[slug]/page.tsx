import { notFound } from "next/navigation";
import { buyingGuides } from "@/data/buying-guides";
import { contentMetadata } from "@/lib/content";
import {
  ContentHero,
  EditorialSections,
  BulletList,
  ServiceCards,
  ProjectCards,
  ContentSectionBlock,
  ContentCTA,
  ContentSchema,
  contentWidth,
} from "@/components/ManufacturingContent";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const g = buyingGuides.find((x) => x.slug === slug);
  return g ? contentMetadata(g.title, g.summary, `/buying-guides/${slug}`) : {};
}
export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const g = buyingGuides.find((x) => x.slug === slug);
  if (!g) notFound();
  const source = `/buying-guides/${g.slug}`;
  return (
    <article className="bg-[#faf8f4]">
      <ContentSchema
        title={g.title}
        description={g.summary}
        type="Article"
        path={source}
        image="/images/factory-workshop.jpg"
      />
      <ContentHero
        eyebrow="Resources / Buying Guide"
        title={g.title}
        description={g.summary}
      />
      <div
        className={`${contentWidth} grid gap-12 py-12 lg:grid-cols-[1fr_280px]`}
      >
        <div>
          <p className="mb-6 text-xs font-semibold uppercase tracking-wider text-stone-500">
            By KELIKULI · Purchasing guidance
          </p>
          <div className="mb-10 rounded-2xl border-l-4 border-[#b8934f] bg-[#eee6d7] p-6 text-lg leading-8 text-stone-800">
            {g.takeaway}
          </div>
          <EditorialSections sections={g.sections} />
        </div>
        <aside className="self-start rounded-2xl border border-stone-200 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-base font-semibold">In this guide</h2>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-stone-600">
            {g.sections.map((s, i) => (
              <li key={s.title}>
                <a href={`#section-${i + 1}`} className="hover:text-[#886322]">
                  {String(i + 1).padStart(2, "0")} · {s.title}
                </a>
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-stone-200 pt-5 text-xs leading-6 text-stone-500">
            Commercial terms are project-specific. Use this guide to prepare a
            brief; confirm price, timing and testing requirements in your
            quotation.
          </p>
        </aside>
      </div>
      <ContentSectionBlock title="Before requesting a quotation">
        <BulletList items={g.checklist} />
      </ContentSectionBlock>
      <ContentSectionBlock title="The related manufacturing service">
        <ServiceCards slugs={[g.service]} />
      </ContentSectionBlock>
      <ContentSectionBlock title="See a development brief">
        <ProjectCards slugs={[g.project]} />
      </ContentSectionBlock>
      <ContentCTA
        context={{ source, service: g.service, project: g.project }}
      />
    </article>
  );
}
