import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { hasAdminSession } from "@/lib/admin-auth";
import { inquiryAttachmentPath } from "@/lib/inquiry-data";
import { inquiryFilesDirectory } from "@/lib/inquiry-files";
export const runtime = "nodejs";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  if (!(await hasAdminSession(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { filename } = await params;
  if (!inquiryAttachmentPath.test(`/api/inquiries/files/${filename}`))
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const file = await readFile(path.join(/* turbopackIgnore: true */ inquiryFilesDirectory(), filename));
    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
