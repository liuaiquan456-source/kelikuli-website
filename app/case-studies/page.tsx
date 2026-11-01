import { contentMetadata } from "@/lib/content";
import {
  ContentHero,
  ContentSectionBlock,
  ProjectCards,
  ContentCTA,
} from "@/components/ManufacturingContent";
export const metadata = contentMetadata(
  "Case Studies & Product Development Projects",
  "Explore KELIKULI resin product development briefs, clearly labeled by evidence and stage, for souvenirs, pet memorials and seasonal décor.",
  "/case-studies",
);
export default function ProjectsPage() {
  return (
    <div className="bg-[#faf8f4]">
      <ContentHero
        eyebrow="Resources / Projects"
        title="Case Studies & Product Development Projects"
        description="See how a product idea becomes a purchasing brief, with the decisions and approvals made visible."
      />
      <ContentSectionBlock
        title="Product development projects"
        eyebrow="Current collection"
      >
        <p className="mb-8 max-w-3xl leading-7 text-stone-600">
          The entries below use existing catalog images or concept material.
          They are development briefs, not verified completed customer orders.
          Their sample, production and timing status is stated on each page; no
          customer names, order quantities or sales results are invented.
        </p>
        <ProjectCards />
      </ContentSectionBlock>
      <ContentCTA context={{ source: "/case-studies" }} />
    </div>
  );
}
