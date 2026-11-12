"use client";
import { useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader, CardTitle, Input } from "@/app/admin/_components/ui";
import { readAlibabaListing, type AlibabaListing } from "@/lib/alibaba-listing";
import AlibabaListingFields from "./_alibaba-listing-fields";

export interface AlibabaForm {
  sku: string; alibabaCategoryId: string; alibabaDimensions: string;
  alibabaPriceTiers: { minQuantity: string; unitPrice: string }[];
  alibabaSyncEnabled: boolean;
  alibabaListing: AlibabaListing;
}

export function initialAlibabaForm(product?: {
  sku?: string | null; alibabaCategoryId?: string; alibabaDimensions?: string;
  alibabaPriceTiers?: string; alibabaSyncEnabled?: boolean;
  alibabaListing?: string;
}): AlibabaForm {
  let tiers: AlibabaForm["alibabaPriceTiers"] = [];
  try {
    const parsed: unknown = JSON.parse(product?.alibabaPriceTiers ?? "[]");
    if (Array.isArray(parsed)) tiers = parsed.map(p => ({ minQuantity: String(p.minQuantity), unitPrice: String(p.unitPrice) }));
  } catch { /* allow correction of historical malformed data */ }
  return { sku: product?.sku ?? "", alibabaCategoryId: product?.alibabaCategoryId ?? "",
    alibabaDimensions: product?.alibabaDimensions ?? "", alibabaPriceTiers: tiers,
    alibabaSyncEnabled: product?.alibabaSyncEnabled ?? false, alibabaListing: readAlibabaListing(product?.alibabaListing) };
}

interface DraftStatus {
  approved: boolean; autoEnabled: boolean; connectionConfigured: boolean;
  missingFields: { field: string; message: string }[];
  record: { status: string; productId?: string; message: string; changedSinceSync: boolean } | null;
}

export default function AlibabaDraftPanel({ value, onChange, approved, onApprove, savedSku, revision, busy, onSync }: {
  value: AlibabaForm; onChange: (key: keyof AlibabaForm, value: unknown) => void;
  approved: boolean; onApprove: (value: boolean) => void;
  savedSku: string; revision: number; busy: boolean; onSync: () => void;
}) {
  const [status, setStatus] = useState<DraftStatus | null>(null);
  const [error, setError] = useState("");
  const [extraFields, setExtraFields] = useState<{ path: string; name: string; type: string; options: { value: string; label: string }[] }[]>([]);
  async function loadFields() {
    setError("");
    try {
      const response = await fetch(`/api/integrations/alibaba/publications?sku=${encodeURIComponent(savedSku)}&schema=true`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setExtraFields(data.fields ?? []);
      if (!data.fields?.length) setError("已保存商品的类目补充项已齐全。修改类目或资料后请先保存，再重新读取。");
    } catch (error) { setError(error instanceof Error ? error.message : "无法读取类目规则。"); }
  }
  useEffect(() => {
    let cancelled = false;
    if (!savedSku) return;
    fetch(`/api/integrations/alibaba/publications?sku=${encodeURIComponent(savedSku)}`)
      .then(async res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { if (!cancelled) { setStatus(data); setError(""); } })
      .catch(() => { if (!cancelled) setError("暂时无法读取国际站同步状态。"); });
    return () => { cancelled = true; };
  }, [savedSku, revision]);

  const tiers = value.alibabaPriceTiers;
  return <Card>
    <CardHeader><CardTitle>国际站发布资料</CardTitle><span className="text-xs text-amber-700">提交国际站发布审核</span></CardHeader>
    <CardBody className="space-y-4">
      <p className="text-sm text-slate-500">使用上方英文标题、图片和详情。国际站起订量与价格按这里选择的个或套计算；前 6 张图片作主图，其余保留用于详情。未知数据留空，不能用示例值代填。</p>
      <div className="grid grid-cols-2 gap-4">
        <Input label="SKU" aria-label="SKU" placeholder="PS01" value={value.sku} disabled={busy || !!status?.record}
          onChange={e => onChange("sku", e.target.value.toUpperCase())} />
        <Input label="国际站末级类目 ID" aria-label="国际站末级类目 ID" placeholder="由已授权店铺确认" value={value.alibabaCategoryId}
          onChange={e => onChange("alibabaCategoryId", e.target.value)} />
      </div>
      <Input label="产品尺寸（含单位）" aria-label="产品尺寸（含单位）" placeholder="填写已确认的长、宽、高及单位" value={value.alibabaDimensions}
        onChange={e => onChange("alibabaDimensions", e.target.value)} />
      <AlibabaListingFields value={value.alibabaListing} categoryId={value.alibabaCategoryId} onChange={v => onChange("alibabaListing", v)} />
      <div className="space-y-3 rounded-lg border p-3">
        <p className="text-sm font-medium">国际站类目补充项</p>
        <p className="text-xs text-slate-500">先保存本款商品，再读取店铺的最新类目要求。物流、属性等选项以国际站当前规则为准。</p>
        <Button type="button" variant="outline" disabled={busy || !savedSku} onClick={loadFields}>读取类目补充项</Button>
        {extraFields.map(field => {
          const selected = value.alibabaListing.schemaValues?.[field.path] ?? "";
          const update = (v: string | string[]) => onChange("alibabaListing", { ...value.alibabaListing, schemaValues: { ...value.alibabaListing.schemaValues, [field.path]: v } });
          return <label key={field.path} className="block text-sm space-y-1"><span>{field.name}</span>
            {field.options.length ? <select className="block w-full border rounded p-2" multiple={field.type === "multiCheck"} value={field.type === "multiCheck" ? Array.isArray(selected) ? selected : [selected] : Array.isArray(selected) ? selected[0] : selected}
              onChange={e => update(field.type === "multiCheck" ? Array.from(e.target.selectedOptions).map(o => o.value) : e.target.value)}>
              {field.type !== "multiCheck" && <option value="">请选择</option>}{field.options.filter(o => o.value !== "-1").map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select> : <input className="block w-full border rounded p-2" value={Array.isArray(selected) ? selected.join(",") : selected} onChange={e => update(e.target.value)} />}
          </label>;
        })}
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-600">阶梯价 · USD / {value.alibabaListing.salesUnit || "请先选择销售单位"}（第一档数量须与国际站起订量相同）</p>
        {tiers.map((tier, i) => <div key={i} className="flex gap-2 items-end">
          <Input label={`第 ${i + 1} 档起订量`} aria-label={`第 ${i + 1} 档起订量`} type="number" min="1" step="1" value={tier.minQuantity}
            onChange={e => onChange("alibabaPriceTiers", tiers.map((t, j) => j === i ? { ...t, minQuantity: e.target.value } : t))} />
          <Input label="USD 单价" aria-label={`第 ${i + 1} 档 USD 单价`} type="number" min="0.01" step="0.01" value={tier.unitPrice}
            onChange={e => onChange("alibabaPriceTiers", tiers.map((t, j) => j === i ? { ...t, unitPrice: e.target.value } : t))} />
          <Button variant="ghost" type="button" onClick={() => onChange("alibabaPriceTiers", tiers.filter((_, j) => j !== i))}>删除</Button>
        </div>)}
        <Button variant="secondary" type="button" disabled={tiers.length >= 4} onClick={() => onChange("alibabaPriceTiers", [...tiers, { minQuantity: "", unitPrice: "" }])}>添加价格档位</Button>
      </div>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input type="checkbox" className="mt-1" checked={approved} onChange={e => onApprove(e.target.checked)} disabled={busy} />
        <span>产品资料已审核通过<span className="block text-xs text-slate-500">已核对英文资料、图片、SKU、类目属性、销售单位、起订量、价格及包装参数；修改同步资料后需重新审核。</span></span>
      </label>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input type="checkbox" className="mt-1" checked={value.alibabaSyncEnabled} onChange={e => onChange("alibabaSyncEnabled", e.target.checked)} disabled={busy} />
        <span>自动提交国际站审核<span className="block text-xs text-slate-500">启用自动同步后，保存已审核的产品时自动提交。</span></span>
      </label>
      <div className="rounded-lg bg-slate-50 p-3 space-y-2 text-sm" aria-live="polite">
        {!status && <p className="text-slate-500">保存 SKU 后可检查授权与资料缺项。店铺权限尚待验证。</p>}
        {status && <>
          <p>{status.connectionConfigured ? "店铺连接已验证，正式发布仍需通过实时类目校验。" : "国际站连接尚未配置完成。"} <a className="text-blue-600 underline" href="/admin/alibaba">管理店铺连接</a></p>
          <p className="text-slate-500">{status.autoEnabled ? "自动同步开关已开启。" : "自动同步尚未开启。"}</p>
          {status.record?.productId && <p className="font-semibold text-emerald-700">国际站商品编号：{status.record.productId}</p>}
          {status.record?.message && <p>{status.record.message}</p>}
          {status.record?.changedSinceSync && <p className="text-amber-700">保存的资料与同步时不同，请核对国际站已有商品。</p>}
          {status.missingFields.length > 0 && <div>
            <p className="font-medium">已保存资料的缺项：</p>
            <ul className="list-disc pl-5 text-slate-600">{status.missingFields.map((item, i) => <li key={`${item.field}-${i}`}>{item.message}</li>)}</ul>
          </div>}
        </>}
        {error && <p className="text-red-600">{error}</p>}
      </div>
      <Button type="button" variant="outline" disabled={busy} onClick={onSync}>
        {busy ? "正在处理…" : status?.record ? "保存并检查国际站状态" : "保存并提交国际站审核"}
      </Button>
      <a href="https://i.alibaba.com/" target="_blank" rel="noopener noreferrer" className="inline-block ml-3 text-sm text-blue-600 hover:underline">打开 My Alibaba 核对</a>
    </CardBody>
  </Card>;
}
