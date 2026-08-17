import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = await req.json();

  if (body.isDefault) {
    await prisma.language.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
  }

  const language = await prisma.language.update({
    where: { code },
    data: {
      ...(body.name       !== undefined && { name: body.name }),
      ...(body.nativeName !== undefined && { nativeName: body.nativeName }),
      ...(body.flag       !== undefined && { flag: body.flag }),
      ...(body.isDefault  !== undefined && { isDefault: !!body.isDefault }),
      ...(body.active     !== undefined && { active: !!body.active }),
      ...(body.sortOrder  !== undefined && { sortOrder: Number(body.sortOrder) }),
    },
  });
  return NextResponse.json(language);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  await prisma.translation.deleteMany({ where: { languageCode: code } });
  await prisma.language.delete({ where: { code } });
  return NextResponse.json({ ok: true });
}
