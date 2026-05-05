import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const allowed = ["status", "notes"];
  const data: Record<string, string> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const inquiry = await prisma.inquiry.update({
    where: { id: Number(id) },
    data,
  });
  return NextResponse.json({ inquiry });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.inquiry.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
