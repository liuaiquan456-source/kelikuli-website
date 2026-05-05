"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Package, ShoppingCart, Inbox } from "lucide-react";
import { Card, CardHeader, CardTitle, StatCard, Badge, Table, Th, Td, Tr } from "@/app/admin/_components/ui";

interface Order {
  id: string; customer: string; company: string; country: string;
  total: number; status: string; createdAt: string;
}

function orderBadge(status: string) {
  const map: Record<string, { label: string; variant: "green"|"blue"|"yellow"|"gray"|"red" }> = {
    confirmed:  { label: "Confirmed",  variant: "green"  },
    processing: { label: "Processing", variant: "blue"   },
    shipped:    { label: "Shipped",    variant: "green"  },
    pending:    { label: "Pending",    variant: "yellow" },
    cancelled:  { label: "Cancelled",  variant: "red"    },
  };
  const m = map[status] ?? { label: status, variant: "gray" };
  return <Badge label={m.label} variant={m.variant} />;
}

export default function Dashboard() {
  const [productCount,    setProductCount]    = useState<number | null>(null);
  const [orderCount,      setOrderCount]      = useState<number | null>(null);
  const [unreadInquiries, setUnreadInquiries] = useState<number | null>(null);
  const [recentOrders,    setRecentOrders]    = useState<Order[]>([]);

  const fetchData = useCallback(async () => {
    const [pRes, oRes, iRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/orders"),
      fetch("/api/inquiries"),
    ]);
    const [pData, oData, iData] = await Promise.all([
      pRes.json(), oRes.json(), iRes.json(),
    ]);
    setProductCount((pData.products ?? pData).length ?? 0);
    const orders: Order[] = oData.orders ?? oData ?? [];
    setOrderCount(orders.length);
    setRecentOrders(orders.slice(0, 6));
    setUnreadInquiries(iData.unread ?? 0);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmt = (n: number | null) => n === null ? "—" : n.toLocaleString();

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Products" value={fmt(productCount)} color="blue"
          icon={<Package className="w-6 h-6" />}
        />
        <StatCard
          title="Total Orders" value={fmt(orderCount)} color="green"
          icon={<ShoppingCart className="w-6 h-6" />}
        />
        <Link href="/admin/inquiries">
          <StatCard
            title="New Inquiries" value={fmt(unreadInquiries)} color="orange"
            icon={<Inbox className="w-6 h-6" />} change="Unread messages"
          />
        </Link>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-slate-500" />
            <CardTitle>Recent Orders</CardTitle>
          </div>
          <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline">View all</Link>
        </CardHeader>
        {recentOrders.length === 0 ? (
          <div className="py-14 text-center text-slate-400 text-sm">No orders yet</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Order ID</Th><Th>Customer</Th><Th>Country</Th>
                <Th>Amount</Th><Th>Status</Th><Th>Date</Th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <Tr key={o.id}>
                  <Td>
                    <Link href={`/admin/orders/${o.id}`} className="font-mono text-blue-600 hover:underline text-xs">
                      {o.id}
                    </Link>
                  </Td>
                  <Td>
                    <p className="text-xs font-medium text-slate-800">{o.customer}</p>
                    <p className="text-[10px] text-slate-400">{o.company}</p>
                  </Td>
                  <Td className="text-xs">{o.country}</Td>
                  <Td className="font-semibold text-xs">${o.total.toLocaleString()}</Td>
                  <Td>{orderBadge(o.status)}</Td>
                  <Td className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
