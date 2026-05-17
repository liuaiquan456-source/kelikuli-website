"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, X, Plus, Tag, ArrowLeft, Save, Eye, AlertCircle, Loader2 } from "lucide-react";
import { Button, Input, Textarea, Select, Switch, Card, CardHeader, CardTitle, CardBody } from "@/app/admin/_components/ui";
import { CATEGORIES } from "@/app/admin/_data/mock";
import { cn } from "@/app/admin/_lib/utils";

interface Product {
  id: number; name: string; category: string; price: number;
  stock: number; moq?: number; leadTime?: string;
  status: "active" | "inactive"; image: string;
  tags: string[]; createdAt: string;
  description?: string; specs?: string;
  seoTitle?: string; seoDesc?: string; seoKeywords?: string;
  images?: string[];
}

interface Variant { name: string; image: string; }

interface FormState {
  name: string; category: string; price: string; stock: string;
  moq: string; leadTime: string;
  status: boolean; tags: string[]; tagInput: string;
  description: string; specs: string;
  seoTitle: string; seoDesc: string; seoKeywords: string;
  images: string[]; variants: Variant[];
}

interface FormErrors { name?: string; description?: string; }

function productToForm(p: Product): FormState {
  return {
    name: p.name, category: p.category, price: String(p.price),
    stock: String(p.stock), moq: String(p.moq ?? 50), leadTime: p.leadTime ?? "30-45 days",
    status: p.status === "active",
    tags: p.tags, tagInput: "",
    description: p.description ?? "", specs: p.specs ?? "",
    seoTitle: p.seoTitle ?? "", seoDesc: p.seoDesc ?? "", seoKeywords: p.seoKeywords ?? "",
    images: p.images?.length ? p.images : (p.image ? [p.image] : []),
    variants: [],
  };
}

const defaultForm: FormState = {
  name: "", category: CATEGORIES[0], price: "", stock: "",
  moq: "50", leadTime: "30-45 days",
  status: true, tags: [], tagInput: "",
  description: "", specs: "",
  seoTitle: "", seoDesc: "", seoKeywords: "",
  images: [], variants: [],
};

const META_DESC_MAX = 155;

export default function AddProductForm({ product }: { product?: Product }) {
  const isEdit = !!product;
  const router = useRouter();
  const [form, setForm] = useState<FormState>(product ? productToForm(product) : defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const mainImgRef = useRef<HTMLInputElement>(null);
  const variantImgRefs = useRef<(HTMLInputElement | null)[]>([]);

  const set = (key: keyof FormState, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  // Auto-fill SEO title from product name
  useEffect(() => {
    if (!form.seoTitle && form.name) {
      set("seoTitle", `${form.name} - Kelikuli Manufacturer`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name]);

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    const slots = files.slice(0, 8 - form.images.length);
    const previews = slots.map((f) => URL.createObjectURL(f));
    setForm((f) => ({ ...f, images: [...f.images, ...previews] }));
    for (let i = 0; i < slots.length; i++) {
      const preview = previews[i];
      const fd = new FormData();
      fd.append("file", slots[i]);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) {
          setForm((f) => ({ ...f, images: f.images.map((img) => img === preview ? data.url : img) }));
        } else {
          setForm((f) => ({ ...f, images: f.images.filter((img) => img !== preview) }));
          setSaveError("Image upload failed.");
        }
      } catch {
        setForm((f) => ({ ...f, images: f.images.filter((img) => img !== preview) }));
      }
    }
  };

  const uploadVariantImage = async (file: File, index: number) => {
    const preview = URL.createObjectURL(file);
    setForm((f) => {
      const v = [...f.variants];
      v[index] = { ...v[index], image: preview };
      return { ...f, variants: v };
    });
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setForm((f) => {
          const v = [...f.variants];
          v[index] = { ...v[index], image: data.url };
          return { ...f, variants: v };
        });
      }
    } catch { /* keep preview */ }
  };

  const addVariant = () => setForm((f) => ({ ...f, variants: [...f.variants, { name: "", image: "" }] }));
  const removeVariant = (i: number) => setForm((f) => ({ ...f, variants: f.variants.filter((_, j) => j !== i) }));
  const updateVariantName = (i: number, name: string) => setForm((f) => {
    const v = [...f.variants]; v[i] = { ...v[i], name }; return { ...f, variants: v };
  });

  const addTag = () => {
    const t = form.tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    set("tagInput", "");
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (form.description.length > 0 && form.description.length < 10) e.description = "Description too short";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (statusOverride?: boolean) => {
    if (!validate()) return;
    setSaving(true);
    setSaveError("");
    try {
      const payload = {
        name: form.name, category: form.category, price: form.price,
        stock: form.stock, moq: form.moq, leadTime: form.leadTime,
        status: statusOverride !== undefined ? statusOverride : form.status,
        image: form.images[0] ?? "",
        images: form.images,
        tags: form.tags,
        variants: form.variants.filter((v) => v.name || v.image),
        description: form.description, specs: form.specs,
        seoTitle: form.seoTitle, seoDesc: form.seoDesc, seoKeywords: form.seoKeywords,
      };
      const res = isEdit
        ? await fetch(`/api/products/${product!.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Save failed");
      router.push("/admin/products");
    } catch {
      setSaveError("Save failed. Please try again.");
      setSaving(false);
    }
  };

  const catOptions = CATEGORIES.map((c) => ({ value: c, label: c }));
  const checklistItems = [
    { label: "Product name",  done: !!form.name },
    { label: "Category set",  done: !!form.category },
    { label: "MOQ set",       done: !!form.moq },
    { label: "Main image",    done: form.images.length > 0 },
    { label: "Description",   done: form.description.length > 20 },
    { label: "SEO title",     done: !!form.seoTitle },
  ];
  const checklistDone = checklistItems.filter((i) => i.done).length;

  return (
    <div className="flex gap-5 items-start">
      {/* ── Left ── */}
      <div className="flex-1 min-w-0 space-y-4">
        <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Products
        </Link>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? "Edit Product" : "Basic Information"}</CardTitle>
            {isEdit && <span className="text-xs text-slate-400">ID: #{product.id}</span>}
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <Input
                label="Product Name *"
                placeholder="Enter product name"
                value={form.name}
                onChange={(e) => { set("name", e.target.value); if (errors.name) setErrors((er) => ({ ...er, name: undefined })); }}
                error={errors.name}
              />
            </div>
            <Select label="Category *" options={catOptions} value={form.category} onChange={(e) => set("category", e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="MOQ (Min Order Qty)" type="number" placeholder="50" value={form.moq}
                onChange={(e) => set("moq", e.target.value)}
              />
              <Input label="Lead Time" placeholder="e.g. 30-45 days" value={form.leadTime}
                onChange={(e) => set("leadTime", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Status</label>
              <div className="flex items-center gap-3 h-9">
                <Switch checked={form.status} onChange={(v) => set("status", v)} label={form.status ? "Active (On Sale)" : "Inactive (Draft)"} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader><CardTitle>Product Tags</CardTitle></CardHeader>
          <CardBody>
            <div className="flex gap-2 mb-3">
              <input
                value={form.tagInput} onChange={(e) => set("tagInput", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Type a tag and press Enter"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
              <Button variant="secondary" onClick={addTag}><Plus className="w-4 h-4" />Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((t) => (
                <span key={t} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                  <Tag className="w-3 h-3" />{t}
                  <button onClick={() => set("tags", form.tags.filter((x) => x !== t))} className="ml-0.5 text-blue-400 hover:text-blue-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {form.tags.length === 0 && <p className="text-xs text-slate-400">No tags yet. Add some to improve searchability.</p>}
            </div>
          </CardBody>
        </Card>

        {/* Main Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <span className="text-xs text-slate-400">{form.images.length} / 8</span>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-4 gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-blue-200 bg-blue-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-semibold leading-none">
                      Main
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {form.images.length < 8 && (
                <div
                  onClick={() => mainImgRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-slate-50 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-colors"
                >
                  <Upload className="w-6 h-6 text-slate-300" />
                  <span className="text-xs text-slate-400">Add Photo</span>
                </div>
              )}
            </div>
            <input ref={mainImgRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAddImages} />
            {form.images.length > 1 && (
              <p className="text-xs text-slate-400 mt-2">First photo is the main display image.</p>
            )}
          </CardBody>
        </Card>

        {/* Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Product Variants</CardTitle>
            <span className="text-xs text-slate-400">{form.variants.length} SKU{form.variants.length !== 1 ? "s" : ""}</span>
          </CardHeader>
          <CardBody className="space-y-3">
            {form.variants.map((v, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50">
                {/* Image */}
                <div
                  onClick={() => variantImgRefs.current[i]?.click()}
                  className="w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white cursor-pointer overflow-hidden flex items-center justify-center transition-colors"
                >
                  {v.image
                    ? <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                    : <Upload className="w-5 h-5 text-slate-300" />}
                </div>
                <input
                  ref={(el) => { variantImgRefs.current[i] = el; }}
                  type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadVariantImage(f, i); e.target.value = ""; }}
                />
                {/* Name */}
                <input
                  value={v.name}
                  onChange={(e) => updateVariantName(i, e.target.value)}
                  placeholder={`Variant name (e.g. Red, Large, Style A)`}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                />
                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="w-7 h-7 shrink-0 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {form.variants.length < 12 && (
              <button
                type="button"
                onClick={addVariant}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Variant
              </button>
            )}
            {form.variants.length === 0 && (
              <p className="text-xs text-slate-400 text-center pb-1">Add variants to show different colors, sizes, or styles.</p>
            )}
          </CardBody>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader><CardTitle>Product Description</CardTitle></CardHeader>
          <CardBody className="space-y-4">
            <div>
              <Textarea
                label="Product Detail Description *" rows={6}
                placeholder="Describe the product features, materials, use cases..."
                value={form.description}
                onChange={(e) => { set("description", e.target.value); if (errors.description) setErrors((er) => ({ ...er, description: undefined })); }}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>
              )}
              <p className="text-xs text-slate-400 mt-1 text-right">{form.description.length} characters</p>
            </div>
            <Textarea
              label="Product Specifications" rows={4}
              placeholder={"Material: Resin\nSize: Custom\nMOQ: 50pcs\nLead Time: 30-45 days"}
              value={form.specs} onChange={(e) => set("specs", e.target.value)}
            />
          </CardBody>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader><CardTitle>SEO Settings</CardTitle></CardHeader>
          <CardBody className="space-y-4">
            <div>
              <Input
                label="SEO Title"
                placeholder="Custom Resin Figurine - Kelikuli Manufacturer"
                value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{form.seoTitle.length}/60 characters</p>
            </div>
            <div>
              <Textarea
                label="Meta Description" rows={3}
                placeholder="High quality custom resin figurines from Kelikuli factory. OEM/ODM available..."
                value={form.seoDesc} onChange={(e) => set("seoDesc", e.target.value.slice(0, META_DESC_MAX))}
              />
              <p className={cn("text-xs mt-1 text-right", form.seoDesc.length > 140 ? "text-amber-600" : "text-slate-400")}>
                {form.seoDesc.length}/{META_DESC_MAX} characters
              </p>
            </div>
            <Input
              label="SEO Keywords (comma separated)"
              placeholder="custom resin toys, resin figurines wholesale, OEM resin crafts"
              value={form.seoKeywords} onChange={(e) => set("seoKeywords", e.target.value)}
            />
            {form.seoTitle && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 mb-1.5 font-medium">Google Preview:</p>
                <p className="text-sm text-blue-700 font-medium leading-tight">{form.seoTitle}</p>
                <p className="text-xs text-green-700">kelikuli.com/products/{form.name.toLowerCase().replace(/\s+/g, "-").slice(0, 40) || "xxx"}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{form.seoDesc || "No meta description set."}</p>
              </div>
            )}
          </CardBody>
        </Card>

        {saveError && (
          <p className="text-sm text-red-500 flex items-center gap-1.5 pb-2">
            <AlertCircle className="w-4 h-4" />{saveError}
          </p>
        )}
        <div className="flex gap-3 pb-4">
          <Button variant="secondary" onClick={() => handleSave(false)} disabled={saving}>
            Save as Draft
          </Button>
          <Button onClick={() => handleSave()} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Publish Product"}
          </Button>
        </div>
      </div>

      {/* ── Right: Preview + Checklist ── */}
      <div className="w-72 shrink-0 sticky top-4 space-y-4">
        <Card>
          <CardHeader><CardTitle><Eye className="w-4 h-4 inline mr-1" />Product Preview</CardTitle></CardHeader>
          <CardBody className="p-0">
            <div className="aspect-square bg-slate-50 overflow-hidden relative">
              {form.images[0]
                ? <img src={form.images[0]} alt="preview" className="w-full h-full object-contain" />
                : <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Upload className="w-10 h-10" />
                  </div>
              }
            </div>
            <div className="p-4">
              {form.category && <span className="text-[10px] font-semibold text-[#C9A55A] uppercase tracking-wider">{form.category}</span>}
              <h3 className="text-sm font-bold text-slate-800 mt-1 leading-snug min-h-[2.5rem]">
                {form.name || <span className="text-slate-300">Product name will appear here</span>}
              </h3>
              <div className="flex items-center justify-end mt-3">
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                  form.status ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}>
                  {form.status ? "● Active" : "○ Draft"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {form.moq && <p className="text-xs text-slate-400">MOQ: <span className="text-slate-600">{form.moq}pcs</span></p>}
                {form.leadTime && <p className="text-xs text-slate-400 col-span-2">Lead: <span className="text-slate-600">{form.leadTime}</span></p>}
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded">#{t}</span>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publish Checklist</CardTitle>
            <span className="text-xs text-slate-400 font-normal">{checklistDone}/{checklistItems.length}</span>
          </CardHeader>
          <CardBody className="p-3">
            {/* Progress bar */}
            <div className="h-1.5 bg-slate-100 rounded-full mb-3">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all"
                style={{ width: `${(checklistDone / checklistItems.length) * 100}%` }}
              />
            </div>
            <div className="space-y-2">
              {checklistItems.map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] shrink-0",
                    done ? "bg-emerald-500" : "bg-slate-200"
                  )}>
                    {done ? "✓" : ""}
                  </span>
                  <span className={done ? "text-slate-700" : "text-slate-400"}>{label}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
