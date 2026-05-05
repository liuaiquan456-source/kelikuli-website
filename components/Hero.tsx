import Link from "next/link";

const heroFeatures = [
  {
    label: "OEM/ODM Customization",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    label: "Custom Design",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    label: "Low MOQ",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    label: "Global Wholesale",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
      </svg>
    ),
  },
  {
    label: "Strict QC Process",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

export default function Hero() {
  return (
    <section className="relative bg-stone-900 overflow-hidden min-h-[520px] lg:min-h-[600px]">
      {/* Background: placeholder for factory/showroom photo */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/90 to-stone-800/60" />
      <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-30 mix-blend-overlay" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-20 flex flex-col lg:flex-row items-center gap-10 min-h-[520px]">
        {/* Left: copy */}
        <div className="flex-1 max-w-xl">
          <p className="text-[#C9A55A] text-2xl font-black italic mb-3 leading-none">kelikuli</p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase leading-[1.1] mb-4">
            Resin Toys &amp;<br />Crafts<br />Manufacturer
          </h1>

          <p className="text-stone-300 text-sm mb-7 tracking-wide">
            Custom Resin Toys &nbsp;|&nbsp; Festival Decorations &nbsp;|&nbsp; OEM &amp; ODM Solutions
          </p>

          <Link
            href="/products/blind-box"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-full uppercase text-sm tracking-wide transition-colors shadow-lg shadow-orange-900/30"
          >
            Blind Box Customization
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          {/* 5 feature icons */}
          <div className="mt-10 flex flex-wrap gap-5">
            {heroFeatures.map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-1.5 text-center">
                <div className="w-10 h-10 rounded-full border border-orange-400/40 bg-orange-400/10 flex items-center justify-center text-orange-300">
                  {f.icon}
                </div>
                <span className="text-stone-300 text-[10px] leading-tight max-w-[60px]">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: product showcase placeholder */}
        <div className="flex-1 flex justify-center lg:justify-end w-full max-w-md lg:max-w-none">
          <div className="relative w-full max-w-[460px]">
            {/* Main large product image placeholder */}
            <div className="aspect-[4/3] bg-gradient-to-br from-amber-900/40 to-stone-800/40 rounded-2xl border border-amber-700/30 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <p className="text-amber-300 font-semibold text-sm mb-1">Hero Product Display</p>
              <p className="text-amber-500/70 text-xs leading-relaxed">
                Place high-quality photo of your resin<br />figurines &amp; blind box products here<br />
                <span className="text-amber-600/60">Recommended: 920×700 px</span>
              </p>
            </div>

            {/* Small image top-right */}
            <div className="absolute -top-3 -right-3 w-28 h-28 bg-stone-800/80 rounded-xl border border-stone-700/50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159" />
                  </svg>
                </div>
                <span className="text-amber-500/60 text-[9px]">Product photo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
