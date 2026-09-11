"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import InquiryModal from "@/components/InquiryModal";
import ProductImage from "@/components/ProductImage";
import { useTranslation } from "@/components/I18nProvider";

interface Variant { name: string; image: string; }

interface Product {
  id: number; name: string; category: string; image: string;
  price: number; moq: number; leadTime: string; status: string;
  description: string; specs: string; tags: string[];
  variants?: Variant[];
  images?: string[];
  video?: string;
}

type Translator = (key: string, fallback: string) => string;

function getAttributes(name: string, category: string, t: Translator) {
  const n = name.toLowerCase();

  let application: [string, string] = ["product.attrValue.homeDecoration", "Home Decoration"];
  if (n.includes("garden") || n.includes("outdoor") || n.includes("solar")) application = ["product.attrValue.gardenOutdoor", "Garden / Outdoor"];
  if (n.includes("christmas") || n.includes("halloween")) application = ["product.attrValue.holidayDecoration", "Holiday Decoration"];
  if (n.includes("kids") || n.includes("children")) application = ["product.attrValue.kidsRoomDecor", "Kids Room Decor"];

  let productType: [string, string] = ["product.attrValue.resinFigurine", "Resin Figurine"];
  if (n.includes("vase")) productType = ["product.attrValue.vase", "Vase"];
  if (n.includes("snow globe") || n.includes("water ball")) productType = ["product.attrValue.snowGlobe", "Snow Globe"];
  if (n.includes("piggy bank") || n.includes("coin bank") || n.includes("money")) productType = ["product.attrValue.piggyBank", "Piggy Bank"];
  if (n.includes("magnet")) productType = ["product.attrValue.fridgeMagnet", "Fridge Magnet"];
  if (n.includes("blind box") || n.includes("mystery")) productType = ["product.attrValue.blindBox", "Blind Box"];
  if (n.includes("phone stand") || n.includes("phone holder")) productType = ["product.attrValue.phoneStand", "Phone Stand"];
  if (n.includes("light") || n.includes("solar") || n.includes("lamp")) productType = ["product.attrValue.ledLight", "LED Light"];
  if (n.includes("bobble")) productType = ["product.attrValue.bobbleHead", "Bobble Head"];
  if (n.includes("statue") || n.includes("sculpture")) productType = ["product.attrValue.statueSculpture", "Statue / Sculpture"];

  const moqCount = category === "Snow Globe" || category === "Blind Box Series" ? 100 : 50;
  const moqValue = `${moqCount} ${t("product.attrValue.pcs", "pcs")}`;

  return [
    { id: "application", key: t("product.attrLabel.application", "Application"),   value: t(application[0], application[1]) },
    { id: "productType", key: t("product.attrLabel.productType", "Product Type"),  value: t(productType[0], productType[1]) },
    { id: "material",    key: t("product.attrLabel.material", "Material"),         value: t("product.attrValue.resin", "Resin") },
    { id: "brandName",   key: t("product.attrLabel.brandName", "Brand Name"),       value: "Kelikuli" },
    { id: "placeOrigin", key: t("product.attrLabel.placeOrigin", "Place of Origin"), value: t("product.attrValue.zhejiang", "Zhejiang, China") },
    { id: "size",        key: t("product.attrLabel.size", "Size"),                  value: t("product.attrValue.customSize", "Custom Size Accepted") },
    { id: "moq",         key: "MOQ",                                                value: moqValue },
    { id: "oemOdm",      key: "OEM / ODM",                                          value: t("product.attrValue.available", "Available") },
    { id: "leadTime",    key: t("product.attrLabel.leadTime", "Lead Time"),          value: t("product.attrValue.leadTimeDefault", "30 – 45 Days") },
  ];
}

export default function ProductDetailClient({
  product,
  related,
  whatsappLink,
}: {
  product: Product | null;
  related: Product[];
  whatsappLink: string;
}) {
  const { t } = useTranslation();
  const [activeImg, setActiveImg] = useState(0);
  const [activeVariant, setActiveVariant] = useState<number | null>(null);
  const [imgError, setImgError] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"photos" | "video">("photos");
  const thumbScrollRef = useRef<HTMLDivElement>(null);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-stone-500 text-lg">{t("product.notFound", "Product not found.")}</p>
        <Link href="/products" className="text-[#C9A55A] font-semibold hover:underline">
          ← {t("product.backToProducts", "Back to Products")}
        </Link>
      </div>
    );
  }

  const variants = product.variants?.filter((v) => v.name || v.image) ?? [];
  const productImages = (product.images?.filter(Boolean) ?? []).length > 0
    ? product.images!.filter(Boolean)
    : product.image ? [product.image] : [];
  const mainImage = activeVariant !== null && variants[activeVariant]?.image
    ? variants[activeVariant].image
    : productImages[activeImg] ?? productImages[0] ?? "";
  const attrs = getAttributes(product.name, product.category, t).map((a) => {
    if (a.id === "moq") return { ...a, value: product.moq ? `${product.moq} ${t("product.attrValue.pcs", "pcs")}` : a.value };
    if (a.id === "leadTime") return { ...a, value: product.leadTime || a.value };
    return a;
  });

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1600px] mx-auto px-0 sm:px-6 py-0 sm:py-8">

          {/* Main content */}
          <div className="w-full">
          {/* Main Card */}
          <div className="bg-white rounded-none sm:rounded-2xl shadow-sm border-0 sm:border border-stone-100">
            <div className="flex flex-col lg:flex-row">

              {/* Image Gallery with tabs */}
              <div className="lg:w-[45%] p-4 sm:p-5 flex flex-col gap-4">

                {/* Tab bar */}
                <div className="flex border-b border-stone-200">
                  {(["photos", ...(product.video ? (["video"] as const) : [])] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                        activeTab === tab
                          ? "border-stone-800 text-stone-800"
                          : "border-transparent text-stone-400 hover:text-stone-600"
                      }`}
                    >
                      {tab === "photos" ? t("product.tab.photos", "Photos") : t("product.tab.video", "Video")}
                    </button>
                  ))}
                </div>

                {/* Photos tab */}
                {activeTab === "photos" && (
                  <>
                    <div className="relative aspect-[4/3] bg-stone-50 rounded-xl overflow-hidden group">
                      {mainImage && !imgError ? (
                        <Image
                          src={mainImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 55vw"
                          className="object-contain transition-transform duration-300 group-hover:scale-105"
                          onError={() => setImgError(true)}
                          priority
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm">{t("product.noImage", "No image")}</div>
                      )}
                      {productImages.length > 1 && (
                        <>
                          <button
                            onClick={() => { setActiveImg((i) => (i - 1 + productImages.length) % productImages.length); setActiveVariant(null); setImgError(false); }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center text-stone-600 hover:bg-white transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => { setActiveImg((i) => (i + 1) % productImages.length); setActiveVariant(null); setImgError(false); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center text-stone-600 hover:bg-white transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>

                    {productImages.length > 1 && (
                      <div className="relative">
                        <div
                          ref={thumbScrollRef}
                          className="flex gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                          {productImages.map((src, i) => (
                            <button
                              key={i}
                              onClick={() => { setActiveImg(i); setActiveVariant(null); setImgError(false); }}
                              className={`relative shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                                activeVariant === null && i === activeImg ? "border-[#C9A55A]" : "border-stone-200 hover:border-stone-300"
                              }`}
                            >
                              <ProductImage src={src} alt={`${product.name} — image ${i + 1}`} sizes="64px" className="object-cover" />
                            </button>
                          ))}
                        </div>
                        {productImages.length > 7 && (
                          <>
                            <button
                              type="button"
                              onClick={() => thumbScrollRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
                              className="absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white shadow border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => thumbScrollRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
                              className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-1/2 w-7 h-7 rounded-full bg-white shadow border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Video tab */}
                {activeTab === "video" && (
                  <div className="aspect-video bg-black rounded-xl overflow-hidden">
                    {product.video ? (
                      <video src={product.video} controls className="w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm">{t("product.noVideo", "No video available")}</div>
                    )}
                  </div>
                )}

                {variants.length > 0 && (
                  <div className="pt-2 border-t border-stone-100">
                    <p className="text-xs font-black text-stone-500 uppercase tracking-wider mb-2">{t("product.availableOptions", "Available Options")}</p>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setActiveVariant(activeVariant === i ? null : i); setImgError(false); }}
                          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border-2 transition-colors ${
                            activeVariant === i ? "border-[#C9A55A] bg-orange-50" : "border-stone-200 hover:border-[#C9A55A]/50 bg-white"
                          }`}
                        >
                          {v.image && (
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-stone-50">
                              <ProductImage src={v.image} alt={v.name} sizes="56px" className="object-cover" />
                            </div>
                          )}
                          {v.name && (
                            <span className={`text-[10px] font-medium max-w-[72px] text-center leading-tight ${
                              activeVariant === i ? "text-[#C9A55A]" : "text-stone-600"
                            }`}>{v.name}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other product photos, shown full-width one after another like a detail page */}
                {productImages.length > 1 && (
                  <div className="flex flex-col gap-3 pt-2 border-t border-stone-100">
                    {productImages.map((src, i) => (
                      <div key={i} className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-50">
                        <ProductImage
                          src={src}
                          alt={`${product.name} — image ${i + 1}`}
                          sizes="(max-width: 1024px) 100vw, 45vw"
                          className="object-contain"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="lg:w-[55%] p-6 lg:p-8 flex flex-col border-t lg:border-t-0 lg:border-l border-stone-100 lg:self-start lg:sticky lg:bottom-4">
                <span className="inline-flex items-center gap-1.5 w-fit bg-orange-50 text-[#C9A55A] text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  {product.category}
                </span>

                <h1 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug mb-4">
                  {product.name}
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-5 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#C9A55A]/15 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-[#C9A55A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{t("product.companyName", "Yiwu Kelikuli Cultural & Creative Co., Ltd.")}</p>
                      <p className="text-xs text-stone-400">{t("product.companyMeta", "Zhejiang, China · Est. 2005")}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInquiryOpen(true)}
                    className="shrink-0 bg-[#E8561C] hover:bg-[#D14D18] text-white font-bold py-2.5 px-6 rounded-full transition-colors text-sm shadow-sm"
                  >
                    {t("contact.sendInquiry", "Send Inquiry")}
                  </button>
                </div>

                <Link
                  href="/contact"
                  className="lg:hidden block text-center mb-6 border-2 border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white font-bold py-3 rounded-full transition-colors text-sm"
                >
                  {t("floatingContact.chatNow", "Chat Now")}
                </Link>

                <div className="mb-6">
                  <h2 className="text-sm font-black text-stone-800 uppercase tracking-wider mb-3">{t("product.keyAttributes", "Key Attributes")}</h2>
                  <div className="rounded-xl border border-stone-100 overflow-hidden">
                    {attrs.map((attr, i) => (
                      <div key={attr.key} className={`flex text-sm ${i % 2 === 0 ? "bg-stone-50" : "bg-white"}`}>
                        <div className="w-[42%] px-4 py-2.5 text-stone-500 font-medium shrink-0">{attr.key}</div>
                        <div className="flex-1 px-4 py-2.5 text-stone-800 font-semibold border-l border-stone-100">{attr.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {product.description && (
                  <div className="mb-6">
                    <h2 className="text-sm font-black text-stone-800 uppercase tracking-wider mb-3">{t("product.description", "Product Description")}</h2>
                    <div className="text-base text-stone-600 leading-relaxed whitespace-pre-line">{product.description}</div>
                  </div>
                )}

                <div className="bg-orange-50 rounded-xl px-4 py-3 mt-auto text-xs text-stone-600 flex items-start gap-2">
                  <svg className="w-4 h-4 text-[#C9A55A] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  <span>{t("product.shippingNotice", "Shipping negotiated per order.")} <strong>{t("product.oemWelcome", "OEM/ODM custom orders welcome.")}</strong></span>
                </div>
              </div>

            </div>
          </div>

          {/* Specifications */}
          {product.specs && (
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
              <h2 className="text-sm font-black text-stone-800 uppercase tracking-wider mb-4">{t("product.specifications", "Specifications")}</h2>
              <div className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{product.specs}</div>
            </div>
          )}

          {/* Related Products */}
          {related.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[#C9A55A]">✦</span>
                <h2 className="text-lg font-black text-stone-800 uppercase tracking-widest">{t("product.relatedProducts", "Related Products")}</h2>
                <span className="text-[#C9A55A]">✦</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-square bg-stone-50 overflow-hidden">
                      <ProductImage
                        src={p.image}
                        alt={p.name}
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-stone-700 text-xs font-medium line-clamp-2 leading-snug">{p.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-10 bg-gradient-to-br from-stone-900 to-stone-700 rounded-2xl p-8 sm:p-10 text-center">
            <h2 className="text-white text-lg sm:text-xl font-black uppercase tracking-widest mb-2">
              {t("product.ctaTitle", "Ready to Order or Need a Custom Quote?")}
            </h2>
            <p className="text-stone-300 text-sm mb-6 max-w-xl mx-auto">
              {t("product.ctaSubtitle", "Get in touch with our team for pricing, samples, and OEM/ODM options.")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setInquiryOpen(true)}
                className="w-full sm:w-auto bg-[#E8561C] hover:bg-[#D14D18] text-white font-bold py-3 px-8 rounded-full transition-colors text-sm shadow-sm"
              >
                {t("contact.sendInquiry", "Send Inquiry")}
              </button>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-8 rounded-full transition-colors text-sm shadow-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.876.51 3.633 1.396 5.144L2 22l4.978-1.36A9.955 9.955 0 0012.001 22C17.523 22 22 17.523 22 12S17.523 2 12.001 2zm0 18.2a8.174 8.174 0 01-4.418-1.294l-.317-.19-3.005.82.812-2.937-.207-.303A8.173 8.173 0 013.8 12c0-4.522 3.679-8.2 8.2-8.2 4.522 0 8.2 3.678 8.2 8.2 0 4.522-3.678 8.2-8.199 8.2z" />
                </svg>
                {t("product.chatOnWhatsapp", "Chat on WhatsApp")}
              </a>
            </div>
          </div>
          </div>{/* end main content */}
        </div>
      </div>

      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </>
  );
}
