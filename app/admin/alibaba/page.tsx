"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, CardBody, CardHeader, CardTitle, Input } from "@/app/admin/_components/ui";
interface Connection { configured: boolean; connected: boolean; appKey: string; account: string; autoEnabled: boolean; expiresAt: number | null; callbackUrl: string }
export default function AlibabaConnectionPage() {
  const [status, setStatus] = useState<Connection | null>(null), [appKey, setAppKey] = useState("516026"), [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  async function refresh() {
    const res = await fetch("/api/integrations/alibaba/connection");
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "无法读取连接状态，请先登录后台。");
    setStatus(body); if (body.appKey) setAppKey(body.appKey);
  }
  useEffect(() => { refresh().catch(e => setMessage(e.message));
    const result = new URLSearchParams(location.search).get("result");
    if (result) { setMessage(result === "connected" ? "店铺授权和商品查询验证成功。" : result === "authorized" ? "授权已保存，请点击验证连接查看接口权限。" : "授权未完成，请确认回调地址后重新连接。"); history.replaceState(null, "", "/admin/alibaba"); }
  }, []);
  async function action(action: string, extra: Record<string, unknown> = {}) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/integrations/alibaba/connection", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...extra }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "操作失败。");
      if (data.url) { location.assign(data.url); return; }
      if (action === "configure") setSecret("");
      await refresh(); setMessage(action === "verify" ? "连接验证成功，可以读取商品和发布类目规则。" : "设置已保存。");
    } catch (e) { setMessage(e instanceof Error ? e.message : "操作失败。"); }
    finally { setBusy(false); }
  }
  return <div className="max-w-3xl mx-auto space-y-5">
    <div><h1 className="text-2xl font-bold">国际站自动发布</h1><p className="mt-2 text-slate-600">连接店铺后，已审核且勾选自动发布的产品会在保存时提交国际站审核。缺少资料时保留在官网并提示补充。</p></div>
    <Card><CardHeader><CardTitle>店铺连接</CardTitle></CardHeader><CardBody className="space-y-4">
      <p className={status?.connected ? "text-emerald-700" : "text-amber-700"}>{status?.connected ? `已连接：${status.account}` : status?.configured ? "应用配置已保存，等待授权或验证。" : "尚未配置国际站应用。"}</p>
      {status?.expiresAt && <p className="text-sm text-slate-500">授权有效期至 {new Date(status.expiresAt).toLocaleString()}；服务器在可续期时自动更新。</p>}
      <Input label="App Key" value={appKey} onChange={e => setAppKey(e.target.value)} autoComplete="off" />
      <Input label={status?.configured ? "App Secret（仅更换应用时填写）" : "App Secret"} type="password" value={secret} onChange={e => setSecret(e.target.value)} autoComplete="new-password" />
      <p className="text-xs text-slate-500">密钥仅加密保存在官网服务器，不会传给 GPT 或显示在商品页面。重新保存应用配置会清除此连接中的旧授权。</p>
      <Button disabled={busy || !secret} onClick={() => action("configure", { appKey, appSecret: secret })}>保存应用配置</Button>
      <div className="rounded-lg bg-slate-50 p-4 space-y-2 text-sm"><p>请将国际站应用的回调地址配置为：</p><p className="break-all font-mono">https://kelikuli.com/api/integrations/alibaba/callback</p><p>保存回调地址后，点击连接店铺完成授权。无需手动复制 Token。</p></div>
      <div className="flex gap-3"><Button disabled={busy || !status?.configured} onClick={() => action("authorize")}>连接 / 重新授权店铺</Button><Button variant="outline" disabled={busy || !status?.configured} onClick={() => action("verify")}>验证连接</Button></div>
    </CardBody></Card>
    <Card><CardHeader><CardTitle>自动提交审核</CardTitle></CardHeader><CardBody className="space-y-4">
      <label className="flex gap-2"><input type="checkbox" checked={status?.autoEnabled ?? false} disabled={busy || !status?.connected} onChange={e => action("automatic", { enabled: e.target.checked })} />启用自动发布</label>
      <p className="text-sm text-slate-600">每款产品还需在编辑页确认资料并勾选“自动提交国际站审核”。只提交一次；国际站返回商品编号后不会重复新建。审核通过时间由国际站决定。</p>
      <Link href="/admin/products" className="text-blue-600 underline">打开产品列表</Link>
    </CardBody></Card>
    {message && <p role="status" className="rounded-lg border bg-white p-4 text-sm">{message}</p>}
  </div>;
}
