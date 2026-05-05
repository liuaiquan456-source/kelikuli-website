"use client";
import { Globe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody, Table, Th, Td } from "@/app/admin/_components/ui";

const SOURCE_COLORS: Record<string, string> = {
  "Google Search":    "#4285F4",
  "Direct":           "#6366F1",
  "Facebook":         "#1877F2",
  "Instagram":        "#E1306C",
  "Bing Search":      "#00809D",
  "Email Marketing":  "#F59E0B",
  "Other Websites":   "#94A3B8",
};

const sources: { source: string; visits: number; percentage: number; color: string }[] = [];

export default function TrafficSourcesPage() {
  return (
    <div className="space-y-5">
      {/* Top source stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {["Google Search", "Direct", "Facebook", "Email Marketing"].map((name) => (
          <Card key={name}>
            <CardBody className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: (SOURCE_COLORS[name] ?? "#94A3B8") + "20", color: SOURCE_COLORS[name] ?? "#94A3B8" }}
              >
                <Globe className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 truncate">{name}</p>
                <p className="text-2xl font-bold text-slate-800">0</p>
                <p className="text-xs text-slate-400">No data</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Traffic share breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Share Breakdown</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          {sources.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No traffic data yet</p>
          ) : (
            sources.map((s) => (
              <div key={s.source}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">{s.source}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{s.visits.toLocaleString()} visits</span>
                    <span className="text-slate-400 w-10 text-right">{s.percentage}%</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${s.percentage}%`, background: SOURCE_COLORS[s.source] ?? "#94A3B8" }}
                  />
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {/* Detail table */}
      <Card>
        <CardHeader>
          <CardTitle>Source Detail</CardTitle>
        </CardHeader>
        <Table>
          <thead>
            <tr>
              <Th>Source</Th>
              <Th>Visits</Th>
              <Th>Share</Th>
              <Th>vs Last Month</Th>
            </tr>
          </thead>
          <tbody>
            {sources.length === 0 ? (
              <tr>
                <Td colSpan={4} className="text-center py-10 text-sm text-slate-400">
                  No data yet
                </Td>
              </tr>
            ) : (
              sources.map((s) => (
                <tr key={s.source} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: (SOURCE_COLORS[s.source] ?? "#94A3B8") + "20", color: SOURCE_COLORS[s.source] ?? "#94A3B8" }}
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{s.source}</span>
                    </div>
                  </Td>
                  <Td className="font-semibold text-sm">{s.visits.toLocaleString()}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full">
                        <div className="h-1.5 rounded-full" style={{ width: `${s.percentage}%`, background: SOURCE_COLORS[s.source] ?? "#94A3B8" }} />
                      </div>
                      <span className="text-xs text-slate-400">{s.percentage}%</span>
                    </div>
                  </Td>
                  <Td className="text-xs text-slate-400">—</Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
