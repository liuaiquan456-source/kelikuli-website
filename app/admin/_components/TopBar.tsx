"use client";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { useEffect, useState } from "react";

const titles: Record<string, string> = {
  "/admin/dashboard":           "Dashboard",
  "/admin/products":            "Products",
  "/admin/products/new":        "Add Product",
  "/admin/news":                "News Articles",
  "/admin/news/new":            "New Article",
  "/admin/inquiries":           "Customer Inquiries",
  "/admin/analytics/sources":   "Traffic Sources",
  "/admin/analytics/keywords":  "Keyword Analysis",
  "/admin/analytics/pages":     "Page Views",
  "/admin/analytics/ip-logs":   "IP Access Logs",
  "/admin/users":               "User Management",
  "/admin/settings":            "System Settings",
};

export default function TopBar() {
  const pathname = usePathname();
  const router   = useRouter();
  const isProductEdit = pathname.includes("/products/") && pathname.includes("/edit");
  const isNewsEdit    = pathname.includes("/news/") && pathname.includes("/edit");
  const title = isProductEdit ? "Edit Product"
              : isNewsEdit    ? "Edit Article"
              : (titles[pathname] ?? "Admin");

  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res  = await fetch("/api/inquiries");
        const data = await res.json();
        setUnread(data.unread ?? 0);
      } catch { /* silent */ }
    };
    fetchUnread();
    const timer = setInterval(fetchUnread, 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-base font-semibold text-slate-800">{title}</h1>
        <p className="text-xs text-slate-400">kelikuli.com management panel</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-48 pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
          />
        </div>
        <button
          onClick={() => router.push("/admin/inquiries")}
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title={unread > 0 ? `${unread} unread inquiry` : "Inquiries"}
        >
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center leading-none">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">AD</span>
        </div>
      </div>
    </header>
  );
}
