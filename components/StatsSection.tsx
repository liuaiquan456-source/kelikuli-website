import { getTranslator } from "@/lib/i18n";

const stats = [
  { key: "home.stats.founded",   value: "2005",  label: "Factory Founded" },
  { key: "home.stats.designs",   value: "5000+", label: "Product Designs" },
  { key: "home.stats.employees", value: "180+",  label: "Company Employees" },
  { key: "home.stats.markets",   value: "30+",   label: "Export Markets" },
];

export default async function StatsSection() {
  const t = await getTranslator();
  return (
    <section className="bg-amber-900 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-center">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-1 leading-none">
                {stat.value}
              </p>
              <p className="text-amber-200 text-sm font-medium">{t(stat.key, stat.label)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
