import Image from "next/image";

const preSale = [
  "Understand your design needs and target market",
  "Provide professional quotation and cost analysis",
  "Offer MOQ and production solutions",
  "Sample planning and sample confirmation",
];

const production = [
  "Confirm samples and approve for mass production",
  "Track production progress and keep you updated",
  "Strict quality control during production and before shipment",
  "Professional packaging and on-time shipment",
];

export default function ServiceSection() {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 text-center mb-3">
          Your Resin Figurine Supplier from China — Full-Service OEM/ODM
        </h2>
        <p className="text-stone-500 text-sm text-center max-w-2xl mx-auto mb-10">
          As a collectible figurine factory in Zhejiang, China, Kelikuli supports end-to-end orders from design consultation to global shipment. We specialize in wholesale resin Zakka decor figurines, seasonal resin figurine OEM for Christmas and Halloween, and custom blind box series — accepting resin figurine sample orders and bulk wholesale.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Pre-sale service */}
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
            <h3 className="text-[#C9A55A] font-black text-sm uppercase tracking-widest mb-4">
              Pre-Sale Service
            </h3>
            <ul className="space-y-3">
              {preSale.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-stone-700">
                  <svg className="w-4 h-4 text-[#C9A55A] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Center image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-stone-200">
            <Image
              src="/images/office-showroom.png"
              alt="Kelikuli factory and showroom"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
            />
          </div>

          {/* Production service */}
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
            <h3 className="text-[#C9A55A] font-black text-sm uppercase tracking-widest mb-4">
              Production Service
            </h3>
            <ul className="space-y-3">
              {production.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-stone-700">
                  <svg className="w-4 h-4 text-[#C9A55A] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
