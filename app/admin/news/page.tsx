"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Newspaper, Plus, RefreshCw, Globe, EyeOff, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, Badge, Button, Table, Th, Td, Tr } from "@/app/admin/_components/ui";
import { cn } from "@/app/admin/_lib/utils";

interface Post {
  id: number; slug: string; title: string; category: string;
  excerpt: string; image: string; status: string; publishedAt: string | null; createdAt: string;
}

type Tab = "all" | "published" | "draft";

function statusBadge(s: string) {
  return s === "published"
    ? <Badge label="Published" variant="green" />
    : <Badge label="Draft" variant="gray" />;
}

export default function NewsAdminPage() {
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<Tab>("all");
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts");
      const d   = await res.json();
      setPosts(d.posts ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const toggleStatus = async (post: Post) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    await fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, status: newStatus } : p));
  };

  const remove = async (id: number) => {
    setDeleting(id);
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all",       label: "All",       count: posts.length },
    { key: "published", label: "Published", count: posts.filter((p) => p.status === "published").length },
    { key: "draft",     label: "Draft",     count: posts.filter((p) => p.status === "draft").length },
  ];

  const filtered = tab === "all" ? posts : posts.filter((p) => p.status === tab);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">News Articles</h2>
            <p className="text-xs text-slate-400">{posts.length} total · {posts.filter(p => p.status === "published").length} published</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={fetchPosts} disabled={loading}>
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
          <Link href="/admin/news/new">
            <Button variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5" />
              New Article
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total",     value: posts.length,                                        color: "bg-slate-100 text-slate-600" },
          { label: "Published", value: posts.filter(p => p.status === "published").length,  color: "bg-emerald-100 text-emerald-600" },
          { label: "Draft",     value: posts.filter(p => p.status === "draft").length,      color: "bg-orange-100 text-orange-500" },
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
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn(
                "px-5 py-3 text-xs font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5",
                tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
              )}>
              {t.label}
              <span className={cn(
                "inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold",
                tab === t.key ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
              )}>{t.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Newspaper className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No articles yet</p>
            <Link href="/admin/news/new" className="mt-3 inline-flex items-center gap-1 text-blue-600 hover:underline text-sm">
              <Plus className="w-3.5 h-3.5" /> Write your first article
            </Link>
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th>Published</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <Tr key={post.id}>
                  <Td>
                    <div>
                      <p className="text-sm font-medium text-slate-800 line-clamp-1">{post.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">/news/{post.slug}</p>
                    </div>
                  </Td>
                  <Td>
                    <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                      {post.category}
                    </span>
                  </Td>
                  <Td>{statusBadge(post.status)}</Td>
                  <Td className="text-xs text-slate-400">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      {/* Toggle publish */}
                      <button
                        onClick={() => toggleStatus(post)}
                        title={post.status === "published" ? "Unpublish" : "Publish"}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          post.status === "published"
                            ? "text-emerald-600 hover:bg-emerald-50"
                            : "text-slate-400 hover:bg-slate-100"
                        )}
                      >
                        {post.status === "published" ? <Globe className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      {/* Edit */}
                      <Link href={`/admin/news/${post.id}/edit`}>
                        <button className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      {/* View on site */}
                      {post.status === "published" && (
                        <Link href={`/news/${post.slug}`} target="_blank">
                          <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      )}
                      {/* Delete */}
                      <button
                        onClick={() => remove(post.id)}
                        disabled={deleting === post.id}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
