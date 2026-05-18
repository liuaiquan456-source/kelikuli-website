import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const images = [
  "/images/products/resin-light-moon-1.jpg",
  "/images/products/resin-light-moon-2.jpg",
  "/images/products/resin-light-moon-3.jpg",
  "/images/products/resin-light-moon-4.jpg",
  "/images/products/resin-light-moon-5.jpg",
  "/images/products/resin-light-moon-6.jpg",
];

const product = await prisma.product.create({
  data: {
    name: "Decorations Home Lamp Art Resin Decoration Abstraction Body Character Sculpture With Moon Light Lamp",
    category: "Resin Light",
    price: 0,
    moq: 50,
    leadTime: "30-45 days",
    status: "active",
    image: images[0],
    images: JSON.stringify(images),
    tags: JSON.stringify(["resin light", "moon lamp", "body sculpture", "decoration"]),
    variants: JSON.stringify([]),
    description: "",
    specs: "",
    seoTitle: "Resin Moon Light Lamp Body Sculpture — Kelikuli Manufacturer",
    seoDesc: "Wholesale resin moon light lamp with abstract body character sculpture. Factory-direct from Kelikuli, Zhejiang China. Low MOQ, OEM/ODM available.",
    seoKeywords: "resin moon lamp, body sculpture light, resin decoration lamp, wholesale",
    video: "",
  },
});

console.log("✓ Product created, ID:", product.id);
await prisma.$disconnect();
