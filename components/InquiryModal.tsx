"use client";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/components/I18nProvider";
import ProductThumb from "@/components/ProductThumb";

const countryCodes = [
  { code: "+1",   label: "US/CA +1" },
  { code: "+44",  label: "UK +44" },
  { code: "+86",  label: "CN +86" },
  { code: "+81",  label: "JP +81" },
  { code: "+82",  label: "KR +82" },
  { code: "+49",  label: "DE +49" },
  { code: "+33",  label: "FR +33" },
  { code: "+39",  label: "IT +39" },
  { code: "+34",  label: "ES +34" },
  { code: "+61",  label: "AU +61" },
  { code: "+65",  label: "SG +65" },
  { code: "+852", label: "HK +852" },
  { code: "+886", label: "TW +886" },
  { code: "+91",  label: "IN +91" },
  { code: "+7",   label: "RU +7" },
  { code: "+55",  label: "BR +55" },
  { code: "+52",  label: "MX +52" },
  { code: "+971", label: "UAE +971" },
];

const productOptions = [
  "Brand Products",
  "Snow Globe",
  "Bobble Head",
  "Statue & Figurine & Sculpture",
  "Photo Frame",
  "Fridge Magnet",
  "Piggy Bank",
  "Other Resin Crafts",
];

const productOptionKeys: Record<string, string> = {
  "Brand Products": "inquiryModal.product.brand",
  "Snow Globe": "inquiryModal.product.snowGlobe",
  "Bobble Head": "inquiryModal.product.bobbleHead",
  "Statue & Figurine & Sculpture": "inquiryModal.product.statue",
  "Photo Frame": "inquiryModal.product.photoFrame",
  "Fridge Magnet": "inquiryModal.product.fridgeMagnet",
  "Piggy Bank": "inquiryModal.product.piggyBank",
  "Other Resin Crafts": "inquiryModal.product.other",
};

interface CartItem {
  id: number;
  name: string;
  category: string;
  image?: string;
  quantity?: number;
  moq?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cartProducts?: CartItem[];
  defaultEmail?: string;
}

// Map product category strings to productOptions checkboxes
function mapCategoryToOption(category: string): string | null {
  const c = category.toLowerCase();
  if (c.includes("fridge") || c.includes("magnet")) return "Fridge Magnet";
  if (c.includes("bobble")) return "Bobble Head";
  if (c.includes("snow")) return "Snow Globe";
  if (c.includes("piggy")) return "Piggy Bank";
  if (c.includes("photo") || c.includes("frame")) return "Photo Frame";
  if (c.includes("brand")) return "Brand Products";
  if (c.includes("resin light") || c.includes("figurine") || c.includes("statue") || c.includes("astronaut") || c.includes("garden") || c.includes("prince") || c.includes("lucky") || c.includes("blind") || c.includes("religious") || c.includes("phone")) return "Statue & Figurine & Sculpture";
  return "Other Resin Crafts";
}

export default function InquiryModal({ isOpen, onClose, cartProducts, defaultEmail }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    email: "",
    countryCode: "+1",
    phone: "",
    name: "",
    company: "",
    products: [] as string[],
    message: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Pre-fill form when cartProducts are provided and modal opens
  useEffect(() => {
    if (!isOpen || !cartProducts || cartProducts.length === 0) return;
    const productList = cartProducts
      .map((p, i) => `${i + 1}. ${p.name} (${p.category}) — Qty: ${p.quantity ?? p.moq ?? "N/A"}`)
      .join("\n");
    const autoMessage = `I'm interested in the following products:\n${productList}\n\nPlease provide pricing and MOQ information.`;
    const autoCategories = [...new Set(cartProducts.map((p) => mapCategoryToOption(p.category)).filter(Boolean) as string[])];
    setForm((f) => ({ ...f, message: autoMessage, products: autoCategories }));
  }, [isOpen, cartProducts]);

  // Pre-fill the email from the linked cart account, if any.
  useEffect(() => {
    if (!isOpen || !defaultEmail) return;
    setForm((f) => (f.email ? f : { ...f, email: defaultEmail }));
  }, [isOpen, defaultEmail]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleProduct = (p: string) => {
    setForm((f) => ({
      ...f,
      products: f.products.includes(p)
        ? f.products.filter((x) => x !== p)
        : [...f.products, p],
    }));
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []).slice(0, 5);
    setFiles(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:      form.name,
          company:   form.company,
          email:     form.email,
          phone:     form.countryCode + " " + form.phone,
          product:   form.products.join(", "),
          message:   form.message,
          cartItems: cartProducts ?? [],
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError(t("inquiryModal.submitError", "Failed to submit. Please try again or contact us directly."));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError("");
    setForm({ email: "", countryCode: "+1", phone: "", name: "", company: "", products: [], message: "" });
    setFiles([]);
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
    >
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col ${cartProducts && cartProducts.length > 0 ? "max-w-4xl" : "max-w-xl"}`}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors z-10"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-1 min-h-0">
          {/* Left: cart product list */}
          {cartProducts && cartProducts.length > 0 && (
            <div className="w-60 shrink-0 border-r border-stone-100 bg-[#FAFAF9] flex flex-col">
              <div className="px-4 py-5 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#C9A55A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  <h3 className="text-xs font-black uppercase tracking-widest text-stone-600">
                    {t("inquiryModal.selected", "Selected")} <span className="text-orange-500">({cartProducts.length})</span>
                  </h3>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {cartProducts.map((p) => (
                  <div key={p.id} className="flex gap-2.5 p-2 bg-white rounded-xl border border-stone-100">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-stone-50">
                      <ProductThumb src={p.image} alt={p.name} className="w-12 h-12" imgClassName="w-12 h-12 object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-stone-700 line-clamp-2 leading-snug">{p.name}</p>
                      <p className="text-[10px] text-orange-500 font-semibold mt-0.5">{p.category}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">{t("inquiryModal.qty", "Qty")}: {p.quantity ?? p.moq ?? "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Right: form */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-7 py-8">
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">{t("inquiryModal.submittedTitle", "Inquiry Submitted!")}</h3>
              <p className="text-stone-500 text-sm mb-6">{t("inquiryModal.submittedDesc", "Our representative will contact you soon.")}</p>
              <button onClick={handleClose} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
                {t("inquiryModal.close", "Close")}
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-stone-900 text-center mb-1">{t("inquiryModal.title", "Get a Free Quote")}</h2>
              <p className="text-stone-500 text-sm text-center mb-7">{t("inquiryModal.submittedDesc", "Our representative will contact you soon.")}</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    <span className="text-red-500 mr-0.5">*</span>{t("inquiryModal.email", "Email")}
                  </label>
                  <div className="relative">
                    <input
                      required type="email" maxLength={100}
                      placeholder={t("inquiryModal.emailPlaceholder", "Please enter your email address")}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm pr-16 focus:outline-none focus:border-orange-400 transition-colors"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 text-xs">{form.email.length}/100</span>
                  </div>
                </div>

                {/* Mobile/WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    <span className="text-red-500 mr-0.5">*</span>{t("inquiryModal.mobile", "Mobile / WhatsApp")}
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-white shrink-0"
                      value={form.countryCode}
                      onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <input
                        required type="tel" maxLength={100}
                        placeholder={t("inquiryModal.mobilePlaceholder", "Please enter your mobile phone")}
                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm pr-16 focus:outline-none focus:border-orange-400 transition-colors"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 text-xs">{form.phone.length}/100</span>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    <span className="text-red-500 mr-0.5">*</span>{t("inquiryModal.name", "Name")}
                  </label>
                  <div className="relative">
                    <input
                      required type="text" maxLength={100}
                      placeholder={t("inquiryModal.namePlaceholder", "Please enter your name")}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm pr-16 focus:outline-none focus:border-orange-400 transition-colors"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 text-xs">{form.name.length}/100</span>
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">{t("inquiryModal.company", "Company Name")}</label>
                  <div className="relative">
                    <input
                      type="text" maxLength={200}
                      placeholder={t("inquiryModal.companyPlaceholder", "Please enter your company name")}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm pr-16 focus:outline-none focus:border-orange-400 transition-colors"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 text-xs">{form.company.length}/200</span>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2.5">
                    <span className="text-red-500 mr-0.5">*</span>{t("inquiryModal.productsLabel", "What products can I offer you")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {productOptions.map((p) => (
                      <label key={p} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.products.includes(p)}
                          onChange={() => toggleProduct(p)}
                          className="w-4 h-4 rounded border-stone-300 accent-orange-500 cursor-pointer"
                        />
                        <span className="text-sm text-stone-600 group-hover:text-stone-900">{t(productOptionKeys[p], p)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* File upload */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    {t("inquiryModal.uploadLabel", "Upload product images / files")}
                  </label>
                  <div
                    className="border-2 border-dashed border-stone-200 rounded-xl p-5 text-center cursor-pointer hover:border-orange-300 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    <svg className="w-7 h-7 text-stone-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    {files.length > 0 ? (
                      <p className="text-sm text-[#C9A55A] font-medium">{files.length} {t("inquiryModal.filesSelected", "file(s) selected")}</p>
                    ) : (
                      <p className="text-stone-400 text-xs leading-relaxed">
                        {t("inquiryModal.uploadHint", "Up to 5 files, max 30MB each")}<br />
                        jpg, jpeg, png, pdf, doc, docx, xls, xlsx, csv, txt
                      </p>
                    )}
                    <input
                      ref={fileRef} type="file" multiple className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                      onChange={handleFiles}
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    <span className="text-red-500 mr-0.5">*</span>{t("inquiryModal.message", "Message")}
                  </label>
                  <div className="relative">
                    <textarea
                      required rows={4} maxLength={1000}
                      placeholder={t("inquiryModal.messagePlaceholder", "Which products are you interested in? and what is the quantity?")}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-orange-400 transition-colors"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                    <span className="absolute right-3 bottom-3 text-stone-300 text-xs">{form.message.length}/1000</span>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-xs text-center">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors text-sm tracking-wide"
                >
                  {loading ? t("inquiryModal.submitting", "Submitting...") : t("inquiryModal.submit", "Submit")}
                </button>
              </form>
            </>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
