"use client";
import { use } from "react";
import { mockProducts } from "@/app/admin/_data/mock";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Reuse the Add Product form with pre-filled data
import AddProductForm from "../../_form";

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = mockProducts.find((p) => p.id === parseInt(id));

  if (!product) return (
    <div className="text-center py-20 text-slate-400">
      <p>Product not found.</p>
      <Link href="/admin/products" className="text-blue-600 hover:underline text-sm mt-2 inline-block">← Back to Products</Link>
    </div>
  );

  return <AddProductForm product={product} />;
}
