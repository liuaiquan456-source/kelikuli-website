"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Inbox, Mail, MailOpen, CheckCheck, Trash2, RefreshCw, ChevronDown, ChevronUp,
  User, Building2, Phone, Tag, Calendar, MessageSquare,
} from "lucide-react";
import { Card, CardHeader, CardTitle, Badge, Button } from "@/app/admin/_components/ui";
import { cn } from "@/app/admin/_lib/utils";

interface Inquiry {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  product: string;
  message: string;
  status: "unread" | "read" | "replied";
  notes: string;
  createdAt: string;
}

type Tab = "all" | "unread" | "read" | "replied";

function statusBadge(s: string) {
  const map: Record<string, { label: string; variant: "red" | "blue" | "green" | "gray" }> = {
    unread:  { label: "Unread",  variant: "red" },
    read:    { label: "Read",    variant: "blue" },
    replied: { label: "Replied", variant: "green" },
  };
  const m = map[s] ?? { label: s, variant: "gray" };
  return <Badge label={m.label} variant={m.variant} />;
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries");
      const data = await res.json();
      setInquiries(data.inquiries ?? []);
      setTotal(data.total ?? 0);
      setUnreadCount(data.unread ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const patch = async (id: number, body: Partial<Inquiry>) => {
    await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, ...body } : i));
    setUnreadCount((prev) => {
      const inq = inquiries.find((i) => i.id === id);
      if (inq?.status === "unread" && body.status && body.status !== "unread") return Math.max(0, prev - 1);
      return prev;
    });
  };

  const remove = async (id: number) => {
    setDeleting(id);
    await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
    const removed = inquiries.find((i) => i.id === id);
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    setTotal((t) => t - 1);
    if (removed?.status === "unread") setUnreadCount((c) => Math.max(0, c - 1));
    if (expanded === id) setExpanded(null);
    setDeleting(null);
  };

  const toggle = async (id: number) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    const inq = inquiries.find((i) => i.id === id);
    if (inq?.status === "unread") await patch(id, { status: "read" });
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "all",     label: "All",     count: total },
    { key: "unread",  label: "Unread",  count: unreadCount },
    { key: "read",    label: "Read" },
    { key: "replied", label: "Replied" },
  ];

  const filtered = tab === "all" ? inquiries : inquiries.filter((i) => i.status === tab);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
            <Inbox className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Customer Inquiries</h2>
            <p className="text-xs text-slate-400">{total} total · {unreadCount} unread</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchInquiries} disabled={loading}>
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: total,       color: "bg-slate-100 text-slate-600" },
          { label: "Unread", value: unreadCount, color: "bg-red-100 text-red-600" },
          { label: "Replied", value: inquiries.filter(i => i.status === "replied").length, color: "bg-green-100 text-green-600" },
        ].map((s) => (
          <Card key={s.label}>
            <div className="p-4 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0", s.color)}>
                {s.value}
              </div>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* List */}
      <Card>
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "px-5 py-3 text-xs font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5",
                tab === t.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={cn(
                  "inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold",
                  t.key === "unread" ? "bg-red-500 text-white" : "bg-slate-200 text-slate-600"
                )}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No inquiries yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((inq) => (
              <div key={inq.id} className={cn("transition-colors", inq.status === "unread" && "bg-blue-50/40")}>
                {/* Row summary */}
                <div
                  className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggle(inq.id)}
                >
                  <div className="shrink-0 text-slate-400">
                    {inq.status === "unread"
                      ? <Mail className="w-4 h-4 text-blue-500" />
                      : inq.status === "replied"
                      ? <CheckCheck className="w-4 h-4 text-green-500" />
                      : <MailOpen className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-medium truncate", inq.status === "unread" ? "text-slate-900" : "text-slate-700")}>
                        {inq.name}
                      </span>
                      {inq.company && <span className="text-xs text-slate-400 truncate hidden sm:inline">· {inq.company}</span>}
                      {statusBadge(inq.status)}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-400 truncate">{inq.email}</span>
                      {inq.product && <span className="text-xs text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md truncate hidden md:inline">{inq.product}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-400 hidden lg:inline">
                      {new Date(inq.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                    {expanded === inq.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded === inq.id && (
                  <div className="px-5 pb-5 bg-white border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
                      {[
                        { icon: <User className="w-3.5 h-3.5" />, label: "Name", value: inq.name },
                        { icon: <Mail className="w-3.5 h-3.5" />, label: "Email", value: inq.email },
                        { icon: <Building2 className="w-3.5 h-3.5" />, label: "Company", value: inq.company || "—" },
                        { icon: <Phone className="w-3.5 h-3.5" />, label: "Phone", value: inq.phone || "—" },
                        { icon: <Tag className="w-3.5 h-3.5" />, label: "Product Interest", value: inq.product || "—" },
                        { icon: <Calendar className="w-3.5 h-3.5" />, label: "Submitted", value: new Date(inq.createdAt).toLocaleString() },
                      ].map((field) => (
                        <div key={field.label} className="flex items-start gap-2">
                          <span className="text-slate-400 mt-0.5 shrink-0">{field.icon}</span>
                          <div>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{field.label}</p>
                            <p className="text-sm text-slate-700">{field.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 mb-4">
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" /> Message
                      </p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{inq.message}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {inq.status !== "replied" && (
                        <Button size="sm" variant="primary" onClick={() => patch(inq.id, { status: "replied" })}>
                          <CheckCheck className="w-3.5 h-3.5" />
                          Mark Replied
                        </Button>
                      )}
                      {inq.status === "unread" && (
                        <Button size="sm" variant="secondary" onClick={() => patch(inq.id, { status: "read" })}>
                          <MailOpen className="w-3.5 h-3.5" />
                          Mark Read
                        </Button>
                      )}
                      {inq.status !== "unread" && (
                        <Button size="sm" variant="ghost" onClick={() => patch(inq.id, { status: "unread" })}>
                          <Mail className="w-3.5 h-3.5" />
                          Mark Unread
                        </Button>
                      )}
                      <a
                        href={`mailto:${inq.email}?subject=Re: Your inquiry about ${encodeURIComponent(inq.product || "Kelikuli Products")}`}
                        className="inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors px-3 py-1.5 text-xs bg-orange-50 text-orange-600 hover:bg-orange-100"
                        onClick={() => { if (inq.status !== "replied") patch(inq.id, { status: "replied" }); }}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Reply by Email
                      </a>
                      <Button
                        size="sm" variant="danger"
                        disabled={deleting === inq.id}
                        onClick={() => remove(inq.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deleting === inq.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
