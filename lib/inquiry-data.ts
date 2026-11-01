import { publicSourcePath } from "./content";
import { services } from "@/data/manufacturing";
import { developmentProjects } from "@/data/development-projects";

export type InquiryAttribution = {
  sourcePage: string;
  landingPage: string;
  service: string;
  project: string;
  productId: string;
  country: string;
  quantity: string;
  dimensions: string;
};
export function shortText(value: unknown, max = 200): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
export function normalizeAttribution(value: unknown): InquiryAttribution {
  const raw =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  return {
    sourcePage: publicSourcePath(raw.sourcePage),
    landingPage: publicSourcePath(raw.landingPage),
    service: services.some((s) => s.slug === raw.service)
      ? String(raw.service)
      : "",
    project: developmentProjects.some((p) => p.slug === raw.project)
      ? String(raw.project)
      : "",
    productId: /^\d{1,10}$/.test(String(raw.productId ?? ""))
      ? String(raw.productId)
      : "",
    country: shortText(raw.country, 100),
    quantity: shortText(raw.quantity, 80),
    dimensions: shortText(raw.dimensions, 160),
  };
}
export function parseAttribution(
  value: string | undefined,
): InquiryAttribution {
  try {
    return normalizeAttribution(JSON.parse(value || "{}"));
  } catch {
    return normalizeAttribution({});
  }
}
export const inquiryAttachmentPath =
  /^\/api\/inquiries\/files\/[a-f0-9-]{36}\.(?:jpg|jpeg|png|pdf|doc|docx|xls|xlsx|csv|txt|ai|eps|stl|obj|zip)$/;
export function normalizeInquiry(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new Error("Invalid inquiry.");
  const raw = body as Record<string, unknown>;
  const name = shortText(raw.name, 120),
    email = shortText(raw.email, 254),
    phone = shortText(raw.phone, 80),
    message = shortText(raw.message, 10000);
  if (!name || !message || (!email && !phone))
    throw new Error(
      "Please provide your name, project details and an email address or WhatsApp number.",
    );
  if (email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))
    throw new Error("Please enter a valid email address.");
  if (phone && !/^[+\d() .-]{6,80}$/.test(phone))
    throw new Error(
      "Please enter a valid phone / WhatsApp number with country code.",
    );
  const attachments = Array.isArray(raw.attachments)
    ? raw.attachments.slice(0, 5).flatMap((a) => {
        if (
          !a ||
          typeof a !== "object" ||
          typeof a.url !== "string" ||
          !inquiryAttachmentPath.test(a.url)
        )
          return [];
        return [
          { url: a.url, name: shortText(a.name, 200) || "Design attachment" },
        ];
      })
    : [];
  if (
    Array.isArray(raw.attachments) &&
    attachments.length !== raw.attachments.length
  )
    throw new Error(
      "An attachment is invalid. Please upload it again (maximum five files).",
    );
  const cartItems = Array.isArray(raw.cartItems)
    ? raw.cartItems.slice(0, 50).flatMap((p) => {
        if (
          !p ||
          typeof p !== "object" ||
          !Number.isSafeInteger(p.id) ||
          p.id < 1
        )
          return [];
        return [
          {
            id: p.id,
            name: shortText(p.name),
            category: shortText(p.category, 100),
            quantity:
              Number.isSafeInteger(p.quantity) && p.quantity > 0
                ? Math.min(p.quantity, 1000000)
                : undefined,
          },
        ];
      })
    : [];
  return {
    name,
    email,
    phone,
    message,
    company: shortText(raw.company),
    product: shortText(raw.product, 500),
    cartItems,
    attachments,
    attribution: normalizeAttribution(raw.attribution),
  };
}
