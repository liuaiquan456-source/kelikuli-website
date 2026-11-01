import QuoteForm from "@/components/QuoteForm";
import { waMe } from "@/lib/settings";
import { ContentHero, contentWidth } from "@/components/ManufacturingContent";
export default function ContactForm({
  whatsapp,
  wechat,
  email,
  address,
}: {
  whatsapp: string;
  wechat: string;
  email: string;
  address: string;
}) {
  return (
    <div className="bg-[#faf8f4]">
      <ContentHero
        eyebrow="KELIKULI / Contact"
        title="Tell us about your next product."
        description="Share your artwork, quantity and destination. We will review your brief before confirming the development scope and quotation."
      />
      <div
        className={`${contentWidth} grid gap-10 py-12 lg:grid-cols-[2fr_1fr]`}
      >
        <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-8">
          <QuoteForm context={{ source: "/contact" }} />
        </div>
        <aside className="space-y-6 text-sm leading-7 text-stone-600">
          <h2 className="text-xl font-semibold text-stone-900">
            Contact KELIKULI
          </h2>
          <p>
            <a href={`mailto:${email}`} className="underline">
              {email}
            </a>
          </p>
          <p>
            <a href={waMe(whatsapp)} className="underline">
              WhatsApp: {whatsapp}
            </a>
          </p>
          <p>WeChat: {wechat}</p>
          <p>{address}</p>
        </aside>
      </div>
    </div>
  );
}
