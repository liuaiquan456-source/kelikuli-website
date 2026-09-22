import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CUSTOM_LAB_TAG } from "@/lib/custom-lab";

// Separate, higher-privilege action: flips a Custom-Lab-submitted draft to
// live. Deliberately split from the draft-intake key (CUSTOM_LAB_API_KEY) —
// this one requires CUSTOM_LAB_PUBLISH_KEY, so a leaked intake key can only
// ever create invisible drafts, never put anything live. Also scoped to
// products this same integration created (must still carry the Custom Lab
// tag) so it can't be repurposed to activate unrelated products an admin
// paused for other reasons.

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.CUSTOM_LAB_PUBLISH_KEY;
  if (!expected) return false; // not configured on the server = closed, never open by default
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return token.length > 0 && token === expected;
}

function parseTags(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const productId = parseInt(id, 10);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const tags = parseTags(product.tags);
  if (!tags.includes(CUSTOM_LAB_TAG)) {
    return NextResponse.json(
      { error: "This product was not created by the Custom Lab integration and cannot be published through this endpoint." },
      { status: 403 }
    );
  }

  if (product.status === "active") {
    return NextResponse.json({ id: product.id, status: "active", message: "Already published." });
  }

  const auditTags = tags.includes("Auto-Published") ? tags : [...tags, "Auto-Published"];

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { status: "active", tags: JSON.stringify(auditTags) },
  });

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    message: "Published live on kelikuli.com.",
    url: `https://kelikuli.com/products/${updated.id}`,
  });
}
