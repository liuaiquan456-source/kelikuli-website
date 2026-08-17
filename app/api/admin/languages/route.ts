import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const languages = await prisma.language.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(languages);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, name, nativeName, flag, isDefault, active, sortOrder } = body;

  if (!code?.trim() || !name?.trim() || !nativeName?.trim()) {
    return NextResponse.json({ error: "code, name, and nativeName are required." }, { status: 400 });
  }

  if (isDefault) {
    await prisma.language.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
  }

  const language = await prisma.language.create({
    data: {
      code: code.trim(),
      name: name.trim(),
      nativeName: nativeName.trim(),
      flag: flag ?? "",
      isDefault: !!isDefault,
      active: active ?? true,
      sortOrder: sortOrder ?? 0,
    },
  });
  return NextResponse.json(language, { status: 201 });
}
