import { PrismaClient } from "@prisma/client";
import { allProducts } from "../data/products-data";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();

  for (const p of allProducts) {
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
  }

  const total = await prisma.product.count();
  console.log(`✓ 已导入 ${total} 个产品`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
