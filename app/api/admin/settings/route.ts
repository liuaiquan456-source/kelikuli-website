import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SETTING_DEFAULTS } from "@/lib/settings";

export async function GET() {
  const rows = await prisma.setting.findMany();
  const result = { ...SETTING_DEFAULTS };
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Record<string, string>;
  await Promise.all(
    Object.entries(body).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  );
  return NextResponse.json({ ok: true });
}
