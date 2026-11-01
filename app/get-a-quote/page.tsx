import Link from "next/link";
import QuoteForm from "@/components/QuoteForm";
import { ContentHero, contentWidth } from "@/components/ManufacturingContent";
import { contentMetadata, publicSourcePath } from "@/lib/content";
import { normalizeAttribution } from "@/lib/inquiry-data";
export const metadata = {
  ...contentMetadata(
    "Get a Custom Resin Project Quote",
    "Upload artwork and share quantity, dimensions, destination and packaging requirements for a KELIKULI custom resin quotation.",
    "/get-a-quote",
  ),
  robots: { index: false, follow: true },
};
export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const safe = normalizeAttribution({
    sourcePage: params.source,
    service: params.service,
    project: params.project,
    productId: params.product,
  });
  const context = {
    source: publicSourcePath(safe.sourcePage) || "/get-a-quote",
    service: safe.service,
    project: safe.project,
    product: safe.productId,
  };
  return (
    <div className="bg-[#faf8f4]">
      <ContentHero
        eyebrow="Custom Lab / Project Inquiry"
        title="From your idea to a clear quotation."
        description="One brief for design, sampling and manufacturing. Upload your references and tell us what you need to make."
      />
      <div
        className={`${contentWidth} grid gap-10 py-12 lg:grid-cols-[2fr_1fr]`}
      >
        <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-8">
          <QuoteForm key={JSON.stringify(context)} context={context} />
        </div>
        <aside className="space-y-6 self-start text-sm leading-7 text-stone-600">
          <h2 className="text-xl font-semibold text-stone-900">
            A useful brief includes
          </h2>
          <ol className="list-inside list-decimal space-y-3">
            <li>Views or reference images of the design.</li>
            <li>Dimensions and quantity per design.</li>
            <li>Finish, color and packaging preferences.</li>
            <li>Destination, intended use and target date.</li>
          </ol>
          <p>
            Not every detail needs to be final. Mark the decisions you need help
            with and we can scope the next step.
          </p>
          <Link
            className="block font-semibold underline underline-offset-4"
            href="/buying-guides/prepare-artwork-custom-resin"
          >
            Read the artwork preparation guide
          </Link>
          <a
            className="block font-semibold underline underline-offset-4"
            href="https://custom.kelikuli.com"
          >
            Explore concepts in Custom Lab ↗
          </a>
        </aside>
      </div>
    </div>
  );
}
