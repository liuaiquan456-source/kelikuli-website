import type { Metadata } from "next";
import { Suspense } from "react";
import ProductsClient from "./_client";
import FaqSection from "@/components/FaqSection";

export const metadata: Metadata = {
  title: "Wholesale Resin Figurines — Products Catalog",
  description:
    "Browse wholesale resin figurines, blind box collectibles and seasonal Zakka crafts. OEM/ODM available — factory-direct from Kelikuli, Zhejiang China.",
  alternates: { canonical: "https://kelikuli.com/products" },
};

export default function ProductsPage() {
  return (
    <>
      <Suspense>
        <ProductsClient />
      </Suspense>
      <FaqSection page="products" />
    </>
  );
}
