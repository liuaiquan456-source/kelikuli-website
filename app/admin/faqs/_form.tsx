"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/app/admin/_components/ui";
import { Save, ArrowLeft } from "lucide-react";

const PAGE_OPTIONS = [
  { value: "faq",            label: "FAQ Page" },
  { value: "home",           label: "Home" },
  { value: "products",       label: "Products" },
  { value: "custom-oem-odm", label: "Custom Service" },
  { value: "about-us",       label: "About Us" },
  { value: "contact",        label: "Contact" },
];

interface FaqData {
  id?: number;
  question: string;
  answer: string;
  page: string;
  sortOrder: number;
  active: boolean;
}

const defaultForm: FaqData = {
  question: "", answer: "", page: "faq", sortOrder: 0, active: true,
};

export default function FaqForm({ initial }: { initial?: FaqData }) {
  const router = useRouter();
  const [form, setForm] = useState<FaqData>(initial ?? defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof FaqData, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setError("");
    if (!form.question.trim()) { setError("Question is required."); return; }
    if (!form.answer.trim())   { setError("Answer is required."); return; }
    setSaving(true);
    const url    = form.id ? `/api/faqs/${form.id}` : "/api/faqs";
    const method = form.id ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question:  form.question.trim(),
        answer:    form.answer.trim(),
        page:      form.page,
        sortOrder: form.sortOrder,
        active:    form.active,
      }),
    });
    setSaving(false);
    if (!res.ok) { setError("Save failed. Please try again."); return; }
    router.push("/admin/faqs");
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/faqs")}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <h1 className="text-lg font-semibold text-slate-800">
          {form.id ? "Edit FAQ" : "New FAQ"}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <Card>
        <div className="p-5 space-y-5">
          {/* Page */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
              Show on Page <span className="text-red-400">*</span>
            </label>
            <select
              value={form.page}
              onChange={(e) => set("page", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400"
            >
              {PAGE_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">This FAQ will appear at the bottom of the selected page.</p>
          </div>

          {/* Question */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
              Question <span className="text-red-400">*</span>
            </label>
            <input
              value={form.question}
              onChange={(e) => set("question", e.target.value)}
              placeholder="e.g. What is your minimum order quantity?"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Answer */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
              Answer <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.answer}
              onChange={(e) => set("answer", e.target.value)}
              placeholder="Write a clear, helpful answer..."
              rows={5}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-y"
            />
          </div>

          {/* Sort + Active */}
          <div className="flex gap-4 items-end">
            <div className="w-32">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", Number(e.target.value))}
                min={0}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="flex items-center gap-2 pb-2">
              <input
                id="active"
                type="checkbox"
                checked={form.active}
                onChange={(e) => set("active", e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="active" className="text-sm font-medium text-slate-700 cursor-pointer">Active (visible on site)</label>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save FAQ"}
        </Button>
      </div>
    </div>
  );
}
