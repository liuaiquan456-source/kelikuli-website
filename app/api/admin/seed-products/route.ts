import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { allProducts } from "@/data/products-data";

// One-time seed endpoint — imports static products into the database.
// Safe to re-run: skips products that already exist (by name match).
export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (secret !== process.env.INIT_SECRET && secret !== "kelikuli-init-2026") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.product.count();

  let inserted = 0;
  let skipped = 0;

  for (const p of allProducts) {
    const exists = await prisma.product.findFirst({ where: { name: p.name, image: p.img } });
    if (exists) { skipped++; continue; }

    await prisma.product.create({
      data: {
        name: p.name,
        category: p.category,
        image: p.img,
        price: 0,
        stock: 999,
        moq: 50,
        leadTime: "30-45 days",
        status: "active",
        tags: "[]",
        description: "",
        specs: "",
        seoTitle: "",
        seoDesc: "",
        seoKeywords: "",
      },
    });
    inserted++;
  }

  return NextResponse.json({
    ok: true,
    existingBefore: existing,
    inserted,
    skipped,
    message: `Inserted ${inserted} products, skipped ${skipped} duplicates.`,
  });
}
