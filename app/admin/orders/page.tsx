"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { Button, Badge, Card, Table, Th, Td, Tr } from "@/app/admin/_components/ui";
import { mockOrders, type Order } from "@/app/admin/_data/mock";

const STATUS_MAP: Record<Order["status"], { label: string; variant: "green"|"blue"|"yellow"|"gray"|"red" }> = {
  confirmed:  { label: "Confirmed",  variant: "green"  },
  processing: { label: "Processing", variant: "blue"   },
  shipped:    { label: "Shipped",    variant: "green"  },
  pending:    { label: "Pending",    variant: "yellow" },
  cancelled:  { label: "Cancelled",  variant: "red"    },
};

export default function OrderList() {
  const [orders] = useState(mockOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.company.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = filtered.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer or company..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-400"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400">
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {(["pending","confirmed","processing","shipped","cancelled"] as Order["status"][]).map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          const { label, variant } = STATUS_MAP[s];
          return (
            <Card key={s}>
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-slate-800">{count}</p>
                <Badge label={label} variant={variant} />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span>Showing <strong className="text-slate-800">{filtered.length}</strong> orders</span>
        <span>Total Value: <strong className="text-slate-800">${total.toLocaleString()}</strong></span>
      </div>

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Order ID</Th><Th>Customer</Th><Th>Country</Th>
              <Th>Items</Th><Th>Total</Th><Th>Status</Th><Th>Date</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const { label, variant } = STATUS_MAP[o.status];
              return (
                <Tr key={o.id}>
                  <Td><span className="font-mono text-xs text-blue-600">{o.id}</span></Td>
                  <Td>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{o.customer}</p>
                      <p className="text-xs text-slate-400">{o.company}</p>
                    </div>
                  </Td>
                  <Td className="text-sm">{o.country}</Td>
                  <Td className="text-sm text-center">{o.items.length}</Td>
                  <Td className="font-semibold text-sm">${o.total.toLocaleString()}</Td>
                  <Td><Badge label={label} variant={variant} /></Td>
                  <Td className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <Link href={`/admin/orders/${o.id}`}>
                      <Button variant="ghost" size="sm"><Eye className="w-3.5 h-3.5" />View</Button>
                    </Link>
                  </Td>
                </Tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">No orders found.</td></tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
