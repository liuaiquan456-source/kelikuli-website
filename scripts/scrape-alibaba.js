/**
 * Alibaba Store Product Scraper
 * Usage: node scripts/scrape-alibaba.js
 *
 * Scrapes products from https://klkl.en.alibaba.com/productlist.html
 * Downloads images to public/images/products/
 * Outputs data/products-raw.json + data/products-data.ts
 */

const puppeteer = require("puppeteer");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const STORE_URL = "https://klkl.en.alibaba.com/productlist.html";
const IMAGES_OUT = path.join(__dirname, "../public/images/products");
const JSON_OUT   = path.join(__dirname, "../data/products-raw.json");
const TS_OUT     = path.join(__dirname, "../data/products-data.ts");

// ─── Category keyword mapping ────────────────────────────────────────────────
const CATEGORY_MAP = [
  { keywords: ["halloween", "pumpkin", "witch", "ghost", "skeleton"], category: "Halloween Series" },
  { keywords: ["christmas", "santa", "xmas", "snowman", "elf", "reindeer"], category: "Christmas Series" },
  { keywords: ["garden", "gnome", "mushroom", "outdoor", "flower", "fairy"], category: "Garden Series" },
  { keywords: ["snow globe", "water ball", "snowglobe"], category: "Snow Globe" },
  { keywords: ["bobble", "bobblehead", "nodding"], category: "Bobble Head Series" },
  { keywords: ["fridge magnet", "refrigerator magnet"], category: "Fridge Magnet" },
  { keywords: ["piggy bank", "coin bank", "money box", "saving bank"], category: "Piggy Bank" },
  { keywords: ["blind box", "mystery box", "blind bag"], category: "Blind Box Series" },
  { keywords: ["prince", "princess", "fairy tale"], category: "Prince Series" },
  { keywords: ["lucky cat", "maneki", "fortune cat"], category: "Lucky Cat" },
  { keywords: ["astronaut", "space", "spaceman"], category: "Astronaut Series" },
  { keywords: ["figurine", "statue", "sculpture", "figure"], category: "Figurines" },
  { keywords: ["religious", "angel", "church", "cross", "buddha"], category: "Religious Crafts" },
  { keywords: ["light", "solar", "led", "lamp"], category: "Smart Outdoor Lights" },
  { keywords: ["resin", "craft", "ornament", "decor", "decoration"], category: "Resin Crafts" },
];

function guessCategory(name) {
  const lower = name.toLowerCase();
  for (const { keywords, category } of CATEGORY_MAP) {
    if (keywords.some((k) => lower.includes(k))) return category;
  }
  return "Brand Products";
}

// ─── Image download ──────────────────────────────────────────────────────────
function downloadImage(imgUrl, destPath) {
  return new Promise((resolve) => {
    try {
      const parsed = new url.URL(imgUrl);
      const client = parsed.protocol === "https:" ? https : http;
      const req = client.get(
        { hostname: parsed.hostname, path: parsed.pathname + parsed.search, headers: { "User-Agent": "Mozilla/5.0" } },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return downloadImage(res.headers.location, destPath).then(resolve);
          }
          if (res.statusCode !== 200) { console.warn(`  ⚠ HTTP ${res.statusCode} for image`); return resolve(false); }
          const file = fs.createWriteStream(destPath);
          res.pipe(file);
          file.on("finish", () => { file.close(); resolve(true); });
          file.on("error", () => resolve(false));
        }
      );
      req.on("error", () => resolve(false));
      req.setTimeout(15000, () => { req.destroy(); resolve(false); });
    } catch {
      resolve(false);
    }
  });
}

// ─── Clean up Alibaba image URL (get higher resolution) ─────────────────────
function cleanImgUrl(src) {
  if (!src) return null;
  // Remove size suffix like _220x220, _350x350 etc.
  src = src.replace(/_\d+x\d+(\.[a-z]+)$/i, "$1");
  // Remove webp format params and get jpg
  src = src.split("_.webp")[0];
  if (!src.startsWith("http")) {
    src = "https:" + src;
  }
  return src;
}

// ─── Main scraper ─────────────────────────────────────────────────────────────
async function scrape() {
  if (!fs.existsSync(IMAGES_OUT)) fs.mkdirSync(IMAGES_OUT, { recursive: true });

  console.log("🚀 Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--lang=en-US"],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );
  await page.setViewport({ width: 1440, height: 900 });
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

  const allRaw = [];
  let pageNum = 1;

  while (true) {
    const pageUrl = pageNum === 1
      ? STORE_URL
      : `${STORE_URL}?page=${pageNum}`;

    console.log(`\n📄 Scraping page ${pageNum}: ${pageUrl}`);
    try {
      await page.goto(pageUrl, { waitUntil: "networkidle2", timeout: 45000 });
    } catch {
      console.warn("  ⚠ Page load timeout, trying anyway...");
    }

    // Wait for any product container to appear
    await page
      .waitForSelector(
        [
          ".list-item",
          ".product-item",
          "[class*='product-card']",
          "[class*='ProductCard']",
          ".offer-list-row li",
          ".organic-list-offer-outter",
          ".list-col",
        ].join(", "),
        { timeout: 12000 }
      )
      .catch(() => console.warn("  ⚠ Product selector timeout"));

    // Scroll to trigger lazy-load images
    await autoScroll(page);

    // Save debug screenshot on first page
    if (pageNum === 1) {
      const ssPath = path.join(__dirname, "../data/debug-screenshot.png");
      await page.screenshot({ path: ssPath, fullPage: false });
      console.log(`  📸 Debug screenshot → data/debug-screenshot.png`);
    }

    // Extract products from the page
    const products = await page.evaluate(() => {
      const results = [];

      // Strategy 1: Generic product card containers
      const strategies = [
        { container: ".list-item",                    img: "img", name: ".product-name, .title, h3, h2" },
        { container: ".product-item",                 img: "img", name: ".product-name, .title, h3, h2" },
        { container: "[class*='product-card']",       img: "img", name: "[class*='name'], [class*='title'], h3" },
        { container: "[class*='offer-item']",         img: "img", name: "[class*='offer-title'], h3, .title" },
        { container: ".organic-list-offer-outter",    img: "img", name: ".title, h3" },
        { container: ".list-col > li",                img: "img", name: ".title, h3" },
        { container: "ul.list li",                   img: "img", name: ".title, h3, .name" },
      ];

      for (const s of strategies) {
        const containers = document.querySelectorAll(s.container);
        if (containers.length < 2) continue;

        containers.forEach((card) => {
          const imgEl = card.querySelector(s.img);
          const nameEl = card.querySelector(s.name);
          if (!imgEl || !nameEl) return;

          const name = nameEl.innerText?.trim();
          if (!name || name.length < 3) return;

          // Try multiple src attributes for lazy-loaded images
          const src =
            imgEl.getAttribute("data-src") ||
            imgEl.getAttribute("data-lazy-src") ||
            imgEl.getAttribute("data-original") ||
            imgEl.src ||
            "";

          if (!src || src.includes("data:image")) return;
          results.push({ name, src });
        });

        if (results.length > 0) break;
      }

      return results;
    });

    if (products.length === 0) {
      console.log("  ✖ No products found — saving page HTML for debugging...");
      const html = await page.content();
      fs.writeFileSync(
        path.join(__dirname, `../data/debug-page${pageNum}.html`),
        html
      );
      console.log(`  Saved debug-page${pageNum}.html — stopping.`);
      break;
    }

    console.log(`  ✔ Found ${products.length} products`);
    allRaw.push(...products);

    // Check if there's a next page
    const hasNext = await page.evaluate(() => {
      const selectors = [
        ".next-btn:not(.disabled)",
        "a[class*='next']:not([class*='disabled'])",
        "a[rel='next']",
        ".pagination .next:not(.disabled)",
        "button[class*='next']:not(:disabled)",
      ];
      return selectors.some((s) => {
        const el = document.querySelector(s);
        return el && el.offsetParent !== null; // visible
      });
    });

    if (!hasNext || pageNum >= 20) {
      console.log("  ✔ No more pages.");
      break;
    }

    pageNum++;
    // Polite delay between pages
    await new Promise((r) => setTimeout(r, 2500));
  }

  await browser.close();

  if (allRaw.length === 0) {
    console.log("\n❌ No products scraped. Check data/debug-page1.html to inspect the page structure.");
    return;
  }

  // ─── Download images & build final data ────────────────────────────────────
  console.log(`\n📦 Processing ${allRaw.length} products...`);
  const finalProducts = [];

  for (let i = 0; i < allRaw.length; i++) {
    const { name, src } = allRaw[i];
    const id = i + 1;
    const cleanSrc = cleanImgUrl(src);
    const ext = (cleanSrc?.split(".").pop()?.split("?")[0] || "jpg").toLowerCase();
    const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
    const filename = `product-${String(id).padStart(3, "0")}.${safeExt}`;
    const localPath = `/images/products/${filename}`;
    const fullDest = path.join(IMAGES_OUT, filename);

    process.stdout.write(`  [${id}/${allRaw.length}] Downloading ${filename}...`);
    const ok = cleanSrc ? await downloadImage(cleanSrc, fullDest) : false;
    console.log(ok ? " ✔" : " ✖ (skipped)");

    finalProducts.push({
      id,
      name,
      img: ok ? localPath : "/images/collections/col-1.png",
      category: guessCategory(name),
    });
  }

  // ─── Save JSON ────────────────────────────────────────────────────────────
  fs.writeFileSync(JSON_OUT, JSON.stringify(finalProducts, null, 2), "utf8");
  console.log(`\n✅ JSON saved → data/products-raw.json`);

  // ─── Generate TypeScript data file ────────────────────────────────────────
  const tsLines = [
    "// Auto-generated by scripts/scrape-alibaba.js — do not edit manually",
    "export const allProducts = [",
    ...finalProducts.map((p) =>
      `  { id: ${p.id}, name: ${JSON.stringify(p.name)}, img: "${p.img}", category: "${p.category}" },`
    ),
    "];",
    "",
    "export type Product = typeof allProducts[0];",
  ];
  fs.writeFileSync(TS_OUT, tsLines.join("\n"), "utf8");
  console.log(`✅ TypeScript saved → data/products-data.ts`);
  console.log(`\n📊 Summary: ${finalProducts.length} products scraped across ${pageNum} page(s).`);
  console.log("\nNext step: import allProducts from '@/data/products-data' in app/products/page.tsx");
}

// ─── Auto-scroll to trigger lazy loading ────────────────────────────────────
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 120);
    });
  });
}

scrape().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
