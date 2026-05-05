"use client";
import { Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody, Table, Th, Td, Tr } from "@/app/admin/_components/ui";
import { cn } from "@/app/admin/_lib/utils";

type PageStat = {
  title: string; url: string; visits: number;
  avgTime: string; bounceRate: number; mainSource: string;
};

const pageStats: PageStat[] = [];

export default function PageViewsPage() {
  const totalViews  = pageStats.reduce((s, p) => s + p.visits, 0);
  const avgBounce   = pageStats.length > 0
    ? (pageStats.reduce((s, p) => s + p.bounceRate, 0) / pageStats.length).toFixed(1)
    : "—";

  const sorted = [...pageStats].sort((a, b) => b.visits - a.visits);

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="p-5 text-center">
            <p className="text-3xl font-bold text-slate-800">{totalViews.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-1">Total Page Views</p>
          </div>
        </Card>
        <Card>
          <div className="p-5 text-center">
            <p className="text-3xl font-bold text-slate-800">{pageStats.length}</p>
            <p className="text-sm text-slate-500 mt-1">Pages Tracked</p>
          </div>
        </Card>
        <Card>
          <div className="p-5 text-center">
            <p className="text-3xl font-bold text-slate-800">{avgBounce}{pageStats.length > 0 ? "%" : ""}</p>
            <p className="text-sm text-slate-500 mt-1">Avg Bounce Rate</p>
          </div>
        </Card>
      </div>

      {/* Page stats table */}
      <Card>
        <CardHeader><CardTitle>Page Performance</CardTitle></CardHeader>
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Page</Th>
              <Th>Visits</Th>
              <Th>Share</Th>
              <Th>Avg. Time</Th>
              <Th>Bounce Rate</Th>
              <Th>Main Source</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <Td colSpan={7} className="text-center py-10 text-sm text-slate-400">
                  No data yet
                </Td>
              </tr>
            ) : (
              sorted.map((p, i) => (
                <Tr key={p.url}>
                  <Td className="text-xs text-slate-400 w-8">{i + 1}</Td>
                  <Td>
                    <p className="text-sm font-medium text-slate-800">{p.title}</p>
                    <p className="text-xs text-blue-600 font-mono mt-0.5">{p.url}</p>
                  </Td>
                  <Td className="font-semibold text-sm">{p.visits.toLocaleString()}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full">
                        <div
                          className="h-1.5 bg-blue-500 rounded-full"
                          style={{ width: `${totalViews > 0 ? (p.visits / totalViews) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">
                        {totalViews > 0 ? ((p.visits / totalViews) * 100).toFixed(1) : "0"}%
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <span className="flex items-center gap-1 text-xs text-slate-600">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {p.avgTime}
                    </span>
                  </Td>
                  <Td>
                    <span className={cn(
                      "text-xs font-semibold",
                      p.bounceRate > 40 ? "text-red-500" : p.bounceRate > 30 ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {p.bounceRate}%
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {p.mainSource}
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
