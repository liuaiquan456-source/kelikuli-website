"use client";
import { useState, useEffect, useRef } from "react";
import { Save, Globe, Phone, MessageSquare, Shield, Bell, Building2, Share2, Upload, X } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, CardBody, Input, Textarea, Switch } from "@/app/admin/_components/ui";
import { cn } from "@/app/admin/_lib/utils";

type Tab = "general" | "contact" | "seo" | "notifications" | "security";

interface SiteSettings {
  siteName: string; siteTagline: string; siteEmail: string; logoUrl: string | null;
  companyName: string; address: string; city: string; country: string; registrationNo: string;
  whatsapp: string; wechat: string; phone: string; fax: string;
  facebook: string; instagram: string; linkedin: string; youtube: string;
  metaTitle: string; metaDesc: string; metaKeywords: string; googleAnalyticsId: string;
}
interface NotifSettings {
  newOrder: boolean; newInquiry: boolean; lowStock: boolean; weeklyReport: boolean; emailDigest: boolean;
}

const defaultSite: SiteSettings = {
  siteName: "Kelikuli",
  siteTagline: "Custom Resin Toys & Crafts Manufacturer",
  siteEmail: "liuaiquan456@gmail.com",
  logoUrl: null,
  companyName: "Kelikuli Resin Crafts Co., Ltd.",
  address: "No.123, Industrial Park Road",
  city: "Guangzhou",
  country: "China",
  registrationNo: "",
  whatsapp: "+8613566668888",
  wechat: "kelikuli_official",
  phone: "+8613566668888",
  fax: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  metaTitle: "Kelikuli - Custom Resin Toys & Figurines Manufacturer",
  metaDesc: "Professional OEM/ODM resin toys, figurines, and crafts manufacturer from China. Custom designs, bulk orders, worldwide shipping.",
  metaKeywords: "custom resin toys, resin figurines manufacturer, OEM resin crafts, blind box factory",
  googleAnalyticsId: "",
};
const defaultNotif: NotifSettings = {
  newOrder: true, newInquiry: true, lowStock: true, weeklyReport: false, emailDigest: false,
};

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "general",       label: "General",       icon: <Globe className="w-4 h-4" /> },
  { id: "contact",       label: "Contact",        icon: <Phone className="w-4 h-4" /> },
  { id: "seo",           label: "SEO",            icon: <MessageSquare className="w-4 h-4" /> },
  { id: "notifications", label: "Notifications",  icon: <Bell className="w-4 h-4" /> },
  { id: "security",      label: "Security",       icon: <Shield className="w-4 h-4" /> },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("general");
  const [site, setSite] = useState<SiteSettings>(defaultSite);
  const [notif, setNotif] = useState<NotifSettings>(defaultNotif);
  const [saved, setSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => setSite((x) => ({ ...x, ...data })))
      .catch(() => {});
  }, []);

  const s = (k: keyof SiteSettings, v: string | null) => setSite((x) => ({ ...x, [k]: v }));
  const n = (k: keyof NotifSettings, v: boolean) => setNotif((x) => ({ ...x, [k]: v }));

  const save = async (section: string, fields: Partial<SiteSettings>) => {
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      setSaved(section);
      setTimeout(() => setSaved(null), 2000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const SaveBtn = ({ id, fields }: { id: string; fields: Partial<SiteSettings> }) => (
    <div className="flex justify-end pt-2">
      <Button onClick={() => save(id, fields)} disabled={saving}>
        <Save className="w-4 h-4" />
        {saved === id ? "Saved!" : "Save Changes"}
      </Button>
    </div>
  );

  return (
    <div className="flex gap-6">
      {/* Sidebar tabs */}
      <div className="w-48 shrink-0">
        <nav className="space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                tab === t.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              )}
            >
              <span className={tab === t.id ? "text-blue-500" : "text-slate-400"}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 max-w-2xl space-y-5">
        {/* ── General ── */}
        {tab === "general" && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-slate-500" /><CardTitle>Site Identity</CardTitle></div>
              </CardHeader>
              <CardBody className="space-y-4">
                {/* Logo upload */}
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">Site Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                      {site.logoUrl
                        ? <img src={site.logoUrl} alt="logo" className="w-full h-full object-contain" />
                        : <Upload className="w-6 h-6 text-slate-300" />
                      }
                    </div>
                    <div className="flex gap-2">
                      <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          s("logoUrl", URL.createObjectURL(f));
                          const fd = new FormData();
                          fd.append("file", f);
                          const res = await fetch("/api/upload", { method: "POST", body: fd });
                          const data = await res.json();
                          if (data.url) {
                            s("logoUrl", data.url);
                            await fetch("/api/admin/settings", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ logoUrl: data.url }),
                            });
                          }
                        }} />
                      <Button variant="secondary" size="sm" onClick={() => logoInputRef.current?.click()}>
                        <Upload className="w-3.5 h-3.5" />Upload
                      </Button>
                      {site.logoUrl && (
                        <Button variant="ghost" size="sm" onClick={() => s("logoUrl", null)}><X className="w-3.5 h-3.5" /></Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Site Name" value={site.siteName} onChange={(e) => s("siteName", e.target.value)} />
                  <Input label="Tagline" value={site.siteTagline} onChange={(e) => s("siteTagline", e.target.value)} />
                </div>
                <Input label="Contact Email" type="email" value={site.siteEmail} onChange={(e) => s("siteEmail", e.target.value)} />
                <SaveBtn id="general" fields={{ siteName: site.siteName, siteTagline: site.siteTagline, siteEmail: site.siteEmail }} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-500" /><CardTitle>Company Information</CardTitle></div>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input label="Registered Company Name" value={site.companyName} onChange={(e) => s("companyName", e.target.value)} />
                <Input label="Street Address" value={site.address} onChange={(e) => s("address", e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" value={site.city} onChange={(e) => s("city", e.target.value)} />
                  <Input label="Country" value={site.country} onChange={(e) => s("country", e.target.value)} />
                </div>
                <Input label="Business Registration No." placeholder="Optional" value={site.registrationNo} onChange={(e) => s("registrationNo", e.target.value)} />
                <SaveBtn id="company" fields={{ companyName: site.companyName, address: site.address, city: site.city, country: site.country, registrationNo: site.registrationNo }} />
              </CardBody>
            </Card>
          </>
        )}

        {/* ── Contact ── */}
        {tab === "contact" && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-500" /><CardTitle>Contact Details</CardTitle></div>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="WhatsApp" placeholder="+86 135..." value={site.whatsapp} onChange={(e) => s("whatsapp", e.target.value)} />
                  <Input label="Phone" placeholder="+86 135..." value={site.phone} onChange={(e) => s("phone", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="WeChat ID" placeholder="WeChat username" value={site.wechat} onChange={(e) => s("wechat", e.target.value)} />
                  <Input label="Fax" placeholder="Optional" value={site.fax} onChange={(e) => s("fax", e.target.value)} />
                </div>
                <SaveBtn id="contact" fields={{ whatsapp: site.whatsapp, phone: site.phone, wechat: site.wechat, fax: site.fax }} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2"><Share2 className="w-4 h-4 text-slate-500" /><CardTitle>Social Media Links</CardTitle></div>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input label="Facebook Page URL" placeholder="https://facebook.com/kelikuli" value={site.facebook} onChange={(e) => s("facebook", e.target.value)} />
                <Input label="Instagram URL" placeholder="https://instagram.com/kelikuli" value={site.instagram} onChange={(e) => s("instagram", e.target.value)} />
                <Input label="LinkedIn URL" placeholder="https://linkedin.com/company/kelikuli" value={site.linkedin} onChange={(e) => s("linkedin", e.target.value)} />
                <Input label="YouTube Channel URL" placeholder="https://youtube.com/@kelikuli" value={site.youtube} onChange={(e) => s("youtube", e.target.value)} />
                <SaveBtn id="social" fields={{ facebook: site.facebook, instagram: site.instagram, linkedin: site.linkedin, youtube: site.youtube }} />
              </CardBody>
            </Card>
          </>
        )}

        {/* ── SEO ── */}
        {tab === "seo" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-slate-500" /><CardTitle>Global SEO Settings</CardTitle></div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <Input label="Default Meta Title" value={site.metaTitle} onChange={(e) => s("metaTitle", e.target.value)} />
                <p className={cn("text-xs mt-1 text-right", site.metaTitle.length > 60 ? "text-amber-600" : "text-slate-400")}>{site.metaTitle.length}/60</p>
              </div>
              <div>
                <Textarea label="Default Meta Description" rows={3} value={site.metaDesc} onChange={(e) => s("metaDesc", e.target.value.slice(0, 155))} />
                <p className={cn("text-xs mt-1 text-right", site.metaDesc.length > 140 ? "text-amber-600" : "text-slate-400")}>{site.metaDesc.length}/155</p>
              </div>
              <Input label="Default Keywords (comma separated)" value={site.metaKeywords} onChange={(e) => s("metaKeywords", e.target.value)} />
              <Input label="Google Analytics Measurement ID" placeholder="G-XXXXXXXXXX" value={site.googleAnalyticsId} onChange={(e) => s("googleAnalyticsId", e.target.value)} />
              {site.metaTitle && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1.5 font-medium">Google Preview:</p>
                  <p className="text-sm text-blue-700 font-medium">{site.metaTitle}</p>
                  <p className="text-xs text-green-700">kelikuli.com</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{site.metaDesc}</p>
                </div>
              )}
              <SaveBtn id="seo" fields={{ metaTitle: site.metaTitle, metaDesc: site.metaDesc, metaKeywords: site.metaKeywords, googleAnalyticsId: site.googleAnalyticsId }} />
            </CardBody>
          </Card>
        )}

        {/* ── Notifications ── */}
        {tab === "notifications" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2"><Bell className="w-4 h-4 text-slate-500" /><CardTitle>Email Notifications</CardTitle></div>
              <span className="text-xs text-slate-400">Sent to: {site.siteEmail}</span>
            </CardHeader>
            <CardBody className="space-y-1">
              {([
                { key: "newOrder",     label: "New Order",            desc: "Alert when a new inquiry order is received" },
                { key: "newInquiry",   label: "New Inquiry",           desc: "Alert when a contact form is submitted" },
                { key: "lowStock",     label: "Low Stock Warning",     desc: "Alert when product stock drops below 20 units" },
                { key: "weeklyReport", label: "Weekly Traffic Report", desc: "Summary email every Monday morning" },
                { key: "emailDigest",  label: "Daily Digest",          desc: "Daily summary of all activity" },
              ] as { key: keyof NotifSettings; label: string; desc: string }[]).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                  <Switch checked={notif[key]} onChange={(v) => n(key, v)} />
                </div>
              ))}
              <SaveBtn id="notif" fields={{}} />
            </CardBody>
          </Card>
        )}

        {/* ── Security ── */}
        {tab === "security" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-slate-500" /><CardTitle>Change Password</CardTitle></div>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input label="Current Password" type="password" placeholder="Enter current password"
                value={pwForm.current} onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} />
              <Input label="New Password" type="password" placeholder="Min 8 characters"
                value={pwForm.next} onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))} />
              <div>
                <Input label="Confirm New Password" type="password" placeholder="Repeat new password"
                  value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                  error={pwForm.confirm && pwForm.next !== pwForm.confirm ? "Passwords do not match" : undefined}
                />
              </div>
              {pwForm.next && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Password strength:</p>
                  <div className="flex gap-1">
                    {[8, 12, 16].map((len) => (
                      <div key={len} className={cn("flex-1 h-1.5 rounded-full",
                        pwForm.next.length >= len ? "bg-emerald-500" : "bg-slate-200"
                      )} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    {pwForm.next.length < 8 ? "Too short" : pwForm.next.length < 12 ? "Fair" : pwForm.next.length < 16 ? "Good" : "Strong"}
                  </p>
                </div>
              )}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => save("security", {})}
                  disabled={!pwForm.current || !pwForm.next || pwForm.next !== pwForm.confirm}
                >
                  <Save className="w-4 h-4" />
                  {saved === "security" ? "Updated!" : "Update Password"}
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
