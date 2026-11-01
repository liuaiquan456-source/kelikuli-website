"use client";
import { useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { services } from "@/data/manufacturing";
import { publicSourcePath, type QuoteContext } from "@/lib/content";
import { normalizeAttribution } from "@/lib/inquiry-data";
import { inquiryLandingPage, trackSavedInquiry } from "@/lib/quote-analytics";

export type QuoteProduct = {
  id: number;
  name: string;
  category: string;
  image?: string;
  quantity?: number;
  moq?: number;
};
type Props = {
  context?: QuoteContext;
  cartProducts?: QuoteProduct[];
  defaultEmail?: string;
};
const fieldClass =
  "mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-900 outline-none focus:border-[#99732f] focus:ring-1 focus:ring-[#99732f]";

export default function QuoteForm({
  context = {},
  cartProducts = [],
  defaultEmail = "",
}: Props) {
  const pathname = usePathname();
  const id = useId();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState<number | null>(null);
  const submitting = useRef(false);
  const uploaded = useRef(new Map<File, { url: string; name: string }>());
  const source =
    publicSourcePath(context.source) ||
    publicSourcePath(pathname) ||
    "/get-a-quote";
  const productId =
    context.product ||
    (cartProducts.length === 1
      ? String(cartProducts[0].id)
      : pathname.match(/^\/products\/(\d+)$/)?.[1] || "");
  const inferredService =
    context.service || pathname.match(/^\/services\/([^/]+)$/)?.[1] || "";
  const initialMessage = cartProducts.length
    ? `Please quote these products:\n${cartProducts.map((p) => `${p.name} (Product #${p.id}) — quantity: ${p.quantity ?? "to confirm"}`).join("\n")}\n\n`
    : "";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = new FormData(event.currentTarget);
    const get = (key: string) => String(form.get(key) || "").trim();
    if (!get("email") && !get("phone")) {
      setError(
        "Please provide an email address or WhatsApp number so we can reply.",
      );
      return;
    }
    if (
      files.length > 5 ||
      files.some((file) => file.size > 30 * 1024 * 1024 || !file.size)
    ) {
      setError("Choose up to five non-empty files, each no larger than 30 MB.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const attachments = [];
      for (const file of files) {
        let attachment = uploaded.current.get(file);
        if (!attachment) {
          const payload = new FormData();
          payload.append("file", file);
          const response = await fetch("/api/inquiries/upload", {
            method: "POST",
            body: payload,
          });
          const data = await response.json();
          if (!response.ok)
            throw new Error(
              `${file.name}: ${data.error || "Upload failed. Please try again."}`,
            );
          attachment = { url: data.url, name: data.name };
          uploaded.current.set(file, attachment);
        }
        attachments.push(attachment);
      }
      const attribution = normalizeAttribution({
        sourcePage: source,
        landingPage: inquiryLandingPage() || source,
        service: get("service"),
        project: context.project,
        productId,
        country: get("country"),
        quantity: get("quantity"),
        dimensions: get("dimensions"),
      });
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: get("name"),
          company: get("company"),
          email: get("email"),
          phone: get("phone"),
          product: get("product"),
          message: get("message"),
          attribution,
          cartItems: cartProducts,
          attachments,
        }),
      });
      const data = await response.json();
      if (
        response.status !== 201 ||
        data.success !== true ||
        !Number.isSafeInteger(data.id)
      )
        throw new Error(
          data.error || "We could not save your inquiry. Please try again.",
        );
      setSavedId(data.id);
      try {
        trackSavedInquiry(attribution);
      } catch {
        /* Analytics must not affect a saved inquiry. */
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send. Please try again.",
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  if (savedId !== null)
    return (
      <div
        role="status"
        className="rounded-2xl border border-green-200 bg-green-50 p-8"
      >
        <h2 className="text-2xl font-semibold text-stone-900">
          Your inquiry has been received.
        </h2>
        <p className="mt-4 leading-7 text-stone-600">
          Reference #{savedId}. We will review your brief and reply using the
          contact details you provided.
        </p>
        <p className="mt-3 text-sm text-stone-500">
          Your selected attachments were included with this inquiry.
        </p>
      </div>
    );
  return (
    <form onSubmit={submit} className="space-y-6">
      {productId && (
        <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-600">
          Related product: #{productId}
        </p>
      )}
      <fieldset
        disabled={busy}
        className="grid gap-5 sm:grid-cols-2 disabled:opacity-60"
      >
        <label className="text-sm font-medium">
          Your name *
          <input
            name="name"
            required
            maxLength={120}
            autoComplete="name"
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium">
          Company
          <input
            name="company"
            maxLength={200}
            autoComplete="organization"
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            maxLength={254}
            defaultValue={defaultEmail}
            autoComplete="email"
            className={fieldClass}
            aria-describedby={`${id}-contact-note`}
          />
        </label>
        <label className="text-sm font-medium">
          Phone / WhatsApp
          <input
            name="phone"
            type="tel"
            maxLength={80}
            autoComplete="tel"
            placeholder="Include country code"
            className={fieldClass}
            aria-describedby={`${id}-contact-note`}
          />
        </label>
        <p
          id={`${id}-contact-note`}
          className="-mt-2 text-xs leading-5 text-stone-500 sm:col-span-2"
        >
          Provide at least one: email or WhatsApp / phone.
        </p>
        <label className="text-sm font-medium">
          Country / destination *
          <input
            name="country"
            required
            maxLength={100}
            autoComplete="country-name"
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium">
          Service
          <select
            name="service"
            defaultValue={inferredService}
            className={fieldClass}
          >
            <option value="">Help me choose</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Target quantity / MOQ request
          <input
            name="quantity"
            maxLength={80}
            placeholder="Pieces per design, or not decided"
            defaultValue={
              cartProducts.length === 1 ? cartProducts[0].quantity : undefined
            }
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium">
          Product dimensions
          <input
            name="dimensions"
            maxLength={160}
            placeholder="Height × width × depth, with units"
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium sm:col-span-2">
          Product / SKU / collection
          <input
            name="product"
            maxLength={500}
            defaultValue={
              cartProducts.map((p) => `${p.name} (#${p.id})`).join(", ") ||
              (productId ? `Product #${productId}` : "")
            }
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium sm:col-span-2">
          Project details *
          <textarea
            name="message"
            required
            rows={5}
            maxLength={10000}
            defaultValue={initialMessage}
            placeholder="Tell us about your artwork, intended use, finish, packaging and target date."
            className={fieldClass}
          />
        </label>
        <div
          id="upload"
          className="scroll-mt-24 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5 sm:col-span-2"
        >
          <label
            className="block text-sm font-semibold"
            htmlFor={`${id}-design-files`}
          >
            Upload your design
          </label>
          <input
            id={`${id}-design-files`}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.ai,.eps,.stl,.obj,.zip"
            onChange={(e) => {
              setFiles(Array.from(e.target.files || []));
              uploaded.current.clear();
            }}
            className="mt-3 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-stone-200 file:px-4 file:py-2"
          />
          <p className="mt-3 text-xs leading-6 text-stone-500">
            Up to 5 files, 30 MB each. Images, PDF, office documents, AI, EPS,
            STL, OBJ or ZIP. Files are available to the KELIKULI team for your
            inquiry.
          </p>
          {files.length > 0 && (
            <p className="mt-2 break-words text-xs text-stone-600">
              {files.map((f) => f.name).join(", ")}
            </p>
          )}
        </div>
      </fieldset>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-[#29221a] px-7 py-4 text-sm font-semibold text-white hover:bg-[#4b3d2b] disabled:opacity-60"
      >
        {busy ? "Uploading & sending…" : "Send Project Inquiry"}
      </button>
      <p className="text-center text-xs leading-6 text-stone-500">
        Final pricing, MOQ and timing are confirmed after artwork review.
      </p>
    </form>
  );
}
