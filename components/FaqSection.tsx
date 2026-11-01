import { prisma } from "@/lib/prisma";
import { getTranslator } from "@/lib/i18n";

export default async function FaqSection({
  page,
  title,
}: {
  page: string;
  title?: string;
}) {
  const t = await getTranslator();
  const faqs = await prisma.fAQ
    .findMany({
      where: { page, active: true },
      select: { id: true, question: true, answer: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    })
    .catch(() => []);
  if (!faqs.length) return null;
  return (
    <section className="border-t border-stone-100 bg-stone-50 py-14">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-8 text-center text-2xl font-bold text-stone-900">
          {title ?? t("faqSection.defaultTitle", "Frequently Asked Questions")}
        </h2>
        <div className="rounded-2xl border border-stone-100 bg-white px-5">
          {faqs.map((faq) => (
            <details
              key={faq.id}
              className="border-b border-stone-200 last:border-0"
            >
              <summary className="cursor-pointer py-5 text-sm font-medium text-stone-800">
                {faq.question}
              </summary>
              <p className="whitespace-pre-line pb-5 text-sm leading-relaxed text-stone-600">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
