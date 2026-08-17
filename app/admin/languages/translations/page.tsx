"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, Table, Th, Td, Tr, Switch } from "@/app/admin/_components/ui";

interface Language {
  code: string; name: string; nativeName: string; flag: string;
}
interface TranslationEntry {
  key: string; section: string; en: string; value: string;
}

const PAGE_SIZE = 50;

export default function TranslationsPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [languageCode, setLanguageCode] = useState("");
  const [search, setSearch] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [entries, setEntries] = useState<TranslationEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/languages").then((r) => r.json()).then((data: Language[]) => {
      const list = Array.isArray(data) ? data.filter((l) => l.code !== "en") : [];
      setLanguages(list);
      if (list.length > 0) setLanguageCode((c) => c || list[0].code);
    });
  }, []);

  const fetchEntries = useCallback(async () => {
    if (!languageCode) return;
    setLoading(true);
    const params = new URLSearchParams({
      languageCode, search, page: String(page), pageSize: String(PAGE_SIZE),
      onlyMissing: onlyMissing ? "true" : "false",
    });
    const res = await fetch(`/api/admin/translations?${params}`);
    const data = await res.json();
    setEntries(data.entries ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [languageCode, search, page, onlyMissing]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);
  useEffect(() => { setPage(1); }, [languageCode, search, onlyMissing]);

  const saveValue = async (key: string, value: string) => {
    setSavingKey(key);
    await fetch("/api/admin/translations", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, languageCode, value }),
    });
    setEntries((prev) => prev.map((e) => e.key === key ? { ...e, value } : e));
    setSavingKey(null);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select value={languageCode} onChange={(e) => setLanguageCode(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400">
          {languages.length === 0 && <option value="">No languages yet</option>}
          {languages.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.nativeName}</option>)}
        </select>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search key or English text..."
            className="border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400 w-64"
          />
        </div>

        <Switch checked={onlyMissing} onChange={setOnlyMissing} label="Untranslated only" />

        <div className="ml-auto text-sm text-slate-500">
          <strong className="text-slate-800">{total}</strong> keys
        </div>
      </div>

      <Card>
        {!languageCode ? (
          <div className="py-16 text-center text-slate-400 text-sm">Add a language first under Language Management.</div>
        ) : loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading translations...</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Section</Th>
                <Th>English (source)</Th>
                <Th>Translation</Th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <Tr key={e.key}>
                  <Td className="text-xs text-slate-400 whitespace-nowrap">{e.section}</Td>
                  <Td className="text-sm text-slate-600 max-w-xs">{e.en}</Td>
                  <Td className="min-w-[280px]">
                    <input
                      defaultValue={e.value}
                      onBlur={(ev) => { if (ev.target.value !== e.value) saveValue(e.key, ev.target.value); }}
                      placeholder="Not translated yet"
                      disabled={savingKey === e.key}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 placeholder:text-slate-400"
                    />
                  </Td>
                </Tr>
              ))}
              {entries.length === 0 && (
                <tr><td colSpan={3} className="text-center py-12 text-slate-400 text-sm">No matching keys.</td></tr>
              )}
            </tbody>
          </Table>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 hover:border-blue-400 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 hover:border-blue-400 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
