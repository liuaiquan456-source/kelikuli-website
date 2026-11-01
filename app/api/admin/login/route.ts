import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminSessionMaxAge, createAdminSession } from "@/lib/admin-session";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });

  if (!user || user.password !== password || user.status !== "active") {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createAdminSession(user.id);
  if (!token) {
    console.error("Admin login requires ADMIN_SESSION_SECRET with at least 32 bytes.");
    return NextResponse.json({ error: "Admin sign-in is not configured." }, { status: 503 });
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const res = NextResponse.json({ success: true, user: { name: user.name, email: user.email, role: user.role } });

  res.cookies.set("admin_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: adminSessionMaxAge,
  });

  return res;
}
