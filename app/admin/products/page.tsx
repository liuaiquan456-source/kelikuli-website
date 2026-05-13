"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, Download, Package, CheckSquare, RefreshCw } from "lucide-react";
import { Button, Badge, Card, Modal, Table, Th, Td, Tr } from "@/app/admin/_components/ui";
import { CATEGORIES } from "@/app/admin/_data/mock";
import { cn } from "@/app/admin/_lib/utils";

interface Product {
  id: number; name: string; category: string; price: number; stock: number;
  moq: number; leadTime: string; status: string; image: string;
  tags: string[]; createdAt: string;
}

type SortKey = "name" | "price" | "stock" | "createdAt";
type SortDir = "asc" | "desc";

function SortIcon({ col, sortKey, dir }: { col: SortKey; sortKey: SortKey; dir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline" />;
  return dir === "asc"
    ? <ArrowUp className="w-3 h-3 text-blue-500 ml-1 inline" />
    : <ArrowDown className="w-3 h-3 text-blue-500 ml-1 inline" />;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat    = catFilter    === "All" || p.category === catFilter;
      const matchStatus = statusFilter === "All" || p.status   === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
    return list.sort((a, b) => {
      let va: string | number = a[sortKey];
      let vb: string | number = b[sortKey];
      if (sortKey === "name") { va = (va as string).toLowerCase(); vb = (vb as string).toLowerCase(); }
      if (sortDir === "asc") return va < vb ? -1 : va > vb ? 1 : 0;
      return va > vb ? -1 : va < vb ? 1 : 0;
    });
  }, [products, search, catFilter, statusFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const allChecked = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const toggleAll  = () => { if (allChecked) setSelected(new Set()); else setSelected(new Set(filtered.map((p) => p.id))); };
  const toggleOne  = (id: number) => { const next = new Set(selected); next.has(id) ? next.delete(id) : next.add(id); setSelected(next); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setSelected((prev) => { const next = new Set(prev); next.delete(deleteTarget.id); return next; });
    setDeleteTarget(null);
  };

  const handleBulkDelete = async () => {
    await Promise.all([...selected].map((id) => fetch(`/api/products/${id}`, { method: "DELETE" })));
    setProducts((prev) => prev.filter((p) => !selected.has(p.id)));
    setSelected(new Set());
    setBulkDeleteOpen(false);
  };

  const handleBulkStatus = async (status: "active" | "inactive") => {
    await Promise.all([...selected].map((id) =>
      fetch(`/api/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
    ));
    setProducts((prev) => prev.map((p) => selected.has(p.id) ? { ...p, status } : p));
    setSelected(new Set());
  };

  const toggleStatus = async (p: Product) => {
    const status = p.status === "active" ? "inactive" : "active";
    await fetch(`/api/products/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, status } : x));
  };

  const outOfStock  = products.filter((p) => p.stock === 0).length;
  const lowStock    = products.filter((p) => p.stock > 0 && p.stock < 20).length;
  const totalValue  = products.reduce((s, p) => s + p.price * p.stock, 0);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Products",  value: products.length, color: "bg-blue-100 text-blue-600",   icon: <Package className="w-5 h-5" /> },
          { label: "Active",          value: products.filter(p=>p.status==="active").length, color: "bg-emerald-100 text-emerald-600", icon: <CheckSquare className="w-5 h-5" /> },
          { label: "Out of Stock",    value: outOfStock,      color: "bg-red-100 text-red-600",    icon: <Package className="w-5 h-5" /> },
          { label: "Low Stock (<20)", value: lowStock,        color: "bg-amber-100 text-amber-600", icon: <Package className="w-5 h-5" /> },
        ].map(({ label, value, color, icon }) => (
          <Card key={label}>
            <div className="flex items-center gap-3 p-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", color)}>{icon}</div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-800">{loading ? "—" : value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-400" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400">
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400">
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <Button variant="secondary" onClick={fetchProducts}><RefreshCw className="w-4 h-4" />Refresh</Button>
        <Button variant="secondary"><Download className="w-4 h-4" />Export CSV</Button>
        <Link href="/admin/products/new"><Button><Plus className="w-4 h-4" />Add Product</Button></Link>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-sm font-medium text-blue-700">{selected.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="secondary" onClick={() => handleBulkStatus("active")}>Set Active</Button>
            <Button size="sm" variant="secondary" onClick={() => handleBulkStatus("inactive")}>Set Inactive</Button>
            <Button size="sm" variant="danger" onClick={() => setBulkDeleteOpen(true)}>Delete Selected</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span>Showing: <strong className="text-slate-800">{filtered.length}</strong> products</span>
        <span>Inventory Value: <strong className="text-slate-800">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></span>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading products from database...</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th className="w-10">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                </Th>
                <Th><button onClick={() => toggleSort("name")} className="flex items-center uppercase tracking-wider text-xs font-semibold hover:text-slate-700">Product <SortIcon col="name" sortKey={sortKey} dir={sortDir} /></button></Th>
                <Th>Category</Th>
                <Th><button onClick={() => toggleSort("price")} className="flex items-center uppercase tracking-wider text-xs font-semibold hover:text-slate-700">Price <SortIcon col="price" sortKey={sortKey} dir={sortDir} /></button></Th>
                <Th><button onClick={() => toggleSort("stock")} className="flex items-center uppercase tracking-wider text-xs font-semibold hover:text-slate-700">Stock <SortIcon col="stock" sortKey={sortKey} dir={sortDir} /></button></Th>
                <Th>Status</Th>
                <Th><button onClick={() => toggleSort("createdAt")} className="flex items-center uppercase tracking-wider text-xs font-semibold hover:text-slate-700">Created <SortIcon col="createdAt" sortKey={sortKey} dir={sortDir} /></button></Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <Tr key={p.id} className={selected.has(p.id) ? "bg-blue-50/60" : ""}>
                  <Td><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" /></Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {p.image
                          ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          : null}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 line-clamp-1">{p.name}</p>
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {p.tags.slice(0, 2).map((t) => <span key={t} className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded">#{t}</span>)}
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td><Badge label={p.category} variant="blue" /></Td>
                  <Td className="font-semibold text-sm">${p.price.toFixed(2)}</Td>
                  <Td>
                    <span className={cn("text-sm font-semibold",
                      p.stock === 0 ? "text-red-500" : p.stock < 20 ? "text-amber-600" : "text-slate-700"
                    )}>
                      {p.stock === 0 ? "Out of stock" : p.stock}
                    </span>
                  </Td>
                  <Td>
                    <button onClick={() => toggleStatus(p)} title="Click to toggle status"
                      className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors cursor-pointer",
                        p.status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                      )}>
                      {p.status === "active" ? "● Active" : "○ Inactive"}
                    </button>
                  </Td>
                  <Td className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/products/${p.id}`} target="_blank"><Button variant="ghost" size="sm"><Eye className="w-3.5 h-3.5" /></Button></Link>
                      <Link href={`/admin/products/${p.id}/edit`}><Button variant="ghost" size="sm"><Pencil className="w-3.5 h-3.5" /></Button></Link>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(p)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
                    </div>
                  </Td>
                </Tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">No products found.</td></tr>
              )}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product">
        <p className="text-sm text-slate-600 mb-4">Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      <Modal open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} title="Bulk Delete">
        <p className="text-sm text-slate-600 mb-4">Delete <strong>{selected.size}</strong> selected products? This cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleBulkDelete}>Delete All Selected</Button>
        </div>
      </Modal>
    </div>
  );
}
