import { NextRequest } from "next/server";

// Lightweight gate for /api/admin/* route handlers. The admin_session cookie is
// set by /api/admin/login and is also what middleware.ts checks for admin pages.
export function hasAdminSession(req: NextRequest): boolean {
  const v = req.cookies.get("admin_session")?.value;
  return !!v && v.includes(":");
}
