import { NextRequest } from "next/server";
import { readAdminSession } from "./admin-session";
import { prisma } from "./prisma";

export async function hasAdminSession(req: NextRequest): Promise<boolean> {
  const session = await readAdminSession(req.cookies.get("admin_session")?.value);
  if (!session) return false;
  const user = await prisma.adminUser.findUnique({
    where: { id: session.userId },
    select: { status: true },
  });
  return user?.status === "active";
}
