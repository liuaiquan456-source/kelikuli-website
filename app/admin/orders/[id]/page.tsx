"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, User, MapPin, Mail, ChevronDown } from "lucide-react";
import { Button, Badge, Card, CardHeader, CardTitle, CardBody, Table, Th, Td, Tr } from "@/app/admin/_components/ui";
import { mockOrders, type Order, type OrderItem } from "@/app/admin/_data/mock";
import { cn } from "@/app/admin/_lib/utils";

const ORDER_STATUS_MAP: Record<Order["status"], { label: string; variant: "green"|"blue"|"yellow"|"gray"|"red" }> = {
  confirmed:  { label: "Confirmed",  variant: "green"  },
  processing: { label: "Processing", variant: "blue"   },
  shipped:    { label: "Shipped",    variant: "green"  },
  pending:    { label: "Pending",    variant: "yellow" },
  cancelled:  { label: "Cancelled",  variant: "red"    },
};

const ITEM_STATUS_MAP: Record<OrderItem["status"], { label: string; color: string }> = {
  pending:       { label: "Pending",       color: "bg-yellow-100 text-yellow-700" },
  confirmed:     { label: "Confirmed",     color: "bg-blue-100 text-blue-700"    },
  sourcing:      { label: "Sourcing",      color: "bg-purple-100 text-purple-700" },
  in_stock:      { label: "In Stock",      color: "bg-emerald-100 text-emerald-700" },
  out_of_stock:  { label: "Out of Stock",  color: "bg-red-100 text-red-700"      },
  in_production: { label: "In Production", color: "bg-orange-100 text-orange-700" },
  cancelled:     { label: "Cancelled",     color: "bg-slate-100 text-slate-600"  },
  shipped:       { label: "Shipped",       color: "bg-green-100 text-green-700"  },
};

const ITEM_STATUSES = Object.keys(ITEM_STATUS_MAP) as OrderItem["status"][];

export default function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const order = mockOrders.find((o) => o.id === id);

  const [items, setItems] = useState(order?.items ?? []);

  if (!order) return (
    <div className="text-center py-20 text-slate-400">
      <p>Order not found.</p>
      <Link href="/admin/orders" className="text-blue-600 hover:underline text-sm mt-2 inline-block">← Back to Orders</Link>
    </div>
  );

  const updateItemStatus = (itemId: number, status: OrderItem["status"]) => {
    setItems((prev) => prev.map((it) => it.id === itemId ? { ...it, status } : it));
  };

  const { label: orderLabel, variant: orderVariant } = ORDER_STATUS_MAP[order.status];

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Orders
        </Link>
        <Badge label={orderLabel} variant={orderVariant} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Customer</p>
              <p className="text-sm font-semibold text-slate-800">{order.customer}</p>
              <p className="text-xs text-slate-500">{order.company}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Country</p>
              <p className="text-sm font-semibold text-slate-800">{order.country}</p>
              <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Contact</p>
              <p className="text-sm font-semibold text-slate-800">{order.email}</p>
              <p className="text-xs text-slate-500">{order.currency} · ${order.total.toLocaleString()}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-500" />
            <CardTitle>Order Items — {order.id}</CardTitle>
          </div>
          <span className="text-sm font-bold text-slate-800">
            Total: ${order.total.toLocaleString()}
          </span>
        </CardHeader>
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Product</Th>
              <Th>Category</Th>
              <Th>Qty</Th>
              <Th>Unit Price</Th>
              <Th>Subtotal</Th>
              <Th>Status</Th>
              <Th>Notes</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const { color, label } = ITEM_STATUS_MAP[item.status];
              return (
                <Tr key={item.id}>
                  <Td className="text-xs text-slate-400">{item.id}</Td>
                  <Td>
                    <p className="text-sm font-medium text-slate-800 max-w-xs">{item.productName}</p>
                  </Td>
                  <Td>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{item.category}</span>
                  </Td>
                  <Td className="text-sm font-semibold">{item.qty.toLocaleString()}</Td>
                  <Td className="text-sm">${item.unitPrice.toFixed(2)}</Td>
                  <Td className="text-sm font-semibold">${item.total.toLocaleString()}</Td>
                  <Td>
                    <div className="relative">
                      <select
                        value={item.status}
                        onChange={(e) => updateItemStatus(item.id, e.target.value as OrderItem["status"])}
                        className={cn(
                          "appearance-none text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer pr-6",
                          "focus:outline-none focus:ring-2 focus:ring-blue-400/40",
                          color
                        )}
                      >
                        {ITEM_STATUSES.map((s) => (
                          <option key={s} value={s}>{ITEM_STATUS_MAP[s].label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                    </div>
                  </Td>
                  <Td className="text-xs text-slate-400 max-w-[120px] truncate">{item.notes || "—"}</Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end">
          <div className="text-right space-y-1">
            <div className="flex items-center gap-8 text-sm">
              <span className="text-slate-500">Subtotal ({items.reduce((s, i) => s + i.qty, 0).toLocaleString()} pcs)</span>
              <span className="font-semibold text-slate-800">${items.reduce((s, i) => s + i.total, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary">Export PDF</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
