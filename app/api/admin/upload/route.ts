import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, access } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export const runtime = "nodejs";

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const root = findRoot();
    const dir = path.join(root, "public", "images", "products");

    console.log("[upload] root:", root, "| dir:", dir);

    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);

    return NextResponse.json({ url: `/images/products/${filename}` });
  } catch (err) {
    console.error("[upload] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
