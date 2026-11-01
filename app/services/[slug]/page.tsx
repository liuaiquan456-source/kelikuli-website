import { notFound } from "next/navigation";
import { services } from "@/data/manufacturing";
import { contentMetadata } from "@/lib/content";
import {
  ContentHero,
  ContentSectionBlock,
  EditorialSections,
  SpecificationList,
  BulletList,
  ProjectCards,
  GuideCards,
  RelatedProducts,
  ContentCTA,
  ContentSchema,
  contentWidth,
} from "@/components/ManufacturingContent";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const item = services.find((s) => s.slug === slug);
  return item
    ? contentMetadata(item.title, item.summary, `/services/${slug}`)
    : {};
}
export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const s = services.find((item) => item.slug === slug);
  if (!s) notFound();
  const source = `/services/${s.slug}`;
  const context = { source, service: s.slug };
  return (
    <div className="bg-[#faf8f4]">
      <ContentSchema
        title={s.title}
        description={s.summary}
        path={source}
        type="Service"
      />
      <ContentHero
        eyebrow="Custom Manufacturing / Services"
        title={s.title}
        description={s.summary}
        image="/images/factory-workshop.jpg"
        caption="Existing KELIKULI workshop photograph: hand-finishing and production workstations."
        context={context}
      />
      <ContentSectionBlock title="Who this service is for">
        <p className="max-w-3xl text-lg leading-8 text-stone-600">
          {s.audience}
        </p>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">What to provide</h3>
            <BulletList items={s.inputs} />
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">
              What we scope with you
            </h3>
            <BulletList items={s.deliverables} />
          </div>
        </div>
      </ContentSectionBlock>
      <div
        className={`${contentWidth} grid gap-12 pb-12 lg:grid-cols-[1.2fr_1fr]`}
      >
        <EditorialSections sections={s.decisions} />
        <div>
          <h2 className="mb-5 text-2xl font-semibold">
            Product & packing options
          </h2>
          <SpecificationList
            rows={[
              ["Material", s.material],
              ["Size", s.dimensions],
              ["Surface & color", s.finish],
              ["Packaging", s.packaging],
            ]}
          />
        </div>
      </div>
      <div className="bg-white">
        <ContentSectionBlock
          title="MOQ, samples & production timing"
          eyebrow="Confirmed for your project"
        >
          <SpecificationList rows={s.timing} />
          <p className="mt-4 text-sm leading-6 text-stone-500">
            These are quotation and approval conditions, not a fixed price or
            lead-time promise. Final terms depend on artwork, size, complexity,
            quantity and the approved specification.
          </p>
        </ContentSectionBlock>
      </div>
      <ContentSectionBlock title="A related development project">
        <ProjectCards slugs={[s.project]} />
      </ContentSectionBlock>
      <ContentSectionBlock title="Prepare your purchasing brief">
        <GuideCards slugs={[s.guide]} />
      </ContentSectionBlock>
      <RelatedProducts
        category={s.category}
        source={source}
        service={s.slug}
        project={s.project}
      />
      <ContentCTA context={context} />
    </div>
  );
}
