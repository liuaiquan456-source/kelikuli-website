// Shared by the product editor and authenticated intake. Unknown measurements
// remain null; website drafts may be saved before Alibaba requirements are met.
export const ALIBABA_ATTRIBUTES = [
  ["material", "材质"], ["feature", "特征"], ["technique", "工艺"],
  ["pattern", "图案"], ["productType", "产品类型"], ["style", "风格"],
  ["application", "用途"], ["countryOfOrigin", "原产国"],
] as const;
export type AttributeKey = typeof ALIBABA_ATTRIBUTES[number][0];
export interface AlibabaListing {
  salesUnit: "" | "piece" | "set";
  piecesPerUnit: number | null;
  minimumOrderQuantity: number | null;
  leadTimeMinDays: number | null;
  leadTimeMaxDays: number | null;
  packaging: { lengthCm: number | null; widthCm: number | null; heightCm: number | null; grossWeightKg: number | null; confirmed: boolean };
  attributes: Record<AttributeKey, string>;
  schemaValues?: Record<string, string | string[]>;
}
export interface ListingIssue { field: string; message: string }

export function emptyAlibabaListing(): AlibabaListing {
  return { salesUnit: "", piecesPerUnit: null, minimumOrderQuantity: null,
    leadTimeMinDays: null, leadTimeMaxDays: null,
    packaging: { lengthCm: null, widthCm: null, heightCm: null, grossWeightKg: null, confirmed: false },
    attributes: Object.fromEntries(ALIBABA_ATTRIBUTES.map(([key]) => [key, ""])) as Record<AttributeKey, string> };
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label}格式不正确。`);
  return value as Record<string, unknown>;
}
function knownKeys(value: Record<string, unknown>, allowed: string[], label: string) {
  if (Object.keys(value).some(key => !allowed.includes(key))) throw new Error(`${label}包含不支持的字段。`);
}
function positive(value: unknown, label: string, integer = false): number | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > 999999999 ||
    (integer && !Number.isSafeInteger(value))) throw new Error(`${label}必须是${integer ? "正整数" : "大于零的数字"}，未确定请留空。`);
  return value;
}

export function parseAlibabaListing(raw: unknown): AlibabaListing {
  const result = emptyAlibabaListing();
  const body = object(typeof raw === "string" ? JSON.parse(raw) : raw, "国际站资料");
  knownKeys(body, [...Object.keys(result), "schemaValues"], "国际站资料");
  if (body.schemaValues !== undefined) {
    const fields = object(body.schemaValues, "类目补充资料");
    if (Object.keys(fields).length > 100) throw new Error("类目补充资料过多。");
    result.schemaValues = {};
    for (const [key, value] of Object.entries(fields)) {
      if (!/^[A-Za-z0-9_.:-]{1,300}$/.test(key) || ["__proto__", "constructor", "prototype"].includes(key)) throw new Error("类目补充字段不正确。");
      const values = Array.isArray(value) ? value : [value];
      if (values.length > 30 || values.some(v => typeof v !== "string" || v.length > 2000)) throw new Error("类目补充值不正确。");
      result.schemaValues[key] = value as string | string[];
    }
  }
  if (body.salesUnit !== undefined) {
    if (!["", "piece", "set"].includes(body.salesUnit as string)) throw new Error("销售单位请选择个或套。");
    result.salesUnit = body.salesUnit as AlibabaListing["salesUnit"];
  }
  for (const key of ["piecesPerUnit", "minimumOrderQuantity", "leadTimeMinDays", "leadTimeMaxDays"] as const) {
    result[key] = positive(body[key], key, true);
  }
  if (result.salesUnit === "piece" && result.piecesPerUnit !== null && result.piecesPerUnit !== 1) throw new Error("按个销售时每单位数量必须为 1。");
  if (result.salesUnit === "set" && result.piecesPerUnit !== null && result.piecesPerUnit < 2) throw new Error("每套至少包含 2 个。");
  if (result.leadTimeMinDays !== null && result.leadTimeMaxDays !== null && result.leadTimeMinDays > result.leadTimeMaxDays) throw new Error("最短交期不能大于最长交期。");
  if (body.packaging !== undefined) {
    const p = object(body.packaging, "包装资料");
    knownKeys(p, Object.keys(result.packaging), "包装资料");
    for (const key of ["lengthCm", "widthCm", "heightCm", "grossWeightKg"] as const) result.packaging[key] = positive(p[key], key);
    if (p.confirmed !== undefined && typeof p.confirmed !== "boolean") throw new Error("包装确认状态格式不正确。");
    result.packaging.confirmed = p.confirmed === true;
  }
  if (body.attributes !== undefined) {
    const attrs = object(body.attributes, "类目属性");
    knownKeys(attrs, ALIBABA_ATTRIBUTES.map(([key]) => key), "类目属性");
    for (const [key, label] of ALIBABA_ATTRIBUTES) {
      if (attrs[key] === undefined) continue;
      if (typeof attrs[key] !== "string" || attrs[key].length > 200) throw new Error(`${label}请填写不超过 200 字符的文字。`);
      result.attributes[key] = attrs[key].trim();
    }
  }
  return result;
}

export function readAlibabaListing(raw?: string): AlibabaListing {
  try { return parseAlibabaListing(raw || "{}"); } catch { return emptyAlibabaListing(); }
}

export function missingListingFields(listing: AlibabaListing, categoryId: string): ListingIssue[] {
  const issues: ListingIssue[] = [];
  const add = (key: string, message: string) => issues.push({ field: `alibabaListing.${key}`, message });
  if (!listing.salesUnit) add("salesUnit", "请选择国际站销售单位：个或套。");
  if (!listing.piecesPerUnit) add("piecesPerUnit", "请填写每个销售单位包含的产品数量。");
  if (!listing.minimumOrderQuantity) add("minimumOrderQuantity", "请填写国际站起订量，单位须与销售单位一致。");
  if (!listing.leadTimeMinDays || !listing.leadTimeMaxDays) add("leadTimeMaxDays", "请填写已确认的最短和最长交期（天）。");
  const labels = { lengthCm: "包装长（厘米）", widthCm: "包装宽（厘米）", heightCm: "包装高（厘米）", grossWeightKg: "含运输包装的毛重（千克）" };
  for (const key of Object.keys(labels) as (keyof typeof labels)[]) if (!listing.packaging[key]) add(`packaging.${key}`, `请填写一个销售单位的${labels[key]}。`);
  if (!listing.packaging.confirmed) add("packaging.confirmed", "请确认包装尺寸和毛重，尚未确定的资料不能提交国际站。");
  // Verified live for Resin Crafts (1720), 2026-11-12. Other categories still
  // require validation against their own live Alibaba schema at the gateway.
  for (const [key, label] of ALIBABA_ATTRIBUTES) {
    if ((categoryId === "1720" || key === "countryOfOrigin") && !listing.attributes[key]) add(`attributes.${key}`, `请填写${label}（英文）。`);
  }
  return issues;
}
