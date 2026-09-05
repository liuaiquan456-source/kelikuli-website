import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeEmail(raw: string | null | undefined): string {
  return (raw ?? "").trim().toLowerCase();
}

// Per-email "shopping cart" account. There is no auth — the email itself is
// the account key, matching the site's low-friction B2B inquiry flow.
export async function GET(req: NextRequest) {
  const email = normalizeEmail(req.nextUrl.searchParams.get("email"));
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

  const account = await prisma.cartAccount.findUnique({ where: { email } });
  let items: unknown[] = [];
  try {
    items = account ? JSON.parse(account.items) : [];
  } catch {
    items = [];
  }
  return NextResponse.json({ items });
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  const items = Array.isArray(body.items) ? body.items : [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  await prisma.cartAccount.upsert({
    where: { email },
    update: { items: JSON.stringify(items) },
    create: { email, items: JSON.stringify(items) },
  });

  return NextResponse.json({ ok: true });
}
