"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Globe, Monitor, Smartphone, Tablet, RefreshCw } from "lucide-react";
import { Card, Table, Th, Td, Tr } from "@/app/admin/_components/ui";
import { cn } from "@/app/admin/_lib/utils";

type Visit = {
  id: number;
  createdAt: string;
  ip: string;
  country: string;
  region: string;
  city: string;
  path: string;
  referer: string;
  source: string;
  keyword: string;
  device: string;
  userAgent: string;
};

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  Desktop: <Monitor className="w-3.5 h-3.5" />,
  Mobile: <Smartphone className="w-3.5 h-3.5" />,
  Tablet: <Tablet className="w-3.5 h-3.5" />,
};

const fmtTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("sv-SE"); // YYYY-MM-DD HH:MM:SS
  } catch {
    return iso;
  }
};
const location = (v: Visit) => [v.country, v.region, v.city].filter(Boolean).join(" · ") || "Unknown";

export default function IpLogsPage() {
  const [rows, setRows] = useState<Visit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("");

  const [filterIP, setFilterIP] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterDevice, setFilterDevice] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "300" });
      if (filterIP) params.set("ip", filterIP);
      if (filterCountry) params.set("country", filterCountry);
      if (filterKeyword) params.set("keyword", filterKeyword);
      if (filterSource) params.set("source", filterSource);
      if (filterDevice !== "All") params.set("device", filterDevice);
      const data = await fetch(`/api/admin/analytics/visits?${params}`, { cache: "no-store" }).then((r) => r.json());
      setRows(Array.isArray(data?.visits) ? data.visits : []);
      setTotal(Number(data?.total ?? 0));
      setUpdatedAt(new Date().toLocaleTimeString("sv-SE"));
    } finally {
      setLoading(false);
    }
  }, [filterIP, filterCountry, filterKeyword, filterSource, filterDevice]);

  // Debounce filter changes.
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const deviceCounts = useMemo(() => {
    const c = { Desktop: 0, Mobile: 0, Tablet: 0 } as Record<string, number>;
    rows.forEach((v) => {
      if (v.device in c) c[v.device]++;
    });
    return c;
  }, [rows]);

  return (
    <div className="space-y-5">
      {/* Device breakdown cards */}
      <div className="grid grid-cols-4 gap-4">
        {(["Desktop", "Mobile", "Tablet"] as const).map((d) => (
          <Card key={d}>
            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                {DEVICE_ICONS[d]}
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{deviceCounts[d]}</p>
                <p className="text-xs text-slate-500">{d}</p>
              </div>
            </div>
          </Card>
        ))}
        <Card>
          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{total}</p>
              <p className="text-xs text-slate-500">Total Logs</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { placeholder: "Filter by IP...", value: filterIP, onChange: setFilterIP },
          { placeholder: "Filter by country...", value: filterCountry, onChange: setFilterCountry },
          { placeholder: "Filter by keyword...", value: filterKeyword, onChange: setFilterKeyword },
          { placeholder: "Filter by source...", value: filterSource, onChange: setFilterSource },
        ].map((f) => (
          <div key={f.placeholder} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={f.placeholder}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white w-44"
            />
          </div>
        ))}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {["All", "Desktop", "Mobile", "Tablet"].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDevice(d)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                filterDevice === d ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700",
              )}
            >
              {d}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          {updatedAt ? `Updated ${updatedAt}` : "Refresh"}
        </button>
      </div>

      {/* Visit log table */}
      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Time</Th>
              <Th>IP</Th>
              <Th>Location</Th>
              <Th>Source</Th>
              <Th>Keyword</Th>
              <Th>Landing Page</Th>
              <Th>Device</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <Td colSpan={7} className="text-center py-10 text-sm text-slate-400">
                  {loading ? "Loading…" : "No data yet"}
                </Td>
              </tr>
            ) : (
              rows.map((v) => (
                <Tr key={v.id}>
                  <Td className="text-xs font-mono text-slate-600 whitespace-nowrap">{fmtTime(v.createdAt)}</Td>
                  <Td className="font-mono text-xs text-slate-700">{v.ip}</Td>
                  <Td className="text-xs text-slate-700 max-w-[200px] truncate" >{location(v)}</Td>
                  <Td>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {v.source}
                    </span>
                  </Td>
                  <Td className="text-xs text-slate-500 max-w-[140px] truncate">{v.keyword || "—"}</Td>
                  <Td className="text-xs text-blue-600 font-mono max-w-[160px] truncate">{v.path}</Td>
                  <Td>
                    <span className="flex items-center gap-1.5 text-xs text-slate-600">
                      {DEVICE_ICONS[v.device] ?? <Monitor className="w-3.5 h-3.5" />}
                      {v.device}
                    </span>
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
