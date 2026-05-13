import { cache } from "react";
import { prisma } from "./prisma";

export const SETTING_DEFAULTS: Record<string, string> = {
  whatsapp: "+86 135 0589 3913",
  phone: "+86 135 0589 3913",
  wechat: "kelikuli",
  fax: "",
  email: "681682@qq.com",
  address: "No. 567 Anping Road, Zhengjiawu Town, Pujiang County, Jinhua City, Zhejiang Province, China",
  facebook: "",
  instagram: "",
  linkedin: "",
  youtube: "",
};

export const getSettings = cache(async (): Promise<Record<string, string>> => {
  try {
    const rows = await prisma.setting.findMany();
    const result = { ...SETTING_DEFAULTS };
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  } catch {
    return { ...SETTING_DEFAULTS };
  }
});

export function waMe(phone: string): string {
  return "https://wa.me/" + phone.replace(/[^0-9]/g, "");
}
