import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "./_client";
import Breadcrumb from "@/components/Breadcrumb";

async function getProduct(id: number) {
  try {
    const p = await prisma.product.findUnique({ where: { id } });
    if (!p) return null;
    return { ...p, tags: JSON.parse(p.tags) as string[] };
  } catch {
    return null;
  }
}

async function getRelated(category: string, excludeId: number) {
  try {
    const same = await prisma.product.findMany({
      where: { category, status: "active", NOT: { id: excludeId } },
      take: 8,
    });
    if (same.length > 0) return same.map((p) => ({ ...p, tags: JSON.parse(p.tags) as string[] }));

    const other = await prisma.product.findMany({
      where: { status: "active", NOT: { id: excludeId } },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    return other.map((p) => ({ ...p, tags: JSON.parse(p.tags) as string[] }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: idStr } = await params;
  const product = await getProduct(parseInt(idStr, 10));
  if (!product) return { title: "Product Not Found" };
  const url = `https://kelikuli.com/products/${idStr}`;
  return {
    title: `${product.name} — ${product.category} | Wholesale Resin Figurines`,
    description: `Buy wholesale ${product.name} from Kelikuli factory. Custom OEM/ODM resin ${product.category.toLowerCase()} — low MOQ, hand-painted, factory-direct from Zhejiang, China.`,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${product.name} | Kelikuli`,
      description: `Wholesale ${product.name} — factory-direct resin ${product.category.toLowerCase()} from Kelikuli, Zhejiang China.`,
      images: product.image ? [{ url: product.image, alt: product.name }] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  const product = await getProduct(id);
  const related = product ? await getRelated(product.category, id) : [];

  const productSchema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: `Wholesale ${product.name} — factory-direct resin ${product.category.toLowerCase()} from Kelikuli, Zhejiang China. Low MOQ, hand-painted, OEM/ODM available.`,
        image: product.image ?? undefined,
        brand: { "@type": "Brand", name: "Kelikuli" },
        category: product.category,
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          price: "0",
          priceCurrency: "USD",
          priceValidUntil: "2099-12-31",
          seller: { "@type": "Organization", name: "Kelikuli" },
        },
      }
    : null;

  const breadcrumbItems = product
    ? [{ label: "Products", href: "/products" }, { label: product.name }]
    : [{ label: "Products", href: "/products" }];

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
