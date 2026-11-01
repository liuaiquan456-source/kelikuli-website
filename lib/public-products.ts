import type { Prisma } from "@prisma/client";

// Never send database records directly to public APIs or Client Components.
export const publicProductSelect = {
  id: true,
  name: true,
  category: true,
  image: true,
  images: true,
  video: true,
  moq: true,
  leadTime: true,
  description: true,
  specs: true,
  variants: true,
} satisfies Prisma.ProductSelect;

type ProductSource = Prisma.ProductGetPayload<{ select: typeof publicProductSelect }>;

const publicSpecLabels = new Set([
  "material", "size", "dimensions", "color", "colors", "craft", "style",
  "theme", "application", "moq", "lead time", "production lead time",
  "customization", "customization options", "manufacturing type", "service",
]);

const internalContent = /customer request note|submitted category|\b(?:ip notes?|local status|development stage|factory price|fob price|sample price|source|sku|seo|internal notes?)\s*[:：]|auto-published|custom lab/i;

export function publicSpecifications(raw: string): string {
  const lines: string[] = [];
  let privateBlock = false;
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (/^(?:Customer request note\b|Submitted category\b)/i.test(line)) {
      privateBlock = true;
      continue;
    }
    if (/^-{3,}$/.test(line)) {
      privateBlock = false;
      continue;
    }
    // A customer note can contain arbitrary text, including public-looking
    // specifications. Omit the entire block, not just its heading.
    if (privateBlock || internalContent.test(line)) continue;
    const match = line.match(/^([^:：]+)[:：]\s*(.+)$/);
    if (match && publicSpecLabels.has(match[1].trim().toLowerCase())) {
      lines.push(`${match[1].trim()}: ${match[2].trim()}`);
    }
  }
  return lines.join("\n");
}

function arrayValue(raw: string): unknown[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function toPublicProduct(product: ProductSource) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    image: product.image,
    images: arrayValue(product.images).filter((value): value is string => typeof value === "string"),
    video: product.video,
    moq: product.moq,
    leadTime: product.leadTime,
    description: internalContent.test(product.description) ? "" : product.description,
    specs: publicSpecifications(product.specs),
    variants: arrayValue(product.variants).flatMap((value) => {
      if (!value || typeof value !== "object") return [];
      const variant = value as Record<string, unknown>;
      return typeof variant.name === "string" && typeof variant.image === "string"
        ? [{ name: variant.name, image: variant.image }]
        : [];
    }),
  };
}

export type PublicProduct = ReturnType<typeof toPublicProduct>;

export function parseProductId(value: string): number | null {
  const id = Number(value);
  return /^[1-9]\d*$/.test(value) && Number.isSafeInteger(id) ? id : null;
}
