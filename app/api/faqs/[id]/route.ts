import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const faq = await prisma.fAQ.findUnique({ where: { id: Number(id) } });
  if (!faq) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(faq);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const faq = await prisma.fAQ.update({
    where: { id: Number(id) },
    data: {
      ...(body.question !== undefined && { question: body.question }),
      ...(body.answer   !== undefined && { answer:   body.answer }),
      ...(body.page     !== undefined && { page:     body.page }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
      ...(body.active   !== undefined && { active:   body.active }),
    },
  });
  return NextResponse.json(faq);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.fAQ.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
