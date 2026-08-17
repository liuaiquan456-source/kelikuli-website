// Registry of every translatable key introduced in Phase 1 (global chrome + homepage),
// used only to power the admin Translations screen (key discovery + English reference).
// Not used at runtime for rendering — each t(key, fallback) call site is authoritative
// for its own English fallback text.
export interface TranslationKeyEntry {
  key: string;
  section: string;
  en: string;
}

export const TRANSLATION_KEYS: TranslationKeyEntry[] = [
  // Header
  { key: "header.nav.home", section: "Header", en: "Home" },
  { key: "header.nav.products", section: "Header", en: "Products" },
  { key: "header.nav.custom", section: "Header", en: "Custom Service" },
  { key: "header.nav.news", section: "Header", en: "News" },
  { key: "header.nav.faq", section: "Header", en: "FAQ" },
  { key: "header.nav.about", section: "Header", en: "About Us" },
  { key: "header.nav.contact", section: "Header", en: "Contact" },
  { key: "header.inquiryNow", section: "Header", en: "Inquiry Now" },
  { key: "header.search", section: "Header", en: "Search" },
  { key: "header.searchPlaceholder", section: "Header", en: "Search products, news..." },
  { key: "header.searchTypeProduct", section: "Header", en: "Product" },
  { key: "header.searchTypeNews", section: "Header", en: "News" },
  { key: "header.searchNoResults", section: "Header", en: "No results for" },
  { key: "header.searchHint", section: "Header", en: "Type to search products & news" },
  { key: "header.language", section: "Header", en: "Language" },
  { key: "header.wishlist", section: "Header", en: "Wishlist" },
  { key: "header.cart", section: "Header", en: "Cart" },

  // Footer
  { key: "footer.contactUs", section: "Footer", en: "Contact Us" },
  { key: "footer.companyName", section: "Footer", en: "Kelikuli Resin Toys & Crafts" },
  { key: "footer.whatsapp", section: "Footer", en: "WhatsApp" },
  { key: "footer.wechat", section: "Footer", en: "WeChat" },
  { key: "footer.aboutUs", section: "Footer", en: "About Us" },
  { key: "footer.about.profile", section: "Footer", en: "Company Profile" },
  { key: "footer.about.factory", section: "Footer", en: "Factory Advantage" },
  { key: "footer.about.oem", section: "Footer", en: "OEM/ODM Service" },
  { key: "footer.about.contact", section: "Footer", en: "Contact Us" },
  { key: "footer.product", section: "Footer", en: "Product" },
  { key: "footer.products.custom", section: "Footer", en: "Custom Resin Toys" },
  { key: "footer.products.blindBox", section: "Footer", en: "Blind Box Toys" },
  { key: "footer.products.figurines", section: "Footer", en: "Resin Figurines" },
  { key: "footer.products.festival", section: "Footer", en: "Festival Decorations" },
  { key: "footer.products.luckyCat", section: "Footer", en: "Lucky Cat Series" },
  { key: "footer.products.garden", section: "Footer", en: "Garden Series" },
  { key: "footer.news", section: "Footer", en: "News" },
  { key: "footer.news.company", section: "Footer", en: "Company News" },
  { key: "footer.news.updates", section: "Footer", en: "Product Updates" },
  { key: "footer.news.guide", section: "Footer", en: "Custom Resin Toy Guide" },
  { key: "footer.news.industry", section: "Footer", en: "Industry News" },
  { key: "footer.scanQr", section: "Footer", en: "Scan QR Code" },
  { key: "footer.scanToContact", section: "Footer", en: "Scan to contact us on WeChat" },
  { key: "footer.copyright", section: "Footer", en: "Kelikuli Resin Toys & Crafts. All Rights Reserved." },

  // Floating contact
  { key: "floatingContact.chatNow", section: "Floating Contact", en: "Chat Now" },
  { key: "floatingContact.wechatTitle", section: "Floating Contact", en: "WeChat" },
  { key: "floatingContact.wechatSubtitle", section: "Floating Contact", en: "Scan to add us on WeChat" },
  { key: "floatingContact.close", section: "Floating Contact", en: "Close" },

  // Breadcrumb
  { key: "breadcrumb.home", section: "Breadcrumb", en: "Home" },

  // Home — Hero
  { key: "home.hero.main.titleLine1", section: "Home / Hero", en: "Resin Figurine" },
  { key: "home.hero.main.titleLine2", section: "Home / Hero", en: "Manufacturer" },
  { key: "home.hero.main.subtitle", section: "Home / Hero", en: "Custom Resin Toy Factory | Blind Box Manufacturer | Wholesale Resin Figurines" },
  { key: "home.hero.main.badge", section: "Home / Hero", en: "Blind Box Customization" },
  { key: "home.hero.main.tagline", section: "Home / Hero", en: "Your Vision, Premium Excellence." },
  { key: "home.hero.main.check1", section: "Home / Hero", en: "OEM/ODM Custom Orders" },
  { key: "home.hero.main.check2", section: "Home / Hero", en: "Hand-Painted Quality" },
  { key: "home.hero.main.check3", section: "Home / Hero", en: "Low MOQ Accepted" },
  { key: "home.hero.main.check4", section: "Home / Hero", en: "Eco-friendly" },
  { key: "home.hero.getQuote", section: "Home / Hero", en: "Get a Quote" },
  { key: "home.hero.getQuoteLower", section: "Home / Hero", en: "Get a quote" },
  { key: "home.hero.lamp.titleLine1", section: "Home / Hero", en: "Resin Decoration" },
  { key: "home.hero.lamp.titleLine2", section: "Home / Hero", en: "Light" },
  { key: "home.hero.lamp.subtitle", section: "Home / Hero", en: "Handcrafted Resin Decor for Warm, Cozy Spaces" },
  { key: "home.hero.lamp.feature1", section: "Home / Hero", en: "Handcrafted Resin" },
  { key: "home.hero.lamp.feature2", section: "Home / Hero", en: "Warm Ambient Light" },
  { key: "home.hero.lamp.feature3", section: "Home / Hero", en: "Unique Gift Ideas" },
  { key: "home.hero.feature.oem", section: "Home / Hero", en: "OEM/ODM\nCustomization" },
  { key: "home.hero.feature.design", section: "Home / Hero", en: "Custom\nDesign" },
  { key: "home.hero.feature.moq", section: "Home / Hero", en: "Low MOQ\nManufacture" },
  { key: "home.hero.feature.global", section: "Home / Hero", en: "Global\nStandards" },
  { key: "home.hero.feature.qc", section: "Home / Hero", en: "Strict QC\nProcesses" },

  // Home — Featured collections
  { key: "home.featured.heading", section: "Home / Featured Collections", en: "Featured Resin Toy Collections" },
  { key: "home.featured.viewAll", section: "Home / Featured Collections", en: "View All Products" },
  { key: "home.featured.loading", section: "Home / Featured Collections", en: "Products loading..." },
  { key: "home.featured.badge1.title", section: "Home / Featured Collections", en: "Strict Quality Control" },
  { key: "home.featured.badge1.sub", section: "Home / Featured Collections", en: "From raw materials to finished products" },
  { key: "home.featured.badge2.title", section: "Home / Featured Collections", en: "OEM/ODM Support" },
  { key: "home.featured.badge2.sub", section: "Home / Featured Collections", en: "Low MOQ & flexible solutions" },
  { key: "home.featured.badge3.title", section: "Home / Featured Collections", en: "On-Time Delivery" },
  { key: "home.featured.badge3.sub", section: "Home / Featured Collections", en: "Fast lead time & reliable shipping" },
  { key: "home.featured.badge4.title", section: "Home / Featured Collections", en: "Worldwide Shipping" },
  { key: "home.featured.badge4.sub", section: "Home / Featured Collections", en: "Export to 30+ countries" },

  // Home — Category grid
  { key: "home.categories.eyebrow", section: "Home / Category Grid", en: "Our Products" },
  { key: "home.categories.heading", section: "Home / Category Grid", en: "Resin Craft Categories" },
  { key: "home.categories.intro", section: "Home / Category Grid", en: "From collectible figurines to branded blind boxes — we manufacture a wide range of hand-painted resin products for global buyers." },
  { key: "home.categories.learnMore", section: "Home / Category Grid", en: "Learn more" },
  { key: "home.categories.figurines.title", section: "Home / Category Grid", en: "Resin Figurines" },
  { key: "home.categories.figurines.description", section: "Home / Category Grid", en: "Hand-painted matte resin figurines for collectibles, retail, and brand gifting. Custom character development available." },
  { key: "home.categories.blindBox.title", section: "Home / Category Grid", en: "Blind Box Collectibles" },
  { key: "home.categories.blindBox.description", section: "Home / Category Grid", en: "Mystery blind box series with full art direction, packaging, and character IP development for brands and retailers." },
  { key: "home.categories.zakka.title", section: "Home / Category Grid", en: "Zakka Resin Ornaments" },
  { key: "home.categories.zakka.description", section: "Home / Category Grid", en: "Charming Zakka-style resin home decor — miniature figures, animals, and lifestyle pieces for wholesale and retail." },
  { key: "home.categories.seasonal.title", section: "Home / Category Grid", en: "Seasonal Resin Crafts" },
  { key: "home.categories.seasonal.description", section: "Home / Category Grid", en: "Christmas, Halloween, Easter, and holiday-themed resin gifts. Ready-to-wholesale seasonal collections updated annually." },
  { key: "home.categories.customToys.title", section: "Home / Category Grid", en: "Custom Resin Toys" },
  { key: "home.categories.customToys.description", section: "Home / Category Grid", en: "Fully custom resin toy development from sketch to mass production. OEM/ODM for brands, IPs, and promotional campaigns." },
  { key: "home.categories.snowGlobes.title", section: "Home / Category Grid", en: "Snow Globes & More" },
  { key: "home.categories.snowGlobes.description", section: "Home / Category Grid", en: "Resin snow globes, fridge magnets, and piggy banks. Great for souvenirs, promotional gifts, and gift shop wholesale." },

  // Home — Why choose
  { key: "home.whyChoose.heading", section: "Home / Why Choose", en: "Why Choose Kelikuli as Your Resin Figurine Manufacturer" },
  { key: "home.whyChoose.quality.title", section: "Home / Why Choose", en: "Good Product Quality" },
  { key: "home.whyChoose.quality.description", section: "Home / Why Choose", en: "We use premium materials and strict QC to deliver durable, safe and high-quality resin toys that meet global standards." },
  { key: "home.whyChoose.custom.title", section: "Home / Why Choose", en: "Custom-Made Service" },
  { key: "home.whyChoose.custom.description", section: "Home / Why Choose", en: "From concept to finished product, our custom resin toy factory provides full OEM/ODM solutions — design, molding, hand painting and packaging to match your brand vision." },
  { key: "home.whyChoose.support.title", section: "Home / Why Choose", en: "After-Sales Support" },
  { key: "home.whyChoose.support.description", section: "Home / Why Choose", en: "Our professional team offers fast response and reliable after-sales service, ensuring long-term partnerships and peace of mind." },
  { key: "home.whyChoose.reliable.title", section: "Home / Why Choose", en: "Reliable Factory Experience" },
  { key: "home.whyChoose.reliable.description", section: "Home / Why Choose", en: "Established in 2005, our polyresin figurine factory brings advanced equipment and skilled craftsmen to guarantee consistent quality and on-time delivery for wholesale orders worldwide." },

  // Home — Stats
  { key: "home.stats.founded", section: "Home / Stats", en: "Factory Founded" },
  { key: "home.stats.designs", section: "Home / Stats", en: "Product Designs" },
  { key: "home.stats.employees", section: "Home / Stats", en: "Company Employees" },
  { key: "home.stats.markets", section: "Home / Stats", en: "Export Markets" },

  // Home — Trusted brands
  { key: "home.trustedBrands.heading", section: "Home / Trusted Brands", en: "Trusted by Global Brands" },

  // Home — OEM process
  { key: "home.oemProcess.eyebrow", section: "Home / OEM Process", en: "One-Stop Service" },
  { key: "home.oemProcess.heading", section: "Home / OEM Process", en: "One-Stop OEM/ODM Resin Toy Service" },
  { key: "home.oemProcess.intro", section: "Home / OEM Process", en: "Kelikuli provides one-stop OEM/ODM resin toy services for brands, wholesalers, and gift companies. From 3D design, mold making, resin casting, hand painting to bulk production, we create custom resin figurines, blind box toys, ornaments, and collectible crafts." },
  { key: "home.oemProcess.learnMore", section: "Home / OEM Process", en: "Learn More About Our Process" },
  { key: "home.oemProcess.qualityBadge", section: "Home / OEM Process", en: "Quality in Every Step" },
  { key: "home.oemProcess.step1", section: "Home / OEM Process", en: "Idea & Artwork Review" },
  { key: "home.oemProcess.step2", section: "Home / OEM Process", en: "3D Design / Prototype" },
  { key: "home.oemProcess.step3", section: "Home / OEM Process", en: "Mold Development" },
  { key: "home.oemProcess.step4", section: "Home / OEM Process", en: "Resin Casting" },
  { key: "home.oemProcess.step5", section: "Home / OEM Process", en: "Hand Painting" },
  { key: "home.oemProcess.step6", section: "Home / OEM Process", en: "QC & Packaging" },

  // Home — Service section
  { key: "home.service.heading", section: "Home / Service", en: "Your Resin Figurine Supplier from China — Full-Service OEM/ODM" },
  { key: "home.service.intro", section: "Home / Service", en: "As a collectible figurine factory in Zhejiang, China, Kelikuli supports end-to-end orders from design consultation to global shipment. We specialize in wholesale resin Zakka decor figurines, seasonal resin figurine OEM for Christmas and Halloween, and custom blind box series — accepting resin figurine sample orders and bulk wholesale." },
  { key: "home.service.preSaleTitle", section: "Home / Service", en: "Pre-Sale Service" },
  { key: "home.service.preSale1", section: "Home / Service", en: "Understand your design needs and target market" },
  { key: "home.service.preSale2", section: "Home / Service", en: "Provide professional quotation and cost analysis" },
  { key: "home.service.preSale3", section: "Home / Service", en: "Offer MOQ and production solutions" },
  { key: "home.service.preSale4", section: "Home / Service", en: "Sample planning and sample confirmation" },
  { key: "home.service.productionTitle", section: "Home / Service", en: "Production Service" },
  { key: "home.service.production1", section: "Home / Service", en: "Confirm samples and approve for mass production" },
  { key: "home.service.production2", section: "Home / Service", en: "Track production progress and keep you updated" },
  { key: "home.service.production3", section: "Home / Service", en: "Strict quality control during production and before shipment" },
  { key: "home.service.production4", section: "Home / Service", en: "Professional packaging and on-time shipment" },

  // Home — Recommended collections
  { key: "home.recommended.heading", section: "Home / Recommended Collections", en: "Recommended Products" },
  { key: "home.recommended.viewAll", section: "Home / Recommended Collections", en: "View All Product Collections" },

  // Home — Latest products
  { key: "home.latestProducts.eyebrow", section: "Home / Latest Products", en: "New Arrivals" },
  { key: "home.latestProducts.heading", section: "Home / Latest Products", en: "Latest Products" },
  { key: "home.latestProducts.viewAll", section: "Home / Latest Products", en: "View All" },
  { key: "home.latestProducts.viewAllMobile", section: "Home / Latest Products", en: "View All Products" },

  // Home — Custom banner
  { key: "home.customBanner.heading", section: "Home / Custom Banner", en: "Custom Resin Toy OEM Factory — Your Vision, Our Craft" },
  { key: "home.customBanner.paragraph1", section: "Home / Custom Banner", en: "As a trusted resin figurine supplier from China, we help brands, wholesalers and creative studios turn original ideas into high-quality resin figurines, blind box collectibles and Zakka decor — from concept to finished product." },
  { key: "home.customBanner.paragraph2", section: "Home / Custom Banner", en: "Kelikuli is a custom resin toy manufacturer with low MOQ — supporting sample orders, small batches and large-volume wholesale resin figurines. Every piece is hand-painted by skilled craftsmen, making us the go-to resin toy OEM manufacturer for brands seeking quality and flexibility." },
  { key: "home.customBanner.cta", section: "Home / Custom Banner", en: "Get a Free Quote" },
  { key: "home.customBanner.highlight.design", section: "Home / Custom Banner", en: "Creative Design" },
  { key: "home.customBanner.highlight.quality", section: "Home / Custom Banner", en: "Premium Quality" },
  { key: "home.customBanner.highlight.global", section: "Home / Custom Banner", en: "Global Standards" },
  { key: "home.customBanner.highlight.delivery", section: "Home / Custom Banner", en: "Reliable Delivery" },

  // Home — Feature badges
  { key: "home.featureBadges.design.title", section: "Home / Feature Badges", en: "Original Design" },
  { key: "home.featureBadges.design.description", section: "Home / Feature Badges", en: "Turn your ideas into unique resin toys and collectible figurines." },
  { key: "home.featureBadges.quality.title", section: "Home / Feature Badges", en: "Quality Assurance" },
  { key: "home.featureBadges.quality.description", section: "Home / Feature Badges", en: "Strict quality control for hand-painted resin products." },
  { key: "home.featureBadges.oem.title", section: "Home / Feature Badges", en: "OEM & ODM Service" },
  { key: "home.featureBadges.oem.description", section: "Home / Feature Badges", en: "Custom design, mold development, painting and packaging." },
  { key: "home.featureBadges.global.title", section: "Home / Feature Badges", en: "Global Partner" },
  { key: "home.featureBadges.global.description", section: "Home / Feature Badges", en: "Trusted by brands, importers and wholesalers worldwide." },
];
