import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.setting.deleteMany();

  await prisma.product.createMany({
    data: [
      { name: "Cute Santa Claus Snowman Bear Mini Resin Statue",          category: "Christmas Series",   price: 4.80,  stock: 500, moq: 100, leadTime: "30-45 days", status: "active",   image: "/images/products/product-001.jpg", tags: '["christmas","santa","snowman"]' },
      { name: "Resin Hand-Painted Panda Astronaut Statue",                 category: "Astronaut Series",   price: 6.20,  stock: 320, moq: 50,  leadTime: "30-45 days", status: "active",   image: "/images/products/product-002.jpg", tags: '["astronaut","panda","space"]' },
      { name: "Custom Resin Rabbit Phone Stand Figurine with Crown",       category: "Phone Stand",        price: 5.50,  stock: 200, moq: 50,  leadTime: "25-35 days", status: "active",   image: "/images/products/product-003.jpg", tags: '["phone stand","rabbit"]' },
      { name: "Cute Cartoon Hand-painted Resin Animal Figurine",           category: "Figurines",          price: 3.80,  stock: 0,   moq: 100, leadTime: "30-45 days", status: "inactive", image: "/images/products/product-004.jpg", tags: '["animal","figurine"]' },
      { name: "Resin Beach Fat Lady Swimsuit Figurine Desktop Decoration", category: "Figurines",          price: 7.50,  stock: 150, moq: 50,  leadTime: "30-45 days", status: "active",   image: "/images/products/product-009.jpg", tags: '["figurine","beach","funny"]' },
      { name: "Little Prince Resin Figurine Gift Set",                     category: "Prince Series",      price: 12.00, stock: 80,  moq: 30,  leadTime: "35-50 days", status: "active",   image: "/images/products/product-013.jpg", tags: '["prince","gift","couple"]' },
      { name: "Halloween Pumpkin Ghost Resin Decoration Set",              category: "Halloween Series",   price: 8.50,  stock: 400, moq: 100, leadTime: "30-45 days", status: "active",   image: "/images/products/product-020.jpg", tags: '["halloween","pumpkin","ghost"]' },
      { name: "Garden Gnome Mushroom Outdoor Resin Decoration",            category: "Garden Series",      price: 9.00,  stock: 260, moq: 50,  leadTime: "30-45 days", status: "active",   image: "/images/products/product-025.jpg", tags: '["garden","gnome","outdoor"]' },
      { name: "Classic Snow Globe Music Box Water Ball",                   category: "Snow Globe",         price: 15.00, stock: 120, moq: 30,  leadTime: "40-55 days", status: "active",   image: "/images/products/product-030.jpg", tags: '["snow globe","music box"]' },
      { name: "Lucky Cat Fortune Resin Figurine Gold Color",               category: "Lucky Cat",          price: 5.00,  stock: 350, moq: 100, leadTime: "25-35 days", status: "active",   image: "/images/products/product-035.jpg", tags: '["lucky cat","fortune","gold"]' },
      { name: "Cute Animal Piggy Bank Resin Coin Saving Box",              category: "Piggy Bank",         price: 6.80,  stock: 0,   moq: 50,  leadTime: "30-45 days", status: "inactive", image: "/images/products/product-040.jpg", tags: '["piggy bank","coin","saving"]' },
      { name: "Blind Box Mystery Figurine Series 6 Designs",               category: "Blind Box Series",   price: 10.00, stock: 600, moq: 60,  leadTime: "35-50 days", status: "active",   image: "/images/products/product-045.jpg", tags: '["blind box","mystery","collectible"]' },
      { name: "Bobble Head Cartoon Character Resin Nodding Doll",          category: "Bobble Head Series", price: 7.20,  stock: 180, moq: 50,  leadTime: "30-45 days", status: "active",   image: "/images/products/product-050.jpg", tags: '["bobble head","nodding","car"]' },
      { name: "Fridge Magnet Resin Souvenir Decorative Set of 4",          category: "Fridge Magnet",      price: 3.50,  stock: 800, moq: 200, leadTime: "20-30 days", status: "active",   image: "/images/products/product-055.jpg", tags: '["fridge magnet","souvenir"]' },
      { name: "Angel Wings Religious Cross Resin Statue Home Decor",       category: "Religious Crafts",   price: 8.00,  stock: 90,  moq: 50,  leadTime: "30-45 days", status: "active",   image: "/images/products/product-060.jpg", tags: '["religious","angel","cross"]' },
    ],
  });

  await prisma.order.create({ data: { id:"ORD-2026-001", customer:"James Wilson",    email:"james@toystrade.com",   company:"Toys Trade LLC",     country:"United States", total:4250, currency:"USD", status:"confirmed",  createdAt:new Date("2026-05-01T09:15:00"), items:{ create:[
    { productName:"Cute Santa Claus Snowman Bear Mini Resin Statue", category:"Christmas Series", qty:500, unitPrice:4.80,  total:2400, status:"confirmed", notes:"" },
    { productName:"Little Prince Resin Figurine Gift Set",           category:"Prince Series",   qty:150, unitPrice:12.00, total:1800, status:"sourcing",  notes:"Check stock" },
    { productName:"Fridge Magnet Resin Souvenir Set",                category:"Fridge Magnet",  qty:50,  unitPrice:1.00,  total:50,   status:"pending",   notes:"" },
  ]}}});

  await prisma.order.create({ data: { id:"ORD-2026-002", customer:"Sophie Martin",   email:"sophie@deco-paris.fr",  company:"Deco Paris",         country:"France",        total:1980, currency:"USD", status:"processing", createdAt:new Date("2026-04-28T14:30:00"), items:{ create:[
    { productName:"Garden Gnome Mushroom Outdoor Resin Decoration", category:"Garden Series", qty:220, unitPrice:9.00, total:1980, status:"in_production", notes:"Custom color: green" },
  ]}}});

  await prisma.order.create({ data: { id:"ORD-2026-003", customer:"Ahmed Al-Rashid", email:"ahmed@gulfimport.ae",   company:"Gulf Import Co.",    country:"UAE",           total:6800, currency:"USD", status:"shipped",    createdAt:new Date("2026-04-20T08:00:00"), items:{ create:[
    { productName:"Lucky Cat Fortune Resin Figurine Gold Color",  category:"Lucky Cat",        qty:800, unitPrice:5.00,  total:4000, status:"shipped", notes:"" },
    { productName:"Classic Snow Globe Music Box Water Ball",      category:"Snow Globe",       qty:180, unitPrice:15.00, total:2700, status:"shipped", notes:"Fragile packaging" },
    { productName:"Angel Wings Religious Cross Resin Statue",     category:"Religious Crafts", qty:25,  unitPrice:4.00,  total:100,  status:"shipped", notes:"" },
  ]}}});

  await prisma.order.create({ data: { id:"ORD-2026-004", customer:"Maria Garcia",    email:"maria@tiendas.es",      company:"Tiendas España",    country:"Spain",         total:2600, currency:"USD", status:"pending",    createdAt:new Date("2026-05-02T11:45:00"), items:{ create:[
    { productName:"Blind Box Mystery Figurine Series",        category:"Blind Box Series",   qty:200, unitPrice:10.00, total:2000, status:"pending", notes:"" },
    { productName:"Bobble Head Cartoon Character Resin Doll", category:"Bobble Head Series", qty:80,  unitPrice:7.50,  total:600,  status:"pending", notes:"Car decoration" },
  ]}}});

  await prisma.order.create({ data: { id:"ORD-2026-005", customer:"Kenji Tanaka",    email:"kenji@japan-gifts.jp",  company:"Japan Gifts Import", country:"Japan",         total:3150, currency:"USD", status:"confirmed",  createdAt:new Date("2026-04-25T07:20:00"), items:{ create:[
    { productName:"Cute Cartoon Resin Animal Figurine",     category:"Figurines",        qty:500, unitPrice:3.80, total:1900, status:"in_stock",  notes:"" },
    { productName:"Resin Beach Fat Lady Swimsuit Figurine", category:"Figurines",        qty:150, unitPrice:7.50, total:1125, status:"confirmed", notes:"" },
    { productName:"Halloween Pumpkin Ghost Resin Set",      category:"Halloween Series", qty:25,  unitPrice:5.00, total:125,  status:"cancelled", notes:"Customer changed mind" },
  ]}}});

  await prisma.order.create({ data: { id:"ORD-2026-006", customer:"Lisa Chen",       email:"lisa@hkgifts.hk",       company:"HK Gifts Trading",   country:"Hong Kong",     total:1440, currency:"USD", status:"cancelled",  createdAt:new Date("2026-04-15T16:00:00"), items:{ create:[
    { productName:"Cute Animal Piggy Bank Resin Coin Box", category:"Piggy Bank",   qty:200, unitPrice:6.80, total:1360, status:"cancelled", notes:"Out of budget" },
    { productName:"Fridge Magnet Resin Souvenir Set",      category:"Fridge Magnet",qty:80,  unitPrice:1.00, total:80,   status:"cancelled", notes:"" },
  ]}}});

  await prisma.adminUser.createMany({ data: [
    { name:"Admin Master",   email:"admin@kelikuli.com",     role:"Super Admin", status:"active",   password:"admin123"  },
    { name:"Liu Aiquan",     email:"liuaiquan456@gmail.com", role:"Super Admin", status:"active",   password:"admin123"  },
    { name:"Sales Manager",  email:"sales@kelikuli.com",     role:"Admin",       status:"active",   password:"admin123"  },
    { name:"Content Editor", email:"editor@kelikuli.com",    role:"Editor",      status:"inactive", password:"editor123" },
  ]});

  await prisma.setting.createMany({ data: [
    { key:"siteName",    value:"Kelikuli" },
    { key:"siteTagline", value:"Custom Resin Toys & Crafts Manufacturer" },
    { key:"siteEmail",   value:"liuaiquan456@gmail.com" },
    { key:"whatsapp",    value:"+8613566668888" },
    { key:"wechat",      value:"kelikuli_official" },
    { key:"phone",       value:"+8613566668888" },
    { key:"metaTitle",   value:"Kelikuli - Custom Resin Toys & Figurines Manufacturer" },
    { key:"metaDesc",    value:"Professional OEM/ODM resin toys, figurines, and crafts manufacturer from China." },
  ]});

  const [pc, oc, uc] = await Promise.all([prisma.product.count(), prisma.order.count(), prisma.adminUser.count()]);
  console.log(`✓ Seeded: ${pc} products, ${oc} orders, ${uc} users`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
