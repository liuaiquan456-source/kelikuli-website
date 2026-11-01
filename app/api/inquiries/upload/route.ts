import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import {
  designExtensions,
  maxDesignSize,
  inquiryFilesDirectory,
} from "@/lib/inquiry-files";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (Number(req.headers.get("content-length")) > maxDesignSize + 65536)
    return NextResponse.json(
      { error: "File too large (maximum 30 MB)." },
      { status: 413 },
    );
  try {
    const file = (await req.formData()).get("file");
    if (!(file instanceof File) || !file.size)
      return NextResponse.json(
        { error: "Please select a non-empty file." },
        { status: 400 },
      );
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!designExtensions.has(ext))
      return NextResponse.json(
        { error: "Unsupported file type." },
        { status: 400 },
      );
    if (file.size > maxDesignSize)
      return NextResponse.json(
        { error: "File too large (maximum 30 MB)." },
        { status: 413 },
      );
    const filename = `${randomUUID()}.${ext}`;
    const dir = inquiryFilesDirectory();
    // Customer uploads are runtime data, never build assets to be traced/bundled.
    await mkdir(/* turbopackIgnore: true */ dir, { recursive: true, mode: 0o700 });
    await writeFile(
      path.join(/* turbopackIgnore: true */ dir, filename),
      Buffer.from(await file.arrayBuffer()),
      { mode: 0o600, flag: "wx" },
    );
    return NextResponse.json(
      {
        url: `/api/inquiries/files/${filename}`,
        name: file.name.slice(0, 200),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}
