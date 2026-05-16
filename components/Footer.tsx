import Link from "next/link";
import Image from "next/image";
import { getSettings, waMe } from "@/lib/settings";

const aboutLinks = [
  { label: "Company Profile", href: "/about-us" },
  { label: "Factory Advantage", href: "/about-us#factory" },
  { label: "OEM/ODM Service", href: "/custom-oem-odm" },
  { label: "Contact Us", href: "/contact" },
];

const productLinks = [
  { label: "Custom Resin Toys", href: "/products" },
  { label: "Blind Box Toys", href: "/products?category=Blind+Box+Series" },
  { label: "Resin Figurines", href: "/products?category=Figurines" },
  { label: "Festival Decorations", href: "/products" },
  { label: "Lucky Cat Series", href: "/products?category=Lucky+Cat" },
  { label: "Garden Series", href: "/products?category=Garden+Series" },
];

const newsLinks = [
  { label: "Company News", href: "/news" },
  { label: "Product Updates", href: "/news" },
  { label: "Custom Resin Toy Guide", href: "/news" },
  { label: "Industry News", href: "/news" },
];

export default async function Footer() {
  const s = await getSettings();

  const socialLinks = [
    { label: "LinkedIn", href: s.linkedin || "#", path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
    { label: "Facebook", href: s.facebook || "#", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
    { label: "YouTube", href: s.youtube || "#", path: "M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" },
  ];

  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

          {/* Col 1: Contact Us */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <p className="text-stone-300 font-medium mb-1">Kelikuli Resin Toys &amp; Crafts</p>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-[#C9A55A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>{s.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-[#C9A55A]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <a href={waMe(s.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-[#B8935A] transition-colors">
                  WhatsApp: {s.whatsapp}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-[#C9A55A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <a href={`mailto:${s.email}`} className="hover:text-[#B8935A] transition-colors">{s.email}</a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-[#C9A55A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                <span>WeChat: <span className="text-stone-300">{s.wechat}</span></span>
              </li>
            </ul>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target={social.href !== "#" ? "_blank" : undefined}
                  rel={social.href !== "#" ? "noopener noreferrer" : undefined}
                  className="w-8 h-8 rounded-full bg-stone-700 hover:bg-orange-500 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 text-stone-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: About Us */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">About Us</h4>
            <ul className="space-y-2.5">
              {aboutLinks.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-sm hover:text-[#B8935A] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Product */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Product</h4>
            <ul className="space-y-2.5">
              {productLinks.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-sm hover:text-[#B8935A] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: News */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">News</h4>
            <ul className="space-y-2.5">
              {newsLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm hover:text-[#B8935A] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: QR Code */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Scan QR Code</h4>
            <div className="bg-white rounded-xl p-1.5 inline-block">
              <Image
                src="/images/wechat-qr.png"
                alt="Kelikuli WeChat QR Code"
                width={100}
                height={100}
                className="rounded-lg"
              />
            </div>
            <p className="text-xs mt-3 text-stone-500 leading-relaxed">
              Scan to contact us<br />on WeChat
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center text-stone-500 text-sm">
          &copy; {new Date().getFullYear()} Kelikuli Resin Toys &amp; Crafts. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
