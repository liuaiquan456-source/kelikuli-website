import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TRANSLATION_KEYS } from "@/lib/i18n-keys";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const languageCode = searchParams.get("languageCode") ?? "";
  const search = (searchParams.get("search") ?? "").toLowerCase().trim();
  const onlyMissing = searchParams.get("onlyMissing") === "true";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(200, Math.max(1, Number(searchParams.get("pageSize") ?? "50")));

  const rows = languageCode
    ? await prisma.translation.findMany({ where: { languageCode } })
    : [];
  const valueByKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  let entries = TRANSLATION_KEYS.map((k) => ({
    key: k.key,
    section: k.section,
    en: k.en,
    value: valueByKey[k.key] ?? "",
  }));

  if (search) {
    entries = entries.filter(
      (e) => e.key.toLowerCase().includes(search) || e.en.toLowerCase().includes(search)
    );
  }
  if (onlyMissing) {
    entries = entries.filter((e) => !e.value);
  }

  const total = entries.length;
  const start = (page - 1) * pageSize;
  const paged = entries.slice(start, start + pageSize);

  return NextResponse.json({ entries: paged, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { key, languageCode, value } = body;

  if (!key?.trim() || !languageCode?.trim()) {
    return NextResponse.json({ error: "key and languageCode are required." }, { status: 400 });
  }

  if (!value?.trim()) {
    await prisma.translation.deleteMany({ where: { key, languageCode } }).catch(() => {});
    return NextResponse.json({ ok: true });
  }

  const translation = await prisma.translation.upsert({
    where: { key_languageCode: { key, languageCode } },
    update: { value },
    create: { key, languageCode, value },
  });
  return NextResponse.json(translation);
}
