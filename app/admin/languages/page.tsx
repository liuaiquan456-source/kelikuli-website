"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, RefreshCw, Globe, Star } from "lucide-react";
import { Button, Badge, Card, Table, Th, Td, Tr, Modal, Input } from "@/app/admin/_components/ui";

interface Language {
  code: string; name: string; nativeName: string; flag: string;
  isDefault: boolean; active: boolean; sortOrder: number;
}

const emptyForm = { code: "", name: "", nativeName: "", flag: "" };

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Language | null>(null);

  const fetchLanguages = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/languages");
    const data = await res.json();
    setLanguages(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLanguages(); }, [fetchLanguages]);

  const toggleActive = async (lang: Language) => {
    const active = !lang.active;
    await fetch(`/api/admin/languages/${lang.code}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active }),
    });
    setLanguages((prev) => prev.map((l) => l.code === lang.code ? { ...l, active } : l));
  };

  const setDefault = async (lang: Language) => {
    await fetch(`/api/admin/languages/${lang.code}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isDefault: true }),
    });
    fetchLanguages();
  };

  const handleCreate = async () => {
    if (!form.code.trim() || !form.name.trim() || !form.nativeName.trim()) return;
    await fetch("/api/admin/languages", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setFormOpen(false);
    fetchLanguages();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/admin/languages/${deleteTarget.code}`, { method: "DELETE" });
    setLanguages((prev) => prev.filter((l) => l.code !== deleteTarget.code));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="secondary" onClick={fetchLanguages}><RefreshCw className="w-4 h-4" />Refresh</Button>
        <div className="ml-auto">
          <Button onClick={() => setFormOpen(true)}><Plus className="w-4 h-4" />Add Language</Button>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading languages...</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Language</Th>
                <Th>Code</Th>
                <Th>Default</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {languages.map((lang) => (
                <Tr key={lang.code}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="text-lg leading-none">{lang.flag || <Globe className="w-4 h-4 text-slate-300" />}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{lang.nativeName}</p>
                        <p className="text-xs text-slate-400">{lang.name}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-sm text-slate-500 font-mono">{lang.code}</Td>
                  <Td>
                    {lang.isDefault ? (
                      <Badge label="Default" variant="blue" />
                    ) : (
                      <button onClick={() => setDefault(lang)} className="text-xs text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-1">
                        <Star className="w-3.5 h-3.5" />Set default
                      </button>
                    )}
                  </Td>
                  <Td>
                    <button onClick={() => toggleActive(lang)} title="Click to toggle"
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        lang.active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}>
                      {lang.active ? "● Active" : "○ Inactive"}
                    </button>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(lang)} disabled={lang.isDefault}>
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
              {languages.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-sm">No languages yet. Add one to get started.</td></tr>
              )}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Add Language">
        <div className="space-y-3">
          <Input label="Code (e.g. zh-CN)" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          <Input label="English Name (e.g. Chinese)" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Native Name (e.g. 中文)" value={form.nativeName} onChange={(e) => setForm((f) => ({ ...f, nativeName: e.target.value }))} />
          <Input label="Flag Emoji (optional)" value={form.flag} onChange={(e) => setForm((f) => ({ ...f, flag: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate}>Add Language</Button>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Language">
        <p className="text-sm text-slate-600 mb-4">
          Delete <strong>{deleteTarget?.nativeName}</strong> and all its translations? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
