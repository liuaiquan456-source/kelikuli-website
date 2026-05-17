"use client";
import { useState } from "react";
import Link from "next/link";
import InquiryModal from "@/components/InquiryModal";

function SafeImg({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [ok, setOk] = useState(!src.startsWith("blob:"));
  if (!ok) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setOk(false)} />;
}

interface Variant { name: string; image: string; }

interface Product {
  id: number; name: string; category: string; image: string;
  price: number; moq: number; leadTime: string; status: string;
  description: string; specs: string; tags: string[];
  variants?: Variant[];
  images?: string[];
}

function getAttributes(name: string, category: string) {
  const n = name.toLowerCase();

  let application = "Home Decoration";
  if (n.includes("garden") || n.includes("outdoor") || n.includes("solar")) application = "Garden / Outdoor";
  if (n.includes("christmas") || n.includes("halloween")) application = "Holiday Decoration";
  if (n.includes("kids") || n.includes("children")) application = "Kids Room Decor";

  let productType = "Resin Figurine";
  if (n.includes("vase")) productType = "Vase";
  if (n.includes("snow globe") || n.includes("water ball")) productType = "Snow Globe";
  if (n.includes("piggy bank") || n.includes("coin bank") || n.includes("money")) productType = "Piggy Bank";
  if (n.includes("magnet")) productType = "Fridge Magnet";
  if (n.includes("blind box") || n.includes("mystery")) productType = "Blind Box";
  if (n.includes("phone stand") || n.includes("phone holder")) productType = "Phone Stand";
  if (n.includes("light") || n.includes("solar") || n.includes("lamp")) productType = "LED Light";
  if (n.includes("bobble")) productType = "Bobble Head";
  if (n.includes("statue") || n.includes("sculpture")) productType = "Statue / Sculpture";

  let style = "Cute / Cartoon";
  if (n.includes("astronaut") || n.includes("space")) style = "Sci-Fi / Astronaut";
  if (n.includes("prince") || n.includes("princess") || n.includes("fairy")) style = "Fairy Tale";
  if (n.includes("animal") || n.includes("cat") || n.includes("rabbit") || n.includes("panda")) style = "Animal";
  if (n.includes("religious") || n.includes("angel") || n.includes("buddha")) style = "Religious";
  if (n.includes("halloween")) style = "Halloween";
  if (n.includes("christmas") || n.includes("santa")) style = "Christmas";

  let moq = "50 pcs";
  if (category === "Snow Globe" || category === "Blind Box Series") moq = "100 pcs";

  return [
    { key: "Application",     value: application },
    { key: "Product Type",    value: productType },
    { key: "Material",        value: "Resin" },
    { key: "Technique",       value: "Handmade / Hand-Painted" },
    { key: "Style",           value: style },
    { key: "Feature",         value: "Custom Design Available" },
    { key: "Brand Name",      value: "Kelikuli" },
    { key: "Place of Origin", value: "Zhejiang, China" },
    { key: "Size",            value: "Custom Size Accepted" },
    { key: "MOQ",             value: moq },
    { key: "OEM / ODM",       value: "Available" },
    { key: "Lead Time",       value: "30 – 45 Days" },
  ];
}

export default function ProductDetailClient({
  product,
  related,
}: {
  product: Product | null;
  related: Product[];
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [activeVariant, setActiveVariant] = useState<number | null>(null);
  const [imgError, setImgError] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F4ED] flex flex-col items-center justify-center gap-4">
        <p className="text-stone-500 text-lg">Product not found.</p>
        <Link href="/products" className="text-[#C9A55A] font-semibold hover:underline">
          ← Back to Products
        </Link>
      </div>
    );
  }

  const variants = product.variants?.filter((v) => v.name || v.image) ?? [];
  const productImages = (product.images?.filter(Boolean) ?? []).length > 0
    ? product.images!.filter(Boolean)
    : product.image ? [product.image] : [];
  const images = activeVariant !== null && variants[activeVariant]?.image
    ? [variants[activeVariant].image]
    : productImages;
  const attrs = getAttributes(product.name, product.category).map((a) => {
    if (a.key === "MOQ") return { ...a, value: product.moq ? `${product.moq} pcs` : a.value };
    if (a.key === "Lead Time") return { ...a, value: product.leadTime || a.value };
    return a;
  });

  return (
    <>
      <div className="min-h-screen bg-[#F8F4ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8 items-start">

          {/* Left sidebar — same category */}
          {related.length > 0 && (
            <aside className="w-full lg:w-56 shrink-0 lg:sticky lg:top-20">
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-2">
                  <span className="text-[#C9A55A] text-xs">✦</span>
                  <h2 className="text-xs font-black uppercase tracking-widest text-stone-700">Same Category</h2>
                </div>
                <div className="p-3 space-y-3">
                  {related.slice(0, 6).map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      className="group flex items-center gap-3 hover:bg-[#F5EDD8] rounded-xl p-2 transition-colors"
                    >
                      <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-stone-100">
                        {p.image
                          ? <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          : <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">No img</div>
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-stone-700 group-hover:text-[#C9A55A] transition-colors line-clamp-2 leading-snug">{p.name}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">{p.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-stone-100">
                  <Link
                    href={`/products?category=${encodeURIComponent(product.category)}`}
                    className="text-xs font-semibold text-[#C9A55A] hover:text-[#B8935A] transition-colors flex items-center gap-1"
                  >
                    More {product.category}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </aside>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="flex flex-col lg:flex-row">

              {/* Image Gallery */}
              <div className="lg:w-[55%] p-5 flex flex-col gap-4">
                <div className="relative aspect-square bg-stone-50 rounded-xl overflow-hidden group">
                  {images.length > 0 && !imgError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={images[activeImg]}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm">No image</div>
                  )}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center text-stone-600 hover:bg-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center text-stone-600 hover:bg-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => { setActiveImg(i); setImgError(false); }}
                        className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                          i === activeImg ? "border-[#C9A55A]" : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`${product.name} — image ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {variants.length > 0 && (
                  <div className="pt-2 border-t border-stone-100">
                    <p className="text-xs font-black text-stone-500 uppercase tracking-wider mb-2">Available Options</p>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setActiveVariant(activeVariant === i ? null : i); setImgError(false); }}
                          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border-2 transition-colors ${
                            activeVariant === i ? "border-[#C9A55A] bg-[#F5EDD8]" : "border-stone-200 hover:border-[#C9A55A]/50 bg-white"
                          }`}
                        >
                          {v.image && (
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-50">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
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
              </div>

              {/* Product Info */}
              <div className="lg:w-[45%] p-6 lg:p-8 flex flex-col border-t lg:border-t-0 lg:border-l border-stone-100">
                <span className="inline-flex items-center gap-1.5 w-fit bg-[#F5EDD8] text-[#C9A55A] text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  {product.category}
                </span>

                <h1 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug mb-4">
                  {product.name}
                </h1>

                <div className="flex items-center gap-2 mb-5 pb-5 border-b border-stone-100">
                  <div className="w-7 h-7 rounded-full bg-[#C9A55A]/15 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#C9A55A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">Yiwu Kelikuli Cultural &amp; Creative Co., Ltd.</p>
                    <p className="text-xs text-stone-400">Zhejiang, China · Est. 2005</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-sm font-black text-stone-800 uppercase tracking-wider mb-3">Key Attributes</h2>
                  <div className="rounded-xl border border-stone-100 overflow-hidden">
                    {attrs.map((attr, i) => (
                      <div key={attr.key} className={`flex text-sm ${i % 2 === 0 ? "bg-stone-50" : "bg-white"}`}>
                        <div className="w-[42%] px-4 py-2.5 text-stone-500 font-medium shrink-0">{attr.key}</div>
                        <div className="flex-1 px-4 py-2.5 text-stone-800 font-semibold border-l border-stone-100">{attr.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#F5EDD8]/60 rounded-xl px-4 py-3 mb-6 text-xs text-stone-600 flex items-start gap-2">
                  <svg className="w-4 h-4 text-[#C9A55A] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  <span>Shipping negotiated per order. <strong>OEM/ODM custom orders welcome.</strong></span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                  <button
                    onClick={() => setInquiryOpen(true)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-sm"
                  >
                    Send Inquiry
                  </button>
                  <Link
                    href="/contact"
                    className="flex-1 border-2 border-[#C9A55A] text-[#C9A55A] hover:bg-[#C9A55A] hover:text-white font-bold py-3 rounded-xl transition-colors text-sm text-center"
                  >
                    Chat Now
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* Description & Specs */}
          {(product.description || product.specs) && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {product.description && (
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                  <h2 className="text-sm font-black text-stone-800 uppercase tracking-wider mb-4">Product Description</h2>
                  <div className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{product.description}</div>
                </div>
              )}
              {product.specs && (
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                  <h2 className="text-sm font-black text-stone-800 uppercase tracking-wider mb-4">Specifications</h2>
                  <div className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{product.specs}</div>
                </div>
              )}
            </div>
          )}

          {/* Related Products */}
          {related.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[#C9A55A]">✦</span>
                <h2 className="text-lg font-black text-stone-800 uppercase tracking-widest">Related Products</h2>
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
                      {p.image && (
                        <SafeImg
                          src={p.image}
                          alt={p.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-stone-700 text-xs font-medium line-clamp-2 leading-snug">{p.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          </div>{/* end flex-1 */}
        </div>
      </div>

      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </>
  );
}
