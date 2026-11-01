import { contentMetadata } from "@/lib/content";
import {
  ContentHero,
  ContentSectionBlock,
  GuideCards,
  ContentCTA,
} from "@/components/ManufacturingContent";
export const metadata = contentMetadata(
  "Resin Product Buying Guides",
  "Practical purchasing guides to custom resin costs, MOQ, tooling, production schedules and artwork preparation.",
  "/buying-guides",
);
export default function BuyingGuidesPage() {
  return (
    <div className="bg-[#faf8f4]">
      <ContentHero
        eyebrow="Resources / Buying Guides"
        title="Make the next purchasing decision with a clearer brief."
        description="Understand the questions behind a quotation, from the first artwork review to sample approval and shipment planning."
      />
      <ContentSectionBlock title="Start with the question on your desk">
        <GuideCards />
      </ContentSectionBlock>
      <ContentCTA context={{ source: "/buying-guides" }} />
    </div>
  );
}
