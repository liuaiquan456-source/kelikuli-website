"use client";
import { Input, Select } from "@/app/admin/_components/ui";
import { ALIBABA_ATTRIBUTES, missingListingFields, type AlibabaListing } from "@/lib/alibaba-listing";

export default function AlibabaListingFields({ value, onChange, categoryId }: {
  value: AlibabaListing; onChange: (value: AlibabaListing) => void; categoryId: string;
}) {
  const unit = value.salesUnit === "set" ? "套" : value.salesUnit === "piece" ? "个" : "销售单位";
  const number = (v: string) => v === "" ? null : Number(v);
  const issues = missingListingFields(value, categoryId);
  return <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Select label="销售单位 *" aria-label="国际站销售单位" value={value.salesUnit}
        options={[{ value: "", label: "请选择" }, { value: "piece", label: "个 / piece" }, { value: "set", label: "套 / set" }]}
        onChange={e => onChange({ ...value, salesUnit: e.target.value as AlibabaListing["salesUnit"],
          piecesPerUnit: e.target.value === "piece" ? 1 : null, minimumOrderQuantity: null, packaging: { ...value.packaging, confirmed: false } })} />
      <Input label="每个销售单位包含数量 *" aria-label="每个销售单位包含数量" type="number" min={value.salesUnit === "set" ? 2 : 1} step="1"
        value={value.piecesPerUnit ?? ""} disabled={value.salesUnit === "piece"}
        onChange={e => onChange({ ...value, piecesPerUnit: number(e.target.value), packaging: { ...value.packaging, confirmed: false } })} />
      <Input label={`国际站起订量（${unit}）*`} aria-label="国际站起订量" type="number" min="1" step="1" value={value.minimumOrderQuantity ?? ""}
        onChange={e => onChange({ ...value, minimumOrderQuantity: number(e.target.value) })} />
    </div>
    {value.salesUnit === "set" && value.piecesPerUnit && value.minimumOrderQuantity && <p className="text-sm text-blue-700">每套 {value.piecesPerUnit} 个，{value.minimumOrderQuantity} 套起订，共 {value.piecesPerUnit * value.minimumOrderQuantity} 个。阶梯价填写每套价格。</p>}
    <div className="grid grid-cols-2 gap-4">
      <Input label="最短交期（天）*" aria-label="最短交期（天）" type="number" min="1" step="1" value={value.leadTimeMinDays ?? ""}
        onChange={e => onChange({ ...value, leadTimeMinDays: number(e.target.value) })} />
      <Input label="最长交期（天）*" aria-label="最长交期（天）" type="number" min="1" step="1" value={value.leadTimeMaxDays ?? ""}
        onChange={e => onChange({ ...value, leadTimeMaxDays: number(e.target.value) })} />
    </div>
    <fieldset className="rounded-lg border border-slate-200 p-4 space-y-3">
      <legend className="px-1 text-sm font-semibold">每{unit}运输包装 *</legend>
      <p className="text-xs text-slate-500">按套销售时，填写整套全部产品装好后的尺寸及毛重。这里不是公仔本身尺寸，也不是整笔起订量的外箱数据。未确定可以留空保存，补齐并确认后才能提交国际站。</p>
      <div className="grid grid-cols-2 gap-3">
        {([["lengthCm", "包装长（cm）"], ["widthCm", "包装宽（cm）"], ["heightCm", "包装高（cm）"], ["grossWeightKg", "包装毛重（kg）"]] as const).map(([key, label]) =>
          <Input key={key} label={`${label} *`} aria-label={label} type="number" min="0.001" step="any" value={value.packaging[key] ?? ""}
            onChange={e => onChange({ ...value, packaging: { ...value.packaging, [key]: number(e.target.value), confirmed: false } })} />)}
      </div>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={value.packaging.confirmed}
        onChange={e => onChange({ ...value, packaging: { ...value.packaging, confirmed: e.target.checked } })} />包装方案、尺寸和毛重已确认</label>
    </fieldset>
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold">类目属性（英文）</legend>
      <p className="text-xs text-slate-500">树脂工艺品类目 1720 下以下属性均必填；其他类目提交前还需按国际站实时规则校验。</p>
      <div className="grid grid-cols-2 gap-3">
        {ALIBABA_ATTRIBUTES.map(([key, label]) => <Input key={key} aria-label={label} label={`${label}${categoryId === "1720" || key === "countryOfOrigin" ? " *" : ""}`}
          value={value.attributes[key]} maxLength={200} onChange={e => onChange({ ...value, attributes: { ...value.attributes, [key]: e.target.value } })} />)}
      </div>
    </fieldset>
    <div role="status" className={`rounded-lg p-3 text-sm ${issues.length ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-800"}`}>
      {issues.length ? <><p className="font-medium">国际站资料待补充（可先保存）</p><ul className="list-disc pl-5 mt-1">{issues.map(i => <li key={i.field}>{i.message}</li>)}</ul></>
        : "交易和包装必填资料已齐全，仍需核对标题、图片、价格及国际站类目校验结果。"}
    </div>
  </div>;
}
