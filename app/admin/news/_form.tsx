"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Save, Globe, FileText, Upload, X, Loader2, ImagePlus } from "lucide-react";
import { Button, Input, Textarea } from "@/app/admin/_components/ui";
import { cn } from "@/app/admin/_lib/utils";

const CATEGORIES = ["Industry Insights", "New Product", "Exhibition Review", "Company News"];

interface ProductOption {
  id: number; name: string; image: string; category: string;
}

interface PostForm {
  title: string; slug: string; category: string;
  excerpt: string; content: string; image: string; status: string;
  relatedProducts: number[];
}

interface Props {
  postId?: number;
  initial?: Partial<PostForm>;
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function renderPreview(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;
  for (const line of lines) {
    const t = line.trim();
    if (!t) { elements.push(<div key={key++} className="mb-2" />); continue; }
    if (t.startsWith("## ")) {
      elements.push(<h2 key={key++} className="text-lg font-bold text-stone-800 mt-6 mb-2">{t.slice(3)}</h2>);
    } else if (t.startsWith("**") && t.endsWith("**")) {
      elements.push(<p key={key++} className="font-bold text-stone-800 mb-1">{t.slice(2, -2)}</p>);
    } else if (t.startsWith("- ")) {
      elements.push(<li key={key++} className="text-stone-600 ml-4 list-disc text-sm">{t.slice(2)}</li>);
    } else if (/^\d+\./.test(t)) {
      elements.push(<li key={key++} className="text-stone-600 ml-4 list-decimal text-sm">{t.replace(/^\d+\.\s*/, "")}</li>);
    } else if (t === "---") {
      elements.push(<hr key={key++} className="border-stone-200 my-4" />);
    } else if (/^!\[([^\]]*)\]\(([^)]+)\)$/.test(t)) {
      const m = t.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (m) elements.push(<img key={key++} src={m[2]} alt={m[1]} className="max-w-full rounded-lg my-3" />);
    } else {
      const withLinks = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, txt, href) =>
        `<a href="${href}" class="text-[#C9A55A] underline">${txt}</a>`
      );
      elements.push(<p key={key++} className="text-stone-600 text-sm leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: withLinks }} />);
    }
  }
  return elements;
}

export default function NewsForm({ postId, initial }: Props) {
  const router = useRouter();
  const isEdit = !!postId;

  const [form, setForm] = useState<PostForm>({
    title:    initial?.title    ?? "",
    slug:     initial?.slug     ?? "",
    category: initial?.category ?? "Industry Insights",
    excerpt:  initial?.excerpt  ?? "",
    content:  initial?.content  ?? "",
    image:    initial?.image    ?? "",
    status:          initial?.status          ?? "draft",
    relatedProducts: initial?.relatedProducts ?? [],
  });

  const [slugManual, setSlugManual] = useState(isEdit);
  const [preview, setPreview]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver]     = useState(false);
  const [allProducts, setAllProducts]                     = useState<ProductOption[]>([]);
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
  const [contentUploading, setContentUploading] = useState(false);
  const fileInputRef                = useRef<HTMLInputElement>(null);
  const contentFileRef              = useRef<HTMLInputElement>(null);
  const contentRef                  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!slugManual && form.title) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title, slugManual]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: ProductOption[]) => setAllProducts(data));
  }, []);

  const set = useCallback(<K extends keyof PostForm>(k: K, v: PostForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  }, []);

  const uploadImage = useCallback(async (file: File) => {
    setUploadError("");
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) { setUploadError(json.error ?? "Upload failed"); return; }
      set("image", json.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Network error during upload");
    } finally {
      setUploading(false);
    }
  }, [set]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = "";
  };

  const uploadContentImage = useCallback(async (file: File) => {
    setContentUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) return;
      const url = json.url as string;
      const textarea = contentRef.current;
      const imageMarkdown = `\n![image](${url})\n`;
      if (textarea) {
        const start = textarea.selectionStart ?? 0;
        const end   = textarea.selectionEnd   ?? 0;
        setForm((f) => ({
          ...f,
          content: f.content.substring(0, start) + imageMarkdown + f.content.substring(end),
        }));
      } else {
        setForm((f) => ({ ...f, content: f.content + imageMarkdown }));
      }
    } finally {
      setContentUploading(false);
    }
  }, []);

  const handleContentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadContentImage(file);
    e.target.value = "";
  };

  const toggleProduct = (id: number) => {
    setForm((f) => ({
      ...f,
      relatedProducts: f.relatedProducts.includes(id)
        ? f.relatedProducts.filter((i) => i !== id)
        : [...f.relatedProducts, id],
    }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.slug.trim())  { setError("Slug is required."); return; }

    setSaving(true);
    try {
      const url    = isEdit ? `/api/posts/${postId}` : "/api/posts";
      const method = isEdit ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed."); return; }
      router.push("/admin/news");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <button type="button" onClick={() => setPreview(false)}
              className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1",
                !preview ? "bg-white text-slate-800 shadow-sm" : "text-slate-500")}>
              <FileText className="w-3 h-3" /> Edit
            </button>
            <button type="button" onClick={() => setPreview(true)}
              className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1",
                preview ? "bg-white text-slate-800 shadow-sm" : "text-slate-500")}>
              <Eye className="w-3 h-3" /> Preview
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {(["draft", "published"] as const).map((s) => (
              <button key={s} type="button" onClick={() => set("status", s)}
                className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize",
                  form.status === s ? "bg-white text-slate-800 shadow-sm" : "text-slate-500")}>
                {s === "published" ? <Globe className="w-3 h-3 inline mr-1" /> : <EyeOff className="w-3 h-3 inline mr-1" />}
                {s}
              </button>
            ))}
          </div>
          <Button type="submit" variant="primary" size="sm" disabled={saving}>
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Publish"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <Input
              label="Title *"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Article title"
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Slug *</label>
              <div className="flex gap-2">
                <input
                  value={form.slug}
                  onChange={(e) => { setSlugManual(true); set("slug", e.target.value); }}
                  placeholder="url-friendly-slug"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
                <button type="button" onClick={() => { setSlugManual(false); set("slug", slugify(form.title)); }}
                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">
                  Auto
                </button>
              </div>
              <p className="text-[10px] text-slate-400">kelikuli.com/news/{form.slug || "slug"}</p>
            </div>

            <Textarea
              label="Excerpt"
              rows={2}
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              placeholder="Brief description shown in article cards..."
            />
          </div>

          {/* Content editor / preview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Toolbar */}
            {!preview && (
              <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-1 flex-wrap">
                {([
                  { label: "H2", prefix: "## ", defaultText: "Section Heading" },
                  { label: "H3", prefix: "### ", defaultText: "Sub Heading" },
                ] as { label: string; prefix: string; defaultText: string }[]).map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => {
                      const ta = contentRef.current;
                      if (!ta) return;
                      const start = ta.selectionStart;
                      const end = ta.selectionEnd;
                      const before = form.content.substring(0, start);
                      const selected = form.content.substring(start, end) || btn.defaultText;
                      const needsNewline = before.length > 0 && !before.endsWith("\n");
                      const inserted = (needsNewline ? "\n" : "") + btn.prefix + selected + "\n";
                      setForm((f) => ({ ...f, content: before + inserted + f.content.substring(end) }));
                      setTimeout(() => { ta.focus(); const p = before.length + inserted.length; ta.setSelectionRange(p, p); }, 0);
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 hover:bg-slate-100 transition-colors text-slate-700"
                  >{btn.label}</button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const ta = contentRef.current;
                    if (!ta) return;
                    const start = ta.selectionStart;
                    const end = ta.selectionEnd;
                    const selected = form.content.substring(start, end) || "bold text";
                    const inserted = `**${selected}**`;
                    setForm((f) => ({ ...f, content: f.content.substring(0, start) + inserted + f.content.substring(end) }));
                    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + inserted.length, start + inserted.length); }, 0);
                  }}
                  className="px-2.5 py-1 text-xs font-bold rounded-md border border-slate-200 hover:bg-slate-100 transition-colors text-slate-700"
                >B</button>
                <button
                  type="button"
                  onClick={() => {
                    const ta = contentRef.current;
                    if (!ta) return;
                    const start = ta.selectionStart;
                    const inserted = "\n---\n";
                    setForm((f) => ({ ...f, content: f.content.substring(0, start) + inserted + f.content.substring(start) }));
                    setTimeout(() => { ta.focus(); const p = start + inserted.length; ta.setSelectionRange(p, p); }, 0);
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 hover:bg-slate-100 transition-colors text-slate-700"
                >—</button>
                <div className="w-px h-4 bg-slate-200 mx-1" />
                {[
                  { label: "• List", title: "Bullet List", prefix: "- " },
                  { label: "1. List", title: "Numbered List", prefix: "1. " },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    title={btn.title}
                    onClick={() => {
                      const ta = contentRef.current;
                      if (!ta) return;
                      const start = ta.selectionStart;
                      const inserted = "\n" + btn.prefix + "Item\n";
                      const newContent = form.content.substring(0, start) + inserted + form.content.substring(start);
                      setForm((f) => ({ ...f, content: newContent }));
                      setTimeout(() => { ta.focus(); ta.setSelectionRange(start + btn.prefix.length + 1, start + inserted.length - 1); }, 0);
                    }}
                    className="px-2.5 py-1 text-xs rounded-md border border-slate-200 hover:bg-slate-100 transition-colors text-slate-700 font-medium"
                  >
                    {btn.label}
                  </button>
                ))}
                <div className="w-px h-4 bg-slate-200 mx-1" />
                <button
                  type="button"
                  title="Insert Link"
                  onClick={() => {
                    const ta = contentRef.current;
                    if (!ta) return;
                    const start = ta.selectionStart;
                    const end = ta.selectionEnd;
                    const selected = form.content.substring(start, end) || "link text";
                    const inserted = `[${selected}](https://)`;
                    const newContent = form.content.substring(0, start) + inserted + form.content.substring(end);
                    setForm((f) => ({ ...f, content: newContent }));
                    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + selected.length + 3, start + inserted.length - 1); }, 0);
                  }}
                  className="px-2.5 py-1 text-xs rounded-md border border-slate-200 hover:bg-slate-100 transition-colors text-slate-700 font-medium"
                >
                  🔗 Link
                </button>
                <button
                  type="button"
                  onClick={() => contentFileRef.current?.click()}
                  disabled={contentUploading}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border border-slate-200 hover:bg-slate-100 transition-colors text-slate-700 font-medium disabled:opacity-50 ml-auto"
                >
                  {contentUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />}
                  Image
                </button>
                <input ref={contentFileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleContentFileChange} />
              </div>
            )}
            {preview ? (
              <div className="p-6 min-h-[400px] prose-sm max-w-none">
                {form.content ? renderPreview(form.content) : <p className="text-slate-400 text-sm">Nothing to preview yet.</p>}
              </div>
            ) : (
              <textarea
                ref={contentRef}
                rows={22}
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                placeholder={"Start writing your article..."}
                className="w-full px-4 py-4 text-sm text-slate-800 resize-none focus:outline-none bg-white leading-relaxed"
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Cover Image</label>

              {form.image ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-stone-100 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image} alt="cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => set("image", "")}
                      className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                    dragOver ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                  )}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
                      <p className="text-sm text-slate-500">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-600">Click or drag image here</p>
                      <p className="text-xs text-slate-400 mt-1">JPG · PNG · WEBP · Max 5 MB</p>
                    </>
                  )}
                </div>
              )}

              {uploadError && (
                <p className="text-xs text-red-500">{uploadError}</p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Status info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-medium text-slate-600 mb-3">Status</p>
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium",
              form.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-600"
            )}>
              {form.status === "published" ? <Globe className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {form.status === "published" ? "Will be visible on the News page" : "Only visible in admin panel"}
            </div>
          </div>

          {/* Related Products */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-medium text-slate-600 mb-3">
              Related Products
              {form.relatedProducts.length > 0 && (
                <span className="ml-2 bg-[#C9A55A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {form.relatedProducts.length}
                </span>
              )}
            </p>
            <select
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 mb-3"
            >
              <option value="">All Categories</option>
              {[...new Set(allProducts.map((p) => p.category))].sort().map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            {allProducts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Loading products…</p>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto pr-0.5">
                {(productCategoryFilter ? allProducts.filter((p) => p.category === productCategoryFilter) : allProducts).map((p) => (
                  <label
                    key={p.id}
                    className={cn(
                      "flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors select-none",
                      form.relatedProducts.includes(p.id) ? "bg-[#F5EDD8]" : "hover:bg-slate-50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={form.relatedProducts.includes(p.id)}
                      onChange={() => toggleProduct(p.id)}
                      className="shrink-0 accent-[#C9A55A]"
                    />
                    <div className="w-8 h-8 shrink-0 rounded overflow-hidden bg-stone-100">
                      {p.image
                        ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-stone-200" />}
                    </div>
                    <span className="text-xs text-slate-700 line-clamp-2 leading-tight">{p.name}</span>
                  </label>
                ))}
              </div>
            )}
            {form.relatedProducts.length > 0 && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, relatedProducts: [] }))}
                className="mt-2 text-[10px] text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
