"use client";
import { useState } from "react";
import { Globe, Search, Monitor, Smartphone, Tablet, TrendingUp, Users, Eye, Clock, MousePointer } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody, Table, Th, Td, Tr } from "@/app/admin/_components/ui";
import { cn } from "@/app/admin/_lib/utils";

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  Desktop: <Monitor className="w-4 h-4" />,
  Mobile:  <Smartphone className="w-4 h-4" />,
  Tablet:  <Tablet className="w-4 h-4" />,
};

function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-sm text-slate-400">
        No data yet
      </td>
    </tr>
  );
}

export default function AnalyticsOverview() {
  const [activeTab, setActiveTab] = useState<"overview" | "visitors" | "keywords" | "pages">("overview");

  const sources:    never[] = [];
  const keywords:   never[] = [];
  const pageStats:  never[] = [];
  const ipLogs:     never[] = [];

  const deviceCounts = { Desktop: 0, Mobile: 0, Tablet: 0 };

  const tabs = [
    { id: "overview",  label: "Overview"  },
    { id: "visitors",  label: "Visitors"  },
    { id: "keywords",  label: "Keywords"  },
    { id: "pages",     label: "Pages"     },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
              activeTab === t.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          {/* KPI row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Visits",     value: "0", icon: <Eye className="w-5 h-5" />,          color: "bg-blue-100 text-blue-600" },
              { label: "Today's Visits",   value: "0", icon: <TrendingUp className="w-5 h-5" />,   color: "bg-emerald-100 text-emerald-600" },
              { label: "Unique Visitors",  value: "0", icon: <Users className="w-5 h-5" />,         color: "bg-purple-100 text-purple-600" },
              { label: "Avg. Pages/Visit", value: "—", icon: <MousePointer className="w-5 h-5" />, color: "bg-orange-100 text-orange-600" },
            ].map(({ label, value, icon, color }) => (
              <Card key={label}>
                <CardBody className="flex items-center gap-3">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", color)}>{icon}</div>
                  <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-2xl font-bold text-slate-800">{value}</p>
                    <p className="text-xs text-slate-400">No data yet</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5">
            {/* Traffic Sources */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardBody>
                {sources.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No data yet</p>
                ) : null}
              </CardBody>
            </Card>

            {/* Device Breakdown */}
            <Card className="col-span-1">
              <CardHeader><CardTitle>Device Breakdown</CardTitle></CardHeader>
              <CardBody className="space-y-4">
                {(["Desktop", "Mobile", "Tablet"] as const).map((d) => (
                  <div key={d} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      {DEVICE_ICONS[d]}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">{d}</span>
                        <span className="text-slate-400">0%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full">
                        <div className="h-1.5 rounded-full bg-blue-500" style={{ width: "0%" }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-700 shrink-0 w-6 text-right">{deviceCounts[d]}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400 text-center">No sessions recorded yet</p>
                </div>
              </CardBody>
            </Card>

            {/* Top Keywords */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Top Keywords</CardTitle>
              </CardHeader>
              <CardBody>
                {keywords.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No data yet</p>
                ) : null}
              </CardBody>
            </Card>
          </div>

          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th><Th>Page</Th><Th>Visits</Th><Th>Share</Th>
                  <Th>Avg. Time</Th><Th>Bounce Rate</Th><Th>Main Source</Th>
                </tr>
              </thead>
              <tbody>
                {pageStats.length === 0 ? <EmptyRow cols={7} /> : null}
              </tbody>
            </Table>
          </Card>
        </div>
      )}

      {/* ── Visitors Tab ── */}
      {activeTab === "visitors" && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {(["Desktop", "Mobile", "Tablet"] as const).map((d) => (
              <Card key={d}>
                <div className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">{DEVICE_ICONS[d]}</div>
                  <div><p className="text-xl font-bold text-slate-800">{deviceCounts[d]}</p><p className="text-xs text-slate-500">{d}</p></div>
                </div>
              </Card>
            ))}
            <Card>
              <div className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Globe className="w-4 h-4" /></div>
                <div><p className="text-xl font-bold text-slate-800">{ipLogs.length}</p><p className="text-xs text-slate-500">Total Logs</p></div>
              </div>
            </Card>
          </div>
          <Card>
            <Table>
              <thead>
                <tr>
                  <Th>Time</Th><Th>IP</Th><Th>Country</Th><Th>Source</Th>
                  <Th>Keyword</Th><Th>Landing Page</Th><Th>Device</Th><Th>Pages</Th><Th>Duration</Th>
                </tr>
              </thead>
              <tbody>
                {ipLogs.length === 0 ? <EmptyRow cols={9} /> : null}
              </tbody>
            </Table>
          </Card>
        </div>
      )}

      {/* ── Keywords Tab ── */}
      {activeTab === "keywords" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card><div className="p-5 text-center"><p className="text-3xl font-bold text-slate-800">0</p><p className="text-sm text-slate-500 mt-1">Keywords Tracked</p></div></Card>
            <Card><div className="p-5 text-center"><p className="text-3xl font-bold text-slate-800">0</p><p className="text-sm text-slate-500 mt-1">Total Search Visits</p></div></Card>
            <Card><div className="p-5 text-center"><p className="text-3xl font-bold text-slate-800">0</p><p className="text-sm text-slate-500 mt-1">Google Keywords</p></div></Card>
          </div>
          <Card>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th><Th>Keyword</Th><Th>Engine</Th><Th>Visits</Th>
                  <Th>Volume</Th><Th>Landing Page</Th><Th>Country</Th><Th>Last Seen</Th>
                </tr>
              </thead>
              <tbody>
                {keywords.length === 0 ? <EmptyRow cols={8} /> : null}
              </tbody>
            </Table>
          </Card>
        </div>
      )}

      {/* ── Pages Tab ── */}
      {activeTab === "pages" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card><div className="p-5 text-center"><p className="text-3xl font-bold text-slate-800">0</p><p className="text-sm text-slate-500 mt-1">Total Page Views</p></div></Card>
            <Card><div className="p-5 text-center"><p className="text-3xl font-bold text-slate-800">0</p><p className="text-sm text-slate-500 mt-1">Pages Tracked</p></div></Card>
            <Card><div className="p-5 text-center"><p className="text-3xl font-bold text-slate-800">—</p><p className="text-sm text-slate-500 mt-1">Avg Bounce Rate</p></div></Card>
          </div>
          <Card>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th><Th>Page</Th><Th>Visits</Th><Th>Share</Th>
                  <Th>Avg. Time</Th><Th>Bounce Rate</Th><Th>Main Source</Th>
                </tr>
              </thead>
              <tbody>
                {pageStats.length === 0 ? <EmptyRow cols={7} /> : null}
              </tbody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
