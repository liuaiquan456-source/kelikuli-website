import Link from "next/link";
import { industries } from "@/data/manufacturing";
import { contentMetadata } from "@/lib/content";
import {
  ContentHero,
  ContentSectionBlock,
  ProjectCards,
  ContentCTA,
} from "@/components/ManufacturingContent";
export const metadata = contentMetadata(
  "Custom Resin Products by Industry",
  "Explore development requirements for character merchandise, tourism souvenirs, memorial products, seasonal décor and private-label gifts.",
  "/industries",
);
export default function IndustriesPage() {
  return (
    <div className="bg-[#faf8f4]">
      <ContentHero
        eyebrow="Custom Manufacturing / Industries"
        title="Different markets. Different details to get right."
        description="Start with the use, customer and sales channel. Then build a specification that fits the product, from sculpt to protective packaging."
      />
      <ContentSectionBlock title="Find your project’s starting point">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((i) => (
            <article
              key={i.title}
              className="rounded-2xl border border-stone-200 bg-white p-6"
            >
              <h2 className="text-xl font-semibold">{i.title}</h2>
              <p className="mt-4 text-sm leading-7 text-stone-600">{i.brief}</p>
              <Link
                className="mt-5 inline-block text-sm font-semibold text-[#886322]"
                href={`/services/${i.service}`}
              >
                Explore the related service ↗
              </Link>
            </article>
          ))}
        </div>
      </ContentSectionBlock>
      <ContentSectionBlock title="Explore development briefs">
        <ProjectCards />
      </ContentSectionBlock>
      <ContentCTA context={{ source: "/industries" }} />
    </div>
  );
}
