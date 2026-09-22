"use client";
import { useCallback, useEffect, useState } from "react";
import { Globe, RefreshCw, Monitor, Smartphone, Tablet, MapPin, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody, Table, Th, Td, Tr } from "@/app/admin/_components/ui";
import { cn } from "@/app/admin/_lib/utils";
import { SOURCE_COLORS } from "@/lib/analytics";

type Summary = {
  totalVisits: number;
  todayVisits: number;
  last30Visits: number;
  filteredTotal: number;
  uniqueVisitors: number;
  bySource: { source: string; visits: number }[];
  byCountry: { country: string; visits: number }[];
  byIp: { ip: string; visits: number }[];
  byDevice: Record<string, number>;
};

type TimeRange = "today" | "7d" | "30d" | "all";

const TIME_RANGE_LABEL: Record<TimeRange, string> = {
  today: "Today",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  all: "All Time",
};

function sinceFor(range: TimeRange): string | null {
  const now = Date.now();
  if (range === "today") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }
  if (range === "7d") return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  if (range === "30d") return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  return null;
}

type Visit = {
  id: number;
  createdAt: string;
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  path: string;
  source: string;
  device: string;
};

const color = (s: string) => SOURCE_COLORS[s] ?? "#94A3B8";
const fmtTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("sv-SE"); // YYYY-MM-DD HH:MM:SS
  } catch {
    return iso;
  }
};
const location = (v: Visit) =>
  [v.country, v.region, v.city].filter(Boolean).join(" · ") || "Unknown";

const DEVICE_ICON: Record<string, React.ReactNode> = {
  Desktop: <Monitor className="w-3.5 h-3.5" />,
  Mobile: <Smartphone className="w-3.5 h-3.5" />,
  Tablet: <Tablet className="w-3.5 h-3.5" />,
};

export default function TrafficSourcesPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string>("");

  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [ipFilter, setIpFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const since = sinceFor(timeRange);
      const summaryParams = new URLSearchParams();
      if (since) summaryParams.set("since", since);
      if (sourceFilter !== "All") summaryParams.set("source", sourceFilter);
      if (ipFilter) summaryParams.set("ip", ipFilter);

      const visitParams = new URLSearchParams({ limit: "50" });
      if (since) visitParams.set("since", since);
      if (sourceFilter !== "All") visitParams.set("source", sourceFilter);
      if (ipFilter) visitParams.set("ip", ipFilter);

      const [s, v] = await Promise.all([
        fetch(`/api/admin/analytics/summary?${summaryParams}`, { cache: "no-store" }).then((r) => r.json()),
        fetch(`/api/admin/analytics/visits?${visitParams}`, { cache: "no-store" }).then((r) => r.json()),
      ]);
      setSummary(s && !s.error ? s : null);
      setVisits(Array.isArray(v?.visits) ? v.visits : []);
      setUpdatedAt(new Date().toLocaleTimeString("sv-SE"));
    } finally {
      setLoading(false);
    }
  }, [timeRange, sourceFilter, ipFilter]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const sources = summary?.bySource ?? [];
  const totalForShare = sources.reduce((s, x) => s + x.visits, 0) || 1;
  const topCards = sources.slice(0, 4);
  while (topCards.length < 4) {
    topCards.push({ source: ["Google Search", "Direct", "Facebook", "Email Marketing"][topCards.length], visits: 0 });
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-6 text-sm">
          <span className="text-slate-500">Total visits <b className="text-slate-800">{summary?.totalVisits ?? 0}</b></span>
          <span className="text-slate-500">Today <b className="text-slate-800">{summary?.todayVisits ?? 0}</b></span>
          <span className="text-slate-500">Last 30d <b className="text-slate-800">{summary?.last30Visits ?? 0}</b></span>
          <span className="text-slate-500">Unique visitors <b className="text-slate-800">{summary?.uniqueVisitors ?? 0}</b></span>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {updatedAt ? `Updated ${updatedAt}` : "Refresh"}
        </button>
      </div>

      {/* Filters — time range, source, and (via Top IPs below) IP */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {(Object.keys(TIME_RANGE_LABEL) as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                timeRange === r ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700",
              )}
            >
              {TIME_RANGE_LABEL[r]}
            </button>
          ))}
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400 text-slate-700"
        >
          <option value="All">All Sources</option>
          {sources.map((s) => (
            <option key={s.source} value={s.source}>{s.source}</option>
          ))}
        </select>
        {ipFilter && (
          <button
            onClick={() => setIpFilter("")}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            IP: {ipFilter}
            <X className="w-3 h-3" />
          </button>
        )}
        {(timeRange !== "all" || sourceFilter !== "All" || ipFilter) && (
          <span className="text-xs text-slate-400">
            {(summary?.filteredTotal ?? 0).toLocaleString()} visits match this filter
          </span>
        )}
      </div>

      {/* Top source stat cards */}
      <div className="grid grid-cols-4 gap-5">
        {topCards.map((s, i) => (
          <Card key={`${s.source}-${i}`}>
            <CardBody className="flex items-center gap-4 py-7">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: color(s.source) + "20", color: color(s.source) }}
              >
                <Globe className="w-8 h-8" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-500 truncate">{s.source}</p>
                <p className="text-4xl font-bold text-slate-800">{s.visits.toLocaleString()}</p>
                <p className="text-xs text-slate-400">
                  {s.visits ? `${((s.visits / totalForShare) * 100).toFixed(1)}% of traffic` : "No data"}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Traffic share / Top countries / Top IPs — compact, side by side */}
      <div className="grid grid-cols-3 gap-4">
        {/* Traffic share breakdown */}
        <Card>
          <CardHeader><CardTitle>Traffic Share</CardTitle></CardHeader>
          <CardBody className="space-y-1.5 max-h-64 overflow-y-auto">
            {sources.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No traffic data yet</p>
            ) : (
              sources.map((s) => {
                const pct = (s.visits / totalForShare) * 100;
                return (
                  <div key={s.source} className="flex items-center gap-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color(s.source) }} />
                    <span className="text-xs text-slate-700 truncate flex-1 min-w-0">{s.source}</span>
                    <span className="text-xs text-slate-500 shrink-0">{s.visits.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 w-9 text-right shrink-0">{pct.toFixed(1)}%</span>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>

        {/* Country breakdown */}
        <Card>
          <CardHeader><CardTitle>Top Countries / Regions</CardTitle></CardHeader>
          <CardBody className="space-y-1.5 max-h-64 overflow-y-auto">
            {!summary?.byCountry?.length ? (
              <p className="text-xs text-slate-400 text-center py-4">No location data yet</p>
            ) : (
              summary.byCountry.map((c) => (
                <div key={c.country} className="flex items-center gap-2 py-0.5">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-700 truncate flex-1 min-w-0">{c.country}</span>
                  <span className="text-xs text-slate-500 shrink-0">{c.visits.toLocaleString()}</span>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        {/* Top IPs by visit count — click one to filter Recent Visitors below */}
        <Card>
          <CardHeader><CardTitle>Top IP Addresses</CardTitle></CardHeader>
          <CardBody className="space-y-1.5 max-h-64 overflow-y-auto">
            {!summary?.byIp?.length ? (
              <p className="text-xs text-slate-400 text-center py-4">No visit data yet</p>
            ) : (
              summary.byIp.map((r) => {
                const active = ipFilter === r.ip;
                return (
                  <button
                    key={r.ip}
                    onClick={() => setIpFilter(active ? "" : r.ip)}
                    className={cn(
                      "w-full flex items-center gap-2 text-left rounded-md py-0.5 px-1 -mx-1 transition-colors",
                      active ? "bg-blue-50" : "hover:bg-slate-50",
                    )}
                  >
                    <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className={cn("text-xs font-mono truncate flex-1 min-w-0", active ? "text-blue-700 font-semibold" : "text-slate-700")}>
                      {r.ip}
                    </span>
                    <span className="text-xs text-slate-500 shrink-0">{r.visits.toLocaleString()}</span>
                  </button>
                );
              })
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent visitors — country/region, IP and visit time to the second */}
      <Card>
        <CardHeader><CardTitle>Recent Visitors</CardTitle></CardHeader>
        <Table>
          <thead>
            <tr>
              <Th>Time</Th>
              <Th>Location</Th>
              <Th>IP</Th>
              <Th>Source</Th>
              <Th>Landing Page</Th>
              <Th>Device</Th>
            </tr>
          </thead>
          <tbody>
            {visits.length === 0 ? (
              <tr>
                <Td colSpan={6} className="text-center py-10 text-sm text-slate-400">
                  {loading ? "Loading…" : "No visitors recorded yet"}
                </Td>
              </tr>
            ) : (
              visits.map((v) => (
                <Tr key={v.id}>
                  <Td className="text-xs font-mono text-slate-600 whitespace-nowrap">{fmtTime(v.createdAt)}</Td>
                  <Td className="text-xs text-slate-700">{location(v)}</Td>
                  <Td className="font-mono text-xs text-slate-700">{v.ip}</Td>
                  <Td>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: color(v.source) + "20", color: color(v.source) }}
                    >
                      {v.source}
                    </span>
                  </Td>
                  <Td className="text-xs max-w-[180px] truncate">
                    <a href={v.path} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-mono hover:underline">
                      {v.path}
                    </a>
                  </Td>
                  <Td>
                    <span className="flex items-center gap-1.5 text-xs text-slate-600">
                      {DEVICE_ICON[v.device] ?? <Monitor className="w-3.5 h-3.5" />}
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
