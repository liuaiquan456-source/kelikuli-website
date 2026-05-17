"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, RefreshCw, HelpCircle, GripVertical } from "lucide-react";
import { Button, Badge, Card, Modal, Table, Th, Td, Tr } from "@/app/admin/_components/ui";

const PAGE_OPTIONS = [
  { value: "faq",           label: "FAQ Page" },
  { value: "home",          label: "Home" },
  { value: "products",      label: "Products" },
  { value: "custom-oem-odm", label: "Custom Service" },
  { value: "about-us",      label: "About Us" },
  { value: "contact",       label: "Contact" },
];

interface FAQ {
  id: number; question: string; answer: string;
  page: string; sortOrder: number; active: boolean; createdAt: string;
}

export default function FAQList() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageFilter, setPageFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/faqs?includeInactive=true");
    const data = await res.json();
    setFaqs(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

  const filtered = pageFilter === "all" ? faqs : faqs.filter((f) => f.page === pageFilter);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/faqs/${deleteTarget.id}`, { method: "DELETE" });
    setFaqs((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const toggleActive = async (faq: FAQ) => {
    const active = !faq.active;
    await fetch(`/api/faqs/${faq.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active }) });
    setFaqs((prev) => prev.map((f) => f.id === faq.id ? { ...f, active } : f));
  };

  const pageLabel = (val: string) => PAGE_OPTIONS.find((p) => p.value === val)?.label ?? val;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-purple-100 text-purple-600">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total FAQs</p>
              <p className="text-2xl font-bold text-slate-800">{loading ? "—" : faqs.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Active</p>
              <p className="text-2xl font-bold text-slate-800">{loading ? "—" : faqs.filter(f => f.active).length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={pageFilter} onChange={(e) => setPageFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400">
          <option value="all">All Pages</option>
          {PAGE_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <Button variant="secondary" onClick={fetchFaqs}><RefreshCw className="w-4 h-4" />Refresh</Button>
        <div className="ml-auto">
          <Link href="/admin/faqs/new"><Button><Plus className="w-4 h-4" />Add FAQ</Button></Link>
        </div>
      </div>

      <div className="text-sm text-slate-500">
        Showing <strong className="text-slate-800">{filtered.length}</strong> FAQs
      </div>

      <Card>
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading FAQs...</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th className="w-8"><GripVertical className="w-3.5 h-3.5 text-slate-300" /></Th>
                <Th>Question</Th>
                <Th>Page</Th>
                <Th>Order</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((faq) => (
                <Tr key={faq.id}>
                  <Td><GripVertical className="w-3.5 h-3.5 text-slate-300" /></Td>
                  <Td>
                    <div>
                      <p className="text-sm font-medium text-slate-800 line-clamp-1">{faq.question}</p>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{faq.answer}</p>
                    </div>
                  </Td>
                  <Td><Badge label={pageLabel(faq.page)} variant="purple" /></Td>
                  <Td className="text-sm text-slate-600">{faq.sortOrder}</Td>
                  <Td>
                    <button onClick={() => toggleActive(faq)} title="Click to toggle"
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        faq.active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}>
                      {faq.active ? "● Active" : "○ Inactive"}
                    </button>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/admin/faqs/${faq.id}/edit`}><Button variant="ghost" size="sm"><Pencil className="w-3.5 h-3.5" /></Button></Link>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(faq)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
                    </div>
                  </Td>
                </Tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No FAQs found. <Link href="/admin/faqs/new" className="text-blue-500 hover:underline">Add one</Link>.</td></tr>
              )}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete FAQ">
        <p className="text-sm text-slate-600 mb-4">Delete this FAQ? This cannot be undone.</p>
        <p className="text-sm font-medium text-slate-800 mb-4 bg-slate-50 px-3 py-2 rounded-lg line-clamp-2">{deleteTarget?.question}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
