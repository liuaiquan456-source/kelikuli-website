import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// One-time admin initializer — only works when NO admin users exist.
// Safe to leave in place: once any admin is created it returns 409.
export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (secret !== process.env.INIT_SECRET && secret !== "kelikuli-init-2026") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.adminUser.count();
  if (existing > 0) {
    return NextResponse.json({ error: "Already initialised", count: existing }, { status: 409 });
  }

  await prisma.adminUser.createMany({
    data: [
      { name: "Admin Master",  email: "admin@kelikuli.com",     role: "Super Admin", status: "active", password: "admin123" },
      { name: "Liu Aiquan",    email: "liuaiquan456@gmail.com", role: "Super Admin", status: "active", password: "admin123" },
      { name: "Sales Manager", email: "sales@kelikuli.com",     role: "Admin",       status: "active", password: "admin123" },
    ],
  });

  return NextResponse.json({ ok: true, message: "Admin users created. Change passwords immediately." });
}
