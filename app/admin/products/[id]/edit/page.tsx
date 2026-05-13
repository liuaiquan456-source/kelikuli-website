"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AddProductForm from "../../_form";

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setProduct(data);
        else setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-20 text-slate-400">Loading...</div>;
  if (notFound) return (
    <div className="text-center py-20 text-slate-400">
      <p>Product not found.</p>
      <Link href="/admin/products" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
        <ArrowLeft className="w-3 h-3 inline mr-1" />Back to Products
      </Link>
    </div>
  );
  return <AddProductForm product={product!} />;
}
