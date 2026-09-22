"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Info } from "lucide-react";
import { Card, Table, Th, Td, Tr } from "@/app/admin/_components/ui";
import { cn } from "@/app/admin/_lib/utils";

type Visit = {
  keyword: string;
  source: string;
  path: string;
  country: string;
  createdAt: string;
};

type Keyword = {
  keyword: string; engine: string; visits: number;
  landingPage: string; country: string; lastSeen: string;
};

const fmtDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("sv-SE");
  } catch {
    return iso;
  }
};

// Visit.source values are e.g. "Google Search" / "Bing Search" — reduce to
// the engine name for the All/Google/Bing filter buttons.
function engineOf(source: string): string {
  if (source.startsWith("Google")) return "Google";
  if (source.startsWith("Bing")) return "Bing";
  return source;
}

export default function KeywordsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [engine, setEngine] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetch("/api/admin/analytics/visits?hasKeyword=true&limit=500", { cache: "no-store" }).then((r) => r.json());
      setVisits(Array.isArray(data?.visits) ? data.visits : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Group raw visits with the same keyword+engine into one row.
  const keywords: Keyword[] = useMemo(() => {
    const byKey = new Map<string, Keyword>();
    for (const v of visits) {
      const eng = engineOf(v.source);
      const key = `${v.keyword.toLowerCase()}::${eng}`;
      const existing = byKey.get(key);
      if (existing) {
        existing.visits += 1;
        if (v.createdAt > existing.lastSeen) {
          existing.lastSeen = v.createdAt;
          existing.landingPage = v.path;
          existing.country = v.country || existing.country;
        }
      } else {
        byKey.set(key, {
          keyword: v.keyword, engine: eng, visits: 1,
          landingPage: v.path, country: v.country || "Unknown", lastSeen: v.createdAt,
        });
      }
    }
    return [...byKey.values()].sort((a, b) => b.visits - a.visits);
  }, [visits]);

  const filtered = keywords.filter((k) => {
    const matchSearch = k.keyword.toLowerCase().includes(search.toLowerCase());
    const matchEngine = engine === "All" || k.engine === engine;
    return matchSearch && matchEngine;
  });

  const maxVisits = filtered.length > 0 ? Math.max(...filtered.map((k) => k.visits)) : 1;

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="p-5 text-center">
            <p className="text-3xl font-bold text-slate-800">{keywords.length}</p>
            <p className="text-sm text-slate-500 mt-1">Keywords Tracked</p>
          </div>
        </Card>
        <Card>
          <div className="p-5 text-center">
            <p className="text-3xl font-bold text-slate-800">{keywords.reduce((s, k) => s + k.visits, 0).toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-1">Total Search Visits</p>
          </div>
        </Card>
        <Card>
          <div className="p-5 text-center">
            <p className="text-3xl font-bold text-slate-800">{keywords.filter((k) => k.engine === "Google").length}</p>
            <p className="text-sm text-slate-500 mt-1">Google Keywords</p>
          </div>
        </Card>
      </div>

      {/* Why this is usually empty */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-xs leading-relaxed">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Google and Bing stop the search terms visitors typed from reaching this site — this is a browser/search-engine
          privacy restriction that affects every website, not something this site&apos;s code controls, so this table
          will usually stay empty even with real search traffic. For real search-query data, connect{" "}
          <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="underline font-medium">
            Google Search Console
          </a>{" "}
          for kelikuli.com — it shows exactly which queries brought people to the site (with a 2–3 day delay).
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {["All", "Google", "Bing"].map((e) => (
            <button
              key={e}
              onClick={() => setEngine(e)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                engine === e ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Keywords table */}
      <Card>
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Keyword</Th>
              <Th>Engine</Th>
              <Th>Visits</Th>
              <Th>Volume</Th>
              <Th>Landing Page</Th>
              <Th>Country</Th>
              <Th>Last Seen</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <Td colSpan={8} className="text-center py-10 text-sm text-slate-400">
                  {loading ? "Loading…" : "No keyword data captured yet"}
                </Td>
              </tr>
            ) : (
              filtered.map((k, i) => (
                <Tr key={`${k.keyword}::${k.engine}`}>
                  <Td className="text-xs text-slate-400 w-8">{i + 1}</Td>
                  <Td><p className="text-sm font-medium text-slate-800">{k.keyword}</p></Td>
                  <Td>
                    <span className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full",
                      k.engine === "Google" ? "bg-blue-100 text-blue-700" : "bg-teal-100 text-teal-700"
                    )}>
                      {k.engine}
                    </span>
                  </Td>
                  <Td className="font-semibold text-sm">{k.visits}</Td>
                  <Td>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full">
                      <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${(k.visits / maxVisits) * 100}%` }} />
                    </div>
                  </Td>
                  <Td className="text-xs">
                    <a href={k.landingPage} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-mono hover:underline">
                      {k.landingPage}
                    </a>
                  </Td>
                  <Td className="text-xs text-slate-500">{k.country}</Td>
                  <Td className="text-xs text-slate-400 whitespace-nowrap">{fmtDate(k.lastSeen)}</Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
