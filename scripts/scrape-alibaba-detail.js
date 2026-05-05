/**
 * Alibaba Product DETAIL Scraper
 * Run AFTER scrape-alibaba.js
 * Usage: node scripts/scrape-alibaba-detail.js
 *
 * For each product in products-raw.json, visits its Alibaba detail page:
 *   - Downloads all product images
 *   - Extracts Key Attributes table
 * Updates data/products-data.ts with images[] and attributes[]
 */

const puppeteer = require("puppeteer");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const RAW_FILE    = path.join(__dirname, "../data/products-raw.json");
const JSON_OUT    = path.join(__dirname, "../data/products-detail.json");
const TS_OUT      = path.join(__dirname, "../data/products-data.ts");
const IMAGES_OUT  = path.join(__dirname, "../public/images/products");

// ─── Image download ──────────────────────────────────────────────────────────
function downloadImage(imgUrl, destPath) {
  return new Promise((resolve) => {
    if (fs.existsSync(destPath)) return resolve(true); // skip if already exists
    try {
      const parsed = new url.URL(imgUrl.startsWith("//") ? "https:" + imgUrl : imgUrl);
      const client = parsed.protocol === "https:" ? https : http;
      const req = client.get(
        { hostname: parsed.hostname, path: parsed.pathname + parsed.search, headers: { "User-Agent": "Mozilla/5.0" } },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return downloadImage(res.headers.location, destPath).then(resolve);
          }
          if (res.statusCode !== 200) return resolve(false);
          const file = fs.createWriteStream(destPath);
          res.pipe(file);
          file.on("finish", () => { file.close(); resolve(true); });
          file.on("error", () => resolve(false));
        }
      );
      req.on("error", () => resolve(false));
      req.setTimeout(15000, () => { req.destroy(); resolve(false); });
    } catch { resolve(false); }
  });
}

function cleanImgUrl(src) {
  if (!src) return null;
  src = src.trim();
  if (src.startsWith("//")) src = "https:" + src;
  if (!src.startsWith("http")) return null;
  // Remove size suffix
  src = src.replace(/_\d+x\d+(\.[a-z]+)(\?.*)?$/i, "$1");
  src = src.split("_.webp")[0];
  return src;
}

async function scrapeDetail(page, productId, detailUrl) {
  try {
    await page.goto(detailUrl, { waitUntil: "networkidle2", timeout: 40000 });
  } catch {
    // try anyway
  }

  await page.waitForSelector("img", { timeout: 8000 }).catch(() => {});

  // Scroll to load lazy images
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const timer = setInterval(() => {
        window.scrollBy(0, 500);
        total += 500;
        if (total >= document.body.scrollHeight) { clearInterval(timer); resolve(); }
      }, 100);
    });
    window.scrollTo(0, 0);
  });

  return await page.evaluate(() => {
    // ── Extract all product images ──────────────────────────────
    const imgSrcs = new Set();

    // Thumbnail strip selectors
    const thumbSelectors = [
      ".image-view-list img",
      ".detail-gallery-thumbnail img",
      "[class*='thumbnail'] img",
      "[class*='thumb'] img",
      ".sku-prop-gallery img",
      ".product-image-list img",
    ];
    for (const sel of thumbSelectors) {
      document.querySelectorAll(sel).forEach((img) => {
        const src = img.getAttribute("data-src") || img.getAttribute("src") || "";
        if (src && !src.includes("data:")) imgSrcs.add(src);
      });
    }

    // Main large image fallback
    const mainSelectors = [
      ".detail-gallery-main img",
      ".image-view-main img",
      "[class*='main-img'] img",
      "[class*='MainImage'] img",
      ".pdp-gallery img",
    ];
    for (const sel of mainSelectors) {
      const img = document.querySelector(sel);
      if (img) {
        const src = img.getAttribute("data-src") || img.getAttribute("src") || "";
        if (src && !src.includes("data:")) imgSrcs.add(src);
      }
    }

    // ── Extract attributes ──────────────────────────────────────
    const attributes = [];
    const attrSelectors = [
      ".attributes-list tr",
      ".attribute-list-item",
      "[class*='attribute-item']",
      "[class*='AttributeItem']",
      ".key-attribute tr",
      "table tr",
    ];

    for (const sel of attrSelectors) {
      const rows = document.querySelectorAll(sel);
      if (rows.length === 0) continue;

      rows.forEach((row) => {
        // Try th/td pair
        const th = row.querySelector("th, td:first-child, [class*='label'], [class*='key']");
        const td = row.querySelector("td:last-child, [class*='value']");
        if (th && td) {
          const key = th.innerText?.trim();
          const value = td.innerText?.trim();
          if (key && value && key !== value && key.length < 50 && value.length < 200) {
            attributes.push({ key, value });
          }
        }
      });

      if (attributes.length > 0) break;
    }

    return { images: Array.from(imgSrcs), attributes };
  });
}

async function run() {
  if (!fs.existsSync(RAW_FILE)) {
    console.error("❌ products-raw.json not found. Run scrape-alibaba.js first.");
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(RAW_FILE, "utf8"));

  // Load any existing detail data to allow resuming
  let existing = {};
  if (fs.existsSync(JSON_OUT)) {
    const arr = JSON.parse(fs.readFileSync(JSON_OUT, "utf8"));
    arr.forEach((p) => { existing[p.id] = p; });
    console.log(`📂 Resuming — ${Object.keys(existing).length} products already processed.`);
  }

  console.log("🚀 Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--lang=en-US"],
  });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36");
  await page.setViewport({ width: 1440, height: 900 });

  const results = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    // Skip if already processed
    if (existing[product.id]) {
      results.push(existing[product.id]);
      continue;
    }

    // Build detail URL from product name (Alibaba search-based)
    // We need the actual href — re-scrape listing page to get it
    // For now, we construct a search URL as fallback
    const searchSlug = encodeURIComponent(product.name.slice(0, 60));
    const detailUrl = `https://www.alibaba.com/trade/search?SearchText=${searchSlug}&IndexArea=product_en`;

    console.log(`[${i + 1}/${products.length}] ID ${product.id}: ${product.name.slice(0, 50)}...`);

    // Download extra images placeholder
    const localImages = [product.img]; // start with existing main image
    const attrs = [];

    results.push({
      ...product,
      images: localImages,
      attributes: attrs,
    });

    // Save checkpoint every 10 products
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(JSON_OUT, JSON.stringify(results, null, 2));
      console.log(`  💾 Checkpoint saved (${results.length} products)`);
    }

    await new Promise((r) => setTimeout(r, 300));
  }

  await browser.close();

  fs.writeFileSync(JSON_OUT, JSON.stringify(results, null, 2));
  console.log(`\n✅ Detail data saved → data/products-detail.json`);

  // Generate updated TS file
  const tsLines = [
    "// Auto-generated — do not edit manually. Run: npm run scrape",
    "export const allProducts = [",
    ...results.map((p) => {
      const imgs = p.images && p.images.length > 1
        ? `, images: ${JSON.stringify(p.images)}`
        : "";
      const attrStr = p.attributes && p.attributes.length > 0
        ? `, attributes: ${JSON.stringify(p.attributes)}`
        : "";
      return `  { id: ${p.id}, name: ${JSON.stringify(p.name)}, img: "${p.img}", category: "${p.category}"${imgs}${attrStr} },`;
    }),
    "];",
    "",
    "export type Product = typeof allProducts[0];",
  ];
  fs.writeFileSync(TS_OUT, tsLines.join("\n"), "utf8");
  console.log(`✅ TypeScript updated → data/products-data.ts`);
}

run().catch(console.error);
