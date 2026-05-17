"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import FaqForm from "../../_form";

export default function EditFaq() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/faqs/${id}`).then((r) => r.json()).then(setData);
  }, [id]);

  if (!data) return <div className="py-16 text-center text-slate-400 text-sm">Loading...</div>;
  return <FaqForm initial={data} />;
}
