import { Link } from "wouter";
import { useGetPublicSettings } from "@workspace/api-client-react";
import { MapPin, Phone, Mail, MessageCircle, Instagram, Facebook } from "lucide-react";

export function Footer() {
  const { data: settings } = useGetPublicSettings();

  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">

        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 pb-16 border-b border-gray-100">

          {/* Brand */}
          <div className="md:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <img src="/sw-logo.png" alt="AB Stone World" className="h-10 w-auto object-contain" />
            </div>
            <p className="text-gray-500 leading-relaxed text-sm max-w-xs">
              India's premier destination for luxury building materials — Marble, Quartz, Tiles, Sanitaryware, and more. Crafting remarkable spaces since 2003.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-teal-50 flex items-center justify-center transition-colors group"
                >
                  <Instagram className="w-4 h-4 text-gray-500 group-hover:text-teal-600 transition-colors" />
                </a>
              )}
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-teal-50 flex items-center justify-center transition-colors group"
                >
                  <Facebook className="w-4 h-4 text-gray-500 group-hover:text-teal-600 transition-colors" />
                </a>
              )}
              {settings?.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-teal-50 flex items-center justify-center transition-colors group"
                >
                  <MessageCircle className="w-4 h-4 text-gray-500 group-hover:text-teal-600 transition-colors" />
                </a>
              )}
            </div>
          </div>

          {/* Materials */}
          <div className="md:col-span-2 space-y-5">
            <h4 className="text-[10px] font-black tracking-[0.25em] uppercase text-gray-400">Materials</h4>
            <ul className="space-y-3.5">
              {[
                { label: "Marble", href: "/discover?search=marble" },
                { label: "Quartz", href: "/discover?search=quartz" },
                { label: "Tiles", href: "/discover?search=tiles" },
                { label: "Sanitaryware", href: "/discover?search=sanitaryware" },
                { label: "Cement", href: "/discover?search=cement" },
                { label: "TMT Bars", href: "/discover?search=tmt" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-teal-600 transition-colors font-medium">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2 space-y-5">
            <h4 className="text-[10px] font-black tracking-[0.25em] uppercase text-gray-400">Company</h4>
            <ul className="space-y-3.5">
              {[
                { label: "Our Story", href: "/about" },
                { label: "The Journal", href: "/blog" },
                { label: "Browse All", href: "/discover" },
                { label: "Contact Us", href: "/contact" },
                { label: "Track Enquiry", href: "/track" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-teal-600 transition-colors font-medium">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4 space-y-5">
            <h4 className="text-[10px] font-black tracking-[0.25em] uppercase text-gray-400">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-500" />
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {settings?.address || "Pitampura, New Delhi, India"}
                </p>
              </div>
              {settings?.phone && (
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5 text-teal-500" />
                  </div>
                  <a href={`tel:${settings.phone}`} className="text-sm font-semibold text-gray-700 hover:text-teal-600 transition-colors">
                    {settings.phone}
                  </a>
                </div>
              )}
              {settings?.email && (
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5 text-teal-500" />
                  </div>
                  <a href={`mailto:${settings.email}`} className="text-sm font-semibold text-gray-700 hover:text-teal-600 transition-colors">
                    {settings.email}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors shadow-sm"
              >
                Send Enquiry
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {year} {settings?.companyName ?? "AB Stone World Pvt. Ltd."} All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <span className="text-xs text-gray-400">Est. 2003</span>
            <span className="text-xs text-gray-200">·</span>
            <span className="text-xs text-gray-400">Pitampura, New Delhi</span>
            <span className="text-xs text-gray-200">·</span>
            <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
