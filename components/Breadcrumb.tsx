"use client";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const all = [{ label: "Home", href: "/" }, ...items];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: item.href ? `https://kelikuli.com${item.href}` : undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-sm text-stone-400 ${className}`}>
        {all.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-stone-300">/</span>}
            {item.href && i < all.length - 1 ? (
              <Link href={item.href} className="hover:text-[#C9A55A] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-stone-600 truncate max-w-[200px]">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
