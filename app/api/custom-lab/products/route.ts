import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CUSTOM_LAB_TAG } from "@/lib/custom-lab";

// Server-to-server intake for the KELIKULI Custom Lab (custom.kelikuli.com).
// Every submission is created as an inactive (= draft) product — nothing
// coming through here goes live until a human flips it to Active in
// /admin/products. Auth is a static shared secret, set via the
// CUSTOM_LAB_API_KEY env var, sent as `Authorization: Bearer <key>`.

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.CUSTOM_LAB_API_KEY;
  if (!expected) return false; // not configured on the server = closed, never open by default
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return token.length > 0 && token === expected;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  if (!name || !category) {
    return NextResponse.json({ error: "`name` and `category` are required" }, { status: 400 });
  }

  const images = Array.isArray(body.images)
    ? body.images.filter((x): x is string => typeof x === "string")
    : [];
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((x): x is string => typeof x === "string")
    : [];
  if (!tags.includes(CUSTOM_LAB_TAG)) tags.push(CUSTOM_LAB_TAG);

  const customerNote = typeof body.customerNote === "string" ? body.customerNote.trim() : "";
  const specsInput = typeof body.specs === "string" ? body.specs : "";
  const specs = customerNote
    ? `Customer request note (via Custom Lab):\n${customerNote}\n\n---\n${specsInput}`
    : specsInput;

  const product = await prisma.product.create({
    data: {
      name,
      category,
      price: typeof body.price === "number" ? body.price : parseFloat(String(body.price ?? "")) || 0,
      stock: 0,
      moq: typeof body.moq === "number" ? body.moq : parseInt(String(body.moq ?? "50")) || 50,
      leadTime: typeof body.leadTime === "string" && body.leadTime ? body.leadTime : "30-45 days",
      status: "inactive", // always a draft — this endpoint can never publish directly
      image: images[0] ?? "",
      images: JSON.stringify(images),
      video: "",
      tags: JSON.stringify(tags),
      variants: "[]",
      description: typeof body.description === "string" ? body.description : "",
      specs,
      seoTitle: "",
      seoDesc: "",
      seoKeywords: "",
    },
  });

  return NextResponse.json(
    {
      id: product.id,
      status: product.status,
      message: "Draft created. It will not appear on the site until a KELIKULI admin approves it.",
      reviewUrl: `https://kelikuli.com/admin/products/${product.id}/edit`,
    },
    { status: 201 }
  );
}
