import { contentMetadata } from "@/lib/content";
import FaqSection from "@/components/FaqSection";
import {
  ContentHero,
  ContentSectionBlock,
  ServiceCards,
  ProjectCards,
  GuideCards,
  ContentCTA,
} from "@/components/ManufacturingContent";
export const metadata = contentMetadata(
  "Custom Resin Products Manufacturing",
  "Explore KELIKULI custom resin manufacturing, low-MOQ project review, 3D prototyping, casting, finishing, packaging and quality control.",
  "/custom-oem-odm",
);
export default function ManufacturingPage() {
  return (
    <div className="bg-[#faf8f4]">
      <ContentHero
        eyebrow="KELIKULI / Custom Manufacturing"
        title="Custom Resin Products Manufacturing"
        description="From your first sketch to an approved production specification. Find the service, development brief and purchasing guidance for your next resin product."
        image="/images/factory-workshop.jpg"
        caption="Existing KELIKULI workshop photograph. Project specifications and commercial terms are confirmed after review."
        context={{ source: "/custom-oem-odm" }}
      />
      <ContentSectionBlock
        title="Start where your project is today"
        eyebrow="Seven connected services"
      >
        <ServiceCards />
      </ContentSectionBlock>
      <div className="bg-white">
        <ContentSectionBlock title="A clear route from brief to production">
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "01",
                "Define the brief",
                "Share artwork, quantity, dimensions, destination and packing needs.",
              ],
              [
                "02",
                "Review & quote",
                "Confirm the development scope, tooling, unit cost and approval sequence.",
              ],
              [
                "03",
                "Approve the sample",
                "Resolve shape, finish and functional details against one reference.",
              ],
              [
                "04",
                "Produce & inspect",
                "Work to the agreed specification, inspection scope and packing plan.",
              ],
            ].map(([n, t, d]) => (
              <li key={n} className="border-t border-stone-200 pt-5">
                <p className="text-xs font-semibold text-[#99732f]">{n}</p>
                <h3 className="mt-3 text-lg font-semibold">{t}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{d}</p>
              </li>
            ))}
          </ol>
        </ContentSectionBlock>
      </div>
      <ContentSectionBlock
        title="Explore product development projects"
        eyebrow="Catalog references & concept briefs"
      >
        <ProjectCards />
      </ContentSectionBlock>
      <ContentSectionBlock title="Make your next buying decision">
        <GuideCards
          slugs={[
            "custom-resin-figurine-cost",
            "moq-custom-resin-products",
            "prepare-artwork-custom-resin",
          ]}
        />
      </ContentSectionBlock>
      <FaqSection page="custom-oem-odm" />
      <ContentCTA context={{ source: "/custom-oem-odm" }} />
    </div>
  );
}
