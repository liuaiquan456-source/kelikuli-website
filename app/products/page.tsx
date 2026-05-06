import type { Metadata } from "next";
import ProductsClient from "./_client";

export const metadata: Metadata = {
  title: "Wholesale Resin Figurines — Products Catalog",
  description:
    "Browse wholesale resin figurines, blind box collectibles and seasonal Zakka crafts. OEM/ODM available — factory-direct from Kelikuli, Zhejiang China.",
};

export default function ProductsPage() {
  return <ProductsClient />;
}
