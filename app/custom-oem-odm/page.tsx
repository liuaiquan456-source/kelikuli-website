import Link from "next/link";
import Image from "next/image";
import InquiryModal from "@/components/InquiryModal";
import InquiryButton from "@/components/InquiryButton";

const features = [
  {
    label: "AI Design",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    label: "Hand-Painted",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    label: "Independent Development",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  {
    label: "OEM/ODM Customization",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Factory Direct Supply",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
];

const steps = [
  { num: "1", label: "Concept &\nAI Design",     img: "/images/process/process-1.png" },
  { num: "2", label: "Mold\nMaking",              img: "/images/process/process-2.png" },
  { num: "3", label: "Sample\nProduction",        img: "/images/process/process-3.png" },
  { num: "4", label: "Hand\nPainting",            img: "/images/process/process-2.png" },
  { num: "5", label: "Mass\nProduction",          img: "/images/process/process-4.png" },
  { num: "6", label: "Packaging &\nDelivery",     img: "/images/process/process-3.png" },
];

const highlights = [
  { label: "Cute Animals Series",       img: "/images/collections/col-7.png" },
  { label: "Lovely Little Pigs Series", img: "/images/collections/col-2.png" },
  { label: "Relaxing Capybara Series",  img: "/images/collections/col-3.png" },
  { label: "Sweet Bear Series",         img: "/images/collections/col-4.png" },
  { label: "Mixed Cute Series",         img: "/images/collections/col-8.png" },
];

export default function CustomServicePage() {
  return (
    <div className="bg-white">

      {/* ── Hero Banner ── */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "480px" }}>
        {/* Background banner image */}
        <Image
          src="/images/2222.png"
          alt="Kelikuli resin toy collections"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Gradient overlay — stronger on left for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 max-w-2xl">
            <p className="text-[#C9A55A] text-xs font-bold uppercase tracking-widest mb-3">OEM / ODM Custom Service</p>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
              Kelikuli Resin Toy Series<br />
              <span className="text-[#C9A55A]">Customizable and Handcrafted</span> Collectibles
            </h1>
            <h2 className="text-base font-semibold text-stone-200 mb-3">Discover Our Unique Resin Toy Collections</h2>
            <p className="text-stone-300 text-sm leading-relaxed mb-8 max-w-xl">
              At Kelikuli, we specialize in creating high-quality resin toys and collectible figurines with an artistic touch. We provide both OEM and ODM services to help you bring your unique ideas to life.
            </p>
            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              {[
                {
                  label: "Creative Design",
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                    </svg>
                  ),
                },
                {
                  label: "Premium Quality",
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  ),
                },
                {
                  label: "Collectibles with Heart",
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  ),
                },
              ].map((b) => (
                <span key={b.label} className="flex items-center gap-2 border border-[#C9A55A]/60 rounded-full px-4 py-1.5 text-sm text-[#F5EDD8] bg-black/30 backdrop-blur-sm">
                  <span className="text-[#C9A55A]">{b.icon}</span> {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature strip ── */}
      <section className="bg-[#F8F4ED] border-y border-[#C4A97A]/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {features.map((f, i) => (
              <div key={f.label} className={`flex flex-col items-center text-center gap-2 ${i >= 3 ? "hidden sm:flex" : ""}`}>
                <div className="w-14 h-14 rounded-full border border-[#C9A55A]/40 bg-white flex items-center justify-center text-[#C9A55A]">
                  {f.icon}
                </div>
                <p className="text-stone-700 text-xs font-semibold leading-tight">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Manufacturing process ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-black text-stone-900 text-center mb-10">
            One-Stop Resin Toy Manufacturing Service
          </h2>
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
            {steps.map((step, i) => (
              <div key={step.num} className="flex items-center gap-1 shrink-0">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-[#C9A55A]/30 shadow-md">
                    <Image src={step.img} alt={step.label.replace("\n", " ")} fill className="object-cover" sizes="96px" />
                    <div className="absolute inset-0 bg-black/20 flex items-end justify-center pb-1">
                      <span className="text-white font-black text-lg leading-none">{step.num}</span>
                    </div>
                  </div>
                  <p className="text-stone-700 text-xs font-semibold text-center whitespace-pre-line leading-tight">{step.label}</p>
                </div>
                {i < steps.length - 1 && (
                  <svg className="w-5 h-5 text-[#C9A55A] shrink-0 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Series highlights ── */}
      <section className="py-12 bg-[#F8F4ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-black text-stone-900 text-center mb-8">Resin Toy Series Highlights</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
            {highlights.map((h) => (
              <div key={h.label} className="flex-none w-44 snap-start">
                <div className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                  <Image src={h.img} alt={h.label} fill className="object-cover hover:scale-105 transition-transform duration-300" sizes="176px" />
                </div>
                <p className="text-stone-700 text-xs font-semibold text-center mt-2">{h.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content section 1: Customized for your brand ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-black text-stone-900 mb-4">Customized Collectibles for Your Brand</h2>
              <p className="text-stone-500 text-sm leading-relaxed mb-4">
                Our resin toy collection is designed for businesses looking to create exciting, collectible products that engage consumers. These figurines are perfect for promotional campaigns, limited-edition products, or exclusive collections. With customized designs tailored to your brand's theme, you can offer consumers the thrill of surprise with every purchase.
              </p>
              <p className="text-stone-500 text-sm leading-relaxed">
                Whether you want cute animal figures, seasonal themes, or character-driven designs, our OEM/ODM services will ensure your product series is unique and aligned with your brand's identity.
              </p>
            </div>
            <div className="flex-1 w-full max-w-md">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                <Image src="/images/collections/col-3.png" alt="Custom resin figurines for brand" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 440px" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content section 2: Handcrafted excellence ── */}
      <section className="py-16 bg-[#F8F4ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row-reverse gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-black text-stone-900 mb-4">Handcrafted Excellence in Every Piece</h2>
              <p className="text-stone-500 text-sm leading-relaxed mb-4">
                Each figurine in our collection is handcrafted by skilled artisans, ensuring exceptional detail and quality in every piece. We specialize in hand-painted resin figurines, giving each one a distinct personality and charm. From the initial sculpting to the final hand-painted details, every figure is crafted with care to provide a high-quality, collectible product that will stand out on any shelf.
              </p>
              <p className="text-stone-500 text-sm leading-relaxed">
                With our customization options, you can choose from a variety of designs, sizes, and themes to create a figurine series that appeals to your target market. Our artists work closely with you to ensure your vision is brought to life with accuracy and creativity.
              </p>
            </div>
            <div className="flex-1 w-full max-w-md">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                <Image src="/images/process/process-2.png" alt="Handcrafted resin toy painting" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 440px" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content section 3: AI design ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 w-full max-w-md">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                <Image src="/images/process/process-1.png" alt="AI-driven resin toy design" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 440px" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-stone-900 mb-4">AI-Driven Design and Innovative Concepts</h2>
              <p className="text-stone-500 text-sm leading-relaxed mb-4">
                At Kelikuli, we combine traditional craftsmanship with the power of AI design to create innovative resin toy concepts. Our AI-driven design process allows us to explore multiple concepts quickly and efficiently, resulting in unique, original figurines that are both visually appealing and culturally relevant.
              </p>
              <p className="text-stone-500 text-sm leading-relaxed">
                By blending AI technology with manual craftsmanship, we ensure that our designs are not only creative but also precise and consistent. This combination of traditional and modern techniques guarantees that every figurine meets the highest standards of quality and artistry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content section 4: Flexible manufacturing ── */}
      <section className="py-16 bg-[#F8F4ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-black text-stone-900 mb-4">Flexible Manufacturing Solutions for Your Project</h2>
              <p className="text-stone-500 text-sm leading-relaxed mb-4">
                Looking for a reliable partner to manufacture your custom resin toy series? Kelikuli offers flexible custom manufacturing services to meet your production needs. From small batch production to large-scale runs, we can handle projects of any size and complexity. Our flexible lead times and global shipping solutions ensure that your series reaches customers on time and at competitive prices.
              </p>
              <p className="text-stone-500 text-sm leading-relaxed">
                We work with businesses of all sizes, from independent creators to large global brands, providing turnkey solutions for resin toy production. With our end-to-end services, you get everything from design to manufacturing to packaging and shipping — all under one roof.
              </p>
            </div>
            <div className="flex-1 w-full max-w-md">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                <Image src="/images/process/process-4.png" alt="Resin toy factory production" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 440px" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content section 5: Get started ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row-reverse gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-black text-stone-900 mb-4">Get Started with Kelikuli's Custom Resin Toy Service</h2>
              <p className="text-stone-500 text-sm leading-relaxed mb-4">
                If you're ready to create your own custom resin toy series, Kelikuli is here to help. Our expert team will guide you through every step of the process, from initial design to final production. Whether you need help developing a unique concept, customizing figurines, or fulfilling large orders, we have the expertise and resources to make your project a success.
              </p>
              <p className="text-stone-500 text-sm leading-relaxed mb-6">
                Contact us today to learn more about our OEM/ODM services and start your custom resin toy project with Kelikuli.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-[#C9A55A] hover:bg-[#B8935A] text-white font-bold px-6 py-3 rounded-full transition-colors"
              >
                Contact Us Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="flex-1 w-full max-w-md">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                <Image src="/images/collections/col-4.png" alt="Custom resin toy series" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 440px" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-[#1A1008] py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute rounded-full bg-[#C9A55A]"
              style={{ width: ((i * 11) % 6 + 2) + "px", height: ((i * 11) % 6 + 2) + "px", top: ((i * 13) % 100) + "%", left: ((i * 17) % 100) + "%", opacity: 0.4 }} />
          ))}
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <p className="text-[#C9A55A] text-xs font-bold uppercase tracking-widest mb-3">Partner with Kelikuli</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
            Let's Bring Your Custom Resin Toy Series to Life
          </h2>
          <p className="text-stone-400 text-sm mb-8 leading-relaxed">
            Partner with Kelikuli for high-quality, handcrafted resin toys that inspire joy, surprise, and brand loyalty.
          </p>
          <InquiryButton />
        </div>
      </section>

    </div>
  );
}
