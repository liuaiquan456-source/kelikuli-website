import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";

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

      <div className="max-w-7xl mx-auto px-6 py-3">
        <Breadcrumb items={[{ label: "About Us" }]} />
      </div>

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
          <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-stone-200 relative">
            <Image
              src="/images/process/resin toys factory1.png"
              alt="Kelikuli resin toy factory"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
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
