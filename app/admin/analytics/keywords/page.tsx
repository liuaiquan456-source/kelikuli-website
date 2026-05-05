"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { Card, Table, Th, Td, Tr } from "@/app/admin/_components/ui";
import { cn } from "@/app/admin/_lib/utils";

type Keyword = {
  keyword: string; engine: string; visits: number;
  landingPage: string; country: string; lastSeen: string;
};

const keywords: Keyword[] = [];

export default function KeywordsPage() {
  const [search, setSearch] = useState("");
  const [engine, setEngine] = useState("All");

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
                  No data yet
                </Td>
              </tr>
            ) : (
              filtered.map((k, i) => (
                <Tr key={k.keyword}>
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
                  <Td className="text-xs text-blue-600 font-mono">{k.landingPage}</Td>
                  <Td className="text-xs text-slate-500">{k.country}</Td>
                  <Td className="text-xs text-slate-400 whitespace-nowrap">{k.lastSeen}</Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
