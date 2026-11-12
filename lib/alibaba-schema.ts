import { parseStringPromise } from "xml2js";
import { type draftPayload, type MissingField } from "./alibaba-draft-data";
import type { AttributeKey } from "./alibaba-listing";

type XmlNode = { $?: Record<string, string>; [key: string]: unknown };
export interface SchemaField {
  id: string; name: string; type: string; path: string; required: boolean; disabled: boolean;
  options: { value: string; label: string }[]; rules: Record<string, string>; children: SchemaField[];
}
export interface AlibabaPhoto { id: string; url: string }
type Payload = ReturnType<typeof draftPayload>;
const nodes = (value: unknown) => (Array.isArray(value) ? value : []) as XmlNode[];
export const escapeXml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);
const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
export async function parseAlibabaSchema(xml: string): Promise<SchemaField[]> {
  if (xml.length > 3_000_000 || /<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error("国际站类目规则格式不安全。");
  const doc = await parseStringPromise(xml, { explicitArray: true, trim: true, explicitRoot: true });
  const root = doc.itemSchema as XmlNode;
  if (!root) throw new Error("国际站没有返回商品表单。");
  let count = 0;
  function parse(values: XmlNode[], parent = "", depth = 0): SchemaField[] {
    if (depth > 12) throw new Error("类目规则层级过多。");
    return values.map(node => {
      if (++count > 3000) throw new Error("类目规则过大。");
      const attrs = node.$ ?? {}, id = attrs.id ?? "";
      if (!/^[A-Za-z0-9_:-]+$/.test(id)) throw new Error("类目字段标识无效。");
      const path = parent ? `${parent}.${id}` : id;
      const rules = Object.fromEntries(nodes(nodes(node.rules)[0]?.rule).map(r => [r.$?.name ?? "", r.$?.value ?? ""]));
      const children = [...nodes(node.field), ...nodes(nodes(node.fields)[0]?.field)];
      const options = nodes(nodes(node.options)[0]?.option).map(o => ({ value: o.$?.value ?? "", label: o.$?.displayName ?? o.$?.name ?? o.$?.value ?? "" }));
      return { id, path, name: attrs.name || id, type: attrs.type ?? "input", rules, options,
        required: rules.requiredRule === "true", disabled: rules.disableRule === "true" || rules.readOnlyRule === "true",
        children: parse(children, path, depth + 1) };
    });
  }
  return parse(nodes(root.field));
}
const attrNames: Record<AttributeKey, string[]> = {
  material: ["material"], feature: ["feature"], technique: ["technique", "technics"], pattern: ["pattern"],
  productType: ["producttype"], style: ["style"], application: ["application", "use", "usage"], countryOfOrigin: ["countryoforigin", "placeoforigin", "origin"],
};
function knownValue(field: SchemaField, p: Payload, photos: AlibabaPhoto[]): string | undefined {
  const { id, path } = field, l = p.listing;
  if (id === "market") return "2"; // inquiry listing, no instant checkout commitment
  if (id === "productTitle") return p.title;
  if (id === "productDescType") return "2";
  if (id === "scPrice") return "1";
  if (id === "priceUnit") return l.salesUnit;
  if (id === "minOrderQuantity") return String(p.moq ?? "");
  if (id === "pkgWeight") return String(l.packaging.grossWeightKg ?? "");
  if (path.startsWith("pkgMeasure.")) {
    const keys = { length: "lengthCm", width: "widthCm", height: "heightCm" } as const;
    const key = keys[id as keyof typeof keys];
    if (key) return String(l.packaging[key] ?? "");
  }
  const price = path.match(/(?:^|\.)ladderPrice_(\d+)\.(quantity|price)$/);
  if (price) { const t = p.priceTiers[Number(price[1])]; return t ? String(price[2] === "quantity" ? t.minQuantity : t.unitPrice) : ""; }
  if (/(?:^|\.)ladderPeriod_0\.quantity$/.test(path)) return String(p.moq ?? "");
  if (/(?:^|\.)ladderPeriod_0\.day$/.test(path)) return String(l.leadTimeMaxDays ?? "");
  if (/^productKeywords_\d+$/.test(id)) return id === "productKeywords_0" ? p.title.replace(/[^a-zA-Z0-9 ]/g, " ").slice(0, 128) : "";
  const img = id.match(/^scImages_(\d+)$/);
  if (img) return photos[Number(img[1])]?.url ?? "";
  if (id === "superText") {
    const text = p.description.replace(/<[^>]*>/g, " ");
    return `<div>${escapeXml(text).replace(/\n/g, "<br/>")}<p>SKU: ${escapeXml(p.sku)}. Dimensions: ${escapeXml(p.dimensions)}.</p><p>Sold per ${escapeXml(l.salesUnit)}; ${l.piecesPerUnit} pieces per sales unit. Minimum order: ${p.moq} ${escapeXml(l.salesUnit)}. Lead time: ${l.leadTimeMinDays}-${l.leadTimeMaxDays} days.</p>${photos.slice(6).map(photo => `<p><img src="${escapeXml(photo.url)}" /></p>`).join("")}</div>`;
  }
  if (path.startsWith("icbuCatProp.")) {
    const name = norm(field.name);
    if (["modelnumber", "modelno"].includes(name)) return p.sku;
    for (const [key, names] of Object.entries(attrNames)) if (names.includes(name)) return l.attributes[key as AttributeKey] || undefined;
  }
  return undefined;
}
export function compileAlibabaSchema(fields: SchemaField[], p: Payload, photos: AlibabaPhoto[] = []) {
  const missingFields: MissingField[] = [], supplemental: SchemaField[] = [];
  const add = (f: SchemaField, reason: string) => { missingFields.push({ field: f.path, message: `${f.name}：${reason}` }); if (!supplemental.some(x => x.path === f.path)) supplemental.push({ ...f, children: [] }); };
  function render(f: SchemaField, requiredParent = true): string {
    if (f.disabled || ["label", "labelGroup"].includes(f.type)) return "";
    if (f.children.length) {
      // Empty unused price/delivery rows must not trigger their children's required rules.
      const unusedPrice = f.id.match(/^ladderPrice_(\d+)$/);
      if (unusedPrice && Number(unusedPrice[1]) >= p.priceTiers.length) return "";
      if (/^ladderPeriod_[1-9]\d*$/.test(f.id)) return "";
      const values = f.children.map(c => render(c, requiredParent && (f.required || ["icbuCatProp", "pkgMeasure", "scImages", "ladderPrice", "ladderPrice_0", "ladderPeriod", "ladderPeriod_0", "productKeywords"].includes(f.id)))).join("");
      if (!values) { if (f.required && requiredParent) add(f, "请完善此项资料"); return ""; }
      if (f.type !== "complex") { add(f, "该类目表单暂需在国际站补充"); return ""; }
      return `<field id="${escapeXml(f.id)}" type="complex"><complex-value>${values}</complex-value></field>`;
    }
    const automatic = knownValue(f, p, photos);
    const raw = f.path.startsWith("icbuCatProp.") ? p.listing.schemaValues?.[f.path] ?? automatic : automatic !== undefined ? automatic : p.listing.schemaValues?.[f.path];
    const values = (Array.isArray(raw) ? raw : [raw ?? ""]).filter(v => v !== "");
    if (!values.length) {
      if (f.required && requiredParent) add(f, "请填写或选择");
      return "";
    }
    const xmlValues: string[] = [];
    for (const text of values) {
      if (f.rules.maxLengthRule && Buffer.byteLength(text) > Number(f.rules.maxLengthRule)) { add(f, "超过国际站长度限制"); continue; }
      if (f.rules.minValueRule && Number(text) < Number(f.rules.minValueRule)) { add(f, "低于国际站允许的最小值"); continue; }
      if (f.rules.maxValueRule && Number(text) > Number(f.rules.maxValueRule)) { add(f, "高于国际站允许的最大值"); continue; }
      let value = text, extra = "";
      if (f.options.length) {
        const match = f.options.find(o => o.value === text) ?? f.options.find(o => norm(o.label) === norm(text) || (f.id === "priceUnit" && norm(o.label) === `${norm(text)}s`));
        if (match) value = match.value;
        else if (f.path.startsWith("icbuCatProp.") && f.options.some(o => o.value === "-1")) { value = "-1"; extra = ` inputValue="${escapeXml(text)}"`; }
        else { add(f, "请使用国际站允许的选项"); continue; }
      } else if (f.path.startsWith("icbuCatProp.") && f.type === "input") { value = "-1"; extra = ` inputValue="${escapeXml(text)}"`; }
      const imageIndex = f.id.match(/^scImages_(\d+)$/);
      if (imageIndex && photos[Number(imageIndex[1])]?.id) extra = ` fileId="${escapeXml(photos[Number(imageIndex[1])].id)}"`;
      xmlValues.push(`<value${extra}>${escapeXml(value)}</value>`);
    }
    if (!xmlValues.length) return "";
    if (!["input", "singleCheck", "multiCheck"].includes(f.type)) { add(f, "该字段类型暂不支持自动填写"); return ""; }
    const content = f.type === "multiCheck" ? `<values>${xmlValues.join("")}</values>` : xmlValues[0];
    return `<field id="${escapeXml(f.id)}" type="${escapeXml(f.type)}">${content}</field>`;
  }
  const xml = `<itemSchema>${fields.map(f => render(f)).join("")}</itemSchema>`;
  for (const id of ["productTitle", "scImages", "superText", "priceUnit", "pkgMeasure", "pkgWeight"]) {
    if (!xml.includes(`id="${id}"`)) missingFields.push({ field: id, message: `类目表单未完成 ${id}，请读取补充项。` });
  }
  return { xml, missingFields, supplemental };
}
