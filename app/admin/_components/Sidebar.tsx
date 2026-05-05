"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, BarChart2, Users, Settings,
  ChevronDown, ChevronRight, Globe, Search, FileText, Wifi,
  PlusCircle, List, LogOut, Inbox, Newspaper,
} from "lucide-react";
import { cn } from "@/app/admin/_lib/utils";

interface NavItem {
  label: string; href?: string; icon: React.ReactNode;
  badge?: number;
  children?: { label: string; href: string; icon: React.ReactNode }[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = useState<string[]>(["Products", "Analytics"]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/inquiries");
        const data = await res.json();
        setUnread(data.unread ?? 0);
      } catch { /* silent */ }
    };
    fetchUnread();
    const timer = setInterval(fetchUnread, 60_000);
    return () => clearInterval(timer);
  }, []);

  const navItems: NavItem[] = [
    { label: "Dashboard",   href: "/admin/dashboard",   icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      label: "Products", icon: <Package className="w-4 h-4" />,
      children: [
        { label: "Product List", href: "/admin/products",     icon: <List className="w-3.5 h-3.5" /> },
        { label: "Add Product",  href: "/admin/products/new", icon: <PlusCircle className="w-3.5 h-3.5" /> },
      ],
    },
    {
      label: "News", icon: <Newspaper className="w-4 h-4" />,
      children: [
        { label: "All Articles", href: "/admin/news",     icon: <List className="w-3.5 h-3.5" /> },
        { label: "New Article",  href: "/admin/news/new", icon: <PlusCircle className="w-3.5 h-3.5" /> },
      ],
    },
    { label: "Inquiries",  href: "/admin/inquiries",   icon: <Inbox className="w-4 h-4" />, badge: unread },
    {
      label: "Analytics", icon: <BarChart2 className="w-4 h-4" />,
      children: [
        { label: "Traffic Sources", href: "/admin/analytics/sources",  icon: <Globe className="w-3.5 h-3.5" /> },
        { label: "Keywords",        href: "/admin/analytics/keywords", icon: <Search className="w-3.5 h-3.5" /> },
        { label: "Page Views",      href: "/admin/analytics/pages",    icon: <FileText className="w-3.5 h-3.5" /> },
        { label: "IP Logs",         href: "/admin/analytics/ip-logs",  icon: <Wifi className="w-3.5 h-3.5" /> },
      ],
    },
    { label: "Users",    href: "/admin/users",    icon: <Users className="w-4 h-4" /> },
    { label: "Settings", href: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const toggle = (label: string) => {
    setOpen((prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-[#0F172A] h-full border-r border-slate-700/50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-700/50 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#C9A55A] flex items-center justify-center">
          <span className="text-white font-black text-xs">KK</span>
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">Kelikuli</p>
          <p className="text-slate-400 text-[10px] mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map((item) => {
          if (item.children) {
            const isOpenMenu = open.includes(item.label);
            const anyChildActive = item.children.some((c) => isActive(c.href));
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggle(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5",
                    anyChildActive ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  )}
                >
                  <span className={anyChildActive ? "text-[#C9A55A]" : ""}>{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {isOpenMenu ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                {isOpenMenu && (
                  <div className="ml-4 pl-3 border-l border-slate-700 mb-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-0.5",
                          isActive(child.href)
                            ? "bg-blue-600/20 text-blue-400"
                            : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                        )}
                      >
                        {child.icon}
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5",
                isActive(item.href!)
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              <span className={isActive(item.href!) ? "text-blue-400" : ""}>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-red-500 text-white">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700/50 shrink-0 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#C9A55A] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">KK</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">Admin Master</p>
            <p className="text-slate-500 text-[10px] truncate">admin@kelikuli.com</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-colors py-1.5 rounded-lg hover:bg-slate-800"
          >
            <LogOut className="w-3.5 h-3.5 rotate-180" />
            Website
          </Link>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-1.5 text-red-400 hover:text-red-300 text-xs transition-colors py-1.5 rounded-lg hover:bg-slate-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
