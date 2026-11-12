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
  record: { status: string; draftId?: string; message: string; changedSinceSync: boolean } | null;
}

export default function AlibabaDraftPanel({ value, onChange, approved, onApprove, savedSku, revision, busy, onSync }: {
  value: AlibabaForm; onChange: (key: keyof AlibabaForm, value: unknown) => void;
  approved: boolean; onApprove: (value: boolean) => void;
  savedSku: string; revision: number; busy: boolean; onSync: () => void;
}) {
  const [status, setStatus] = useState<DraftStatus | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    if (!savedSku) return;
    fetch(`/api/integrations/alibaba/drafts?sku=${encodeURIComponent(savedSku)}`)
      .then(async res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { if (!cancelled) { setStatus(data); setError(""); } })
      .catch(() => { if (!cancelled) setError("暂时无法读取国际站同步状态。"); });
    return () => { cancelled = true; };
  }, [savedSku, revision]);

  const tiers = value.alibabaPriceTiers;
  return <Card>
    <CardHeader><CardTitle>国际站发布资料</CardTitle><span className="text-xs text-amber-700">当前连接仅支持草稿</span></CardHeader>
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
        <span>同步到国际站草稿<span className="block text-xs text-slate-500">启用自动同步后，保存已审核的产品时自动提交。</span></span>
      </label>
      <div className="rounded-lg bg-slate-50 p-3 space-y-2 text-sm" aria-live="polite">
        {!status && <p className="text-slate-500">保存 SKU 后可检查授权与资料缺项。店铺权限尚待验证。</p>}
        {status && <>
          <p>{status.connectionConfigured ? "连接已配置，实际权限以提交校验结果为准。" : "国际站连接或草稿权限尚未配置完成。"}</p>
          <p className="text-slate-500">{status.autoEnabled ? "自动同步开关已开启。" : "自动同步尚未开启。"}</p>
          {status.record?.draftId && <p className="font-semibold text-emerald-700">草稿编号：{status.record.draftId}</p>}
          {status.record?.message && <p>{status.record.message}</p>}
          {status.record?.changedSinceSync && <p className="text-amber-700">保存的资料与同步时不同，请核对国际站已有草稿。</p>}
          {status.missingFields.length > 0 && <div>
            <p className="font-medium">已保存资料的缺项：</p>
            <ul className="list-disc pl-5 text-slate-600">{status.missingFields.map((item, i) => <li key={`${item.field}-${i}`}>{item.message}</li>)}</ul>
          </div>}
        </>}
        {error && <p className="text-red-600">{error}</p>}
      </div>
      <Button type="button" variant="outline" disabled={busy} onClick={onSync}>
        {busy ? "正在处理…" : status?.record ? "保存并检查国际站草稿" : "保存并同步国际站草稿"}
      </Button>
      <a href="https://i.alibaba.com/" target="_blank" rel="noopener noreferrer" className="inline-block ml-3 text-sm text-blue-600 hover:underline">打开 My Alibaba 核对</a>
    </CardBody>
  </Card>;
}
