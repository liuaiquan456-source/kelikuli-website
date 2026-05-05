import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — Kelikuli Resin Toys Manufacturer",
  description:
    "Learn about Kelikuli — a professional resin toy and figurine factory established in 2005, offering OEM/ODM custom manufacturing for global brands.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-stone-900 py-16 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-3">About Kelikuli</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5">
            Factory-Direct Resin Toy Manufacturer Since 2005
          </h1>
          <p className="text-stone-300 text-lg leading-relaxed">
            We are a source factory specializing in custom resin toys, figurines, blind box collectibles,
            Zakka ornaments, and seasonal resin crafts — serving brands, wholesalers, and gift companies worldwide.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-orange-600 font-semibold text-sm uppercase tracking-widest mb-3">Our Story</p>
            <h2 className="text-3xl font-bold text-stone-900 mb-5">Built on Craft, Grown on Trust</h2>
            <p className="text-stone-600 leading-relaxed mb-4">
              Kelikuli was founded in 2005 with a clear focus: create hand-painted resin products that
              combine artisan quality with reliable B2B manufacturing. Over the years, we have grown from
              a small workshop into a full-scale factory capable of handling custom OEM/ODM orders for
              brands across the globe.
            </p>
            <p className="text-stone-600 leading-relaxed mb-6">
              Today, our factory produces resin figurines, blind box series, Zakka home ornaments, seasonal
              gift crafts, and fully customized resin toys — with every product hand-painted by skilled craftsmen.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Start a Project
            </Link>
          </div>
          <div className="aspect-[4/3] bg-gradient-to-br from-amber-100 to-stone-100 rounded-2xl border border-stone-200 flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-stone-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
            </svg>
            <span className="text-stone-400 text-sm">Factory Photo</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-amber-900 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "2005", label: "Factory Founded" },
            { value: "5000+", label: "Product Designs" },
            { value: "180+", label: "Team Members" },
            { value: "30+", label: "Export Markets" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-black text-white mb-1">{s.value}</p>
              <p className="text-amber-200 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-stone-900 mb-4">Ready to Work with Us?</h2>
          <p className="text-stone-500 mb-7">Send us your design idea and we will get back with a quote within 24 hours.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors">
            Contact Us Now
          </Link>
        </div>
      </section>
    </div>
  );
}
