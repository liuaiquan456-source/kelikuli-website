import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export const runtime = "nodejs";

// Public upload endpoint for files attached to the customer inquiry form
// (InquiryModal). Distinct from /api/upload (product images only, 5MB cap) —
// the inquiry form's own copy always promised broader document types and a
// higher size limit, so this matches that instead of loosening the other
// endpoint's constraints for unrelated callers.
const ALLOWED_EXT = ["jpg", "jpeg", "png", "pdf", "doc", "docx", "xls", "xlsx", "csv", "txt"];
const MAX_SIZE = 30 * 1024 * 1024; // 30MB, matches the form's stated limit

function findRoot(): string {
  if (process.env.PROJECT_ROOT && existsSync(path.join(process.env.PROJECT_ROOT, "public"))) {
    return process.env.PROJECT_ROOT;
  }
  for (const start of [__dirname, process.cwd()]) {
    let dir = start;
    for (let i = 0; i < 10; i++) {
      if (existsSync(path.join(dir, "package.json")) && existsSync(path.join(dir, "public"))) {
        return dir;
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  return process.cwd();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ error: `File type .${ext} isn't allowed` }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 30MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const root = findRoot();
    const dir = path.join(root, "public", "uploads", "inquiries");

    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);

    return NextResponse.json({ url: `/uploads/inquiries/${filename}`, name: file.name });
  } catch (err) {
    console.error("[inquiries/upload] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
