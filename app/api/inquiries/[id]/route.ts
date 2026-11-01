import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/admin-auth";

type Context = { params: Promise<{ id: string }> };
export async function PATCH(req: NextRequest, { params }: Context) {
  if (!(await hasAdminSession(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object")
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const data: Record<string, string> = {};
  if (
    typeof body.status === "string" &&
    ["unread", "read", "replied"].includes(body.status)
  )
    data.status = body.status;
  if (typeof body.notes === "string") data.notes = body.notes.slice(0, 10000);
  if (!Object.keys(data).length)
    return NextResponse.json({ error: "No valid updates" }, { status: 400 });
  const inquiry = await prisma.inquiry.update({
    where: { id: Number(id) },
    data,
  });
  return NextResponse.json(
    { inquiry },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
export async function DELETE(req: NextRequest, { params }: Context) {
  if (!(await hasAdminSession(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  await prisma.inquiry.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
