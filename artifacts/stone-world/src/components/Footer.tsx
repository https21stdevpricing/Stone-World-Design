import { Link } from "wouter";
import { useGetPublicSettings } from "@workspace/api-client-react";

export function Footer() {
  const { data: settings } = useGetPublicSettings();

  return (
    <footer className="bg-foreground text-background pt-24 pb-12 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-24">
          
          <div className="md:col-span-4 space-y-8">
            <img src="/sw-logo.png" alt="AB Stone World" className="h-12 invert brightness-0" />
            <p className="text-white/60 font-light leading-relaxed max-w-sm text-sm">
              India's premier marketplace for luxury building materials. Crafting breathtaking spaces since 2003. Where raw geological magnificence meets refined craftsmanship.
            </p>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <h4 className="text-xs tracking-widest uppercase text-white/40">Discover</h4>
            <ul className="space-y-4">
              <li><Link href="/discover?categoryId=1" className="text-white/80 hover:text-white transition-colors font-light text-sm">Marbles</Link></li>
              <li><Link href="/discover?categoryId=2" className="text-white/80 hover:text-white transition-colors font-light text-sm">Tiles</Link></li>
              <li><Link href="/discover?categoryId=3" className="text-white/80 hover:text-white transition-colors font-light text-sm">Quartz</Link></li>
              <li><Link href="/discover?categoryId=4" className="text-white/80 hover:text-white transition-colors font-light text-sm">Sanitaryware</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h4 className="text-xs tracking-widest uppercase text-white/40">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-white/80 hover:text-white transition-colors font-light text-sm">Our Story</Link></li>
              <li><Link href="/blog" className="text-white/80 hover:text-white transition-colors font-light text-sm">Journal</Link></li>
              <li><Link href="/contact" className="text-white/80 hover:text-white transition-colors font-light text-sm">Contact Us</Link></li>
              <li><Link href="/admin" className="text-white/80 hover:text-white transition-colors font-light text-sm">Admin</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-6">
            <h4 className="text-xs tracking-widest uppercase text-white/40">Headquarters</h4>
            <div className="space-y-4 font-light text-sm text-white/80 leading-relaxed">
              {settings?.address ? <p>{settings.address}</p> : <p>Pitampura, New Delhi<br/>India</p>}
              
              <div className="pt-4 space-y-2">
                {settings?.phone && (
                  <p><a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">{settings.phone}</a></p>
                )}
                {settings?.email && (
                  <p><a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">{settings.email}</a></p>
                )}
              </div>
            </div>
            
            <div className="flex gap-6 pt-4">
              {settings?.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest uppercase text-white/60 hover:text-white transition-colors">
                  Instagram
                </a>
              )}
              {settings?.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest uppercase text-white/60 hover:text-white transition-colors">
                  Facebook
                </a>
              )}
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light text-white/40 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} {settings?.companyName ?? "AB Stone World Pvt. Ltd."}</p>
          <p>All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}
