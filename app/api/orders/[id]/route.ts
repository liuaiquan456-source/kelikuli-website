import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (body.itemUpdates) {
    await Promise.all(
      (body.itemUpdates as { id: number; status: string; notes?: string }[]).map((u) =>
        prisma.orderItem.update({
          where: { id: u.id },
          data: { status: u.status, ...(u.notes !== undefined && { notes: u.notes }) },
        })
      )
    );
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.notes  && { notes:  body.notes  }),
    },
    include: { items: true },
  });
  return NextResponse.json(order);
}
