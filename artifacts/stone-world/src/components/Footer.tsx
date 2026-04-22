import { Link } from "wouter";
import { usePublicSettings } from "@/hooks/use-public-settings";

export function Footer() {
  const { data: settings } = usePublicSettings();

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <img src="/sw-logo.png" alt="Stone World" className="h-16 invert brightness-0" />
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
            India's premier marketplace for luxurious building materials. Crafting breathtaking spaces since 2003.
          </p>
        </div>
        
        <div>
          <h4 className="font-serif text-lg mb-6">Explore</h4>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li><Link href="/discover" className="hover:text-primary transition-colors">Marbles & Stones</Link></li>
            <li><Link href="/discover" className="hover:text-primary transition-colors">Tiles & Ceramics</Link></li>
            <li><Link href="/discover" className="hover:text-primary transition-colors">SanitaryWare</Link></li>
            <li><Link href="/discover" className="hover:text-primary transition-colors">Construction Materials</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-6">Company</h4>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
            <li><Link href="/blog" className="hover:text-primary transition-colors">Journal</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-6">Contact</h4>
          <ul className="space-y-4 text-sm text-muted-foreground">
            {settings?.address && <li>{settings.address}</li>}
            {settings?.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="hover:text-primary transition-colors">
                  {settings.email}
                </a>
              </li>
            )}
            {settings?.phone && (
              <li>
                <a href={`tel:${settings.phone}`} className="hover:text-primary transition-colors">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings?.whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  WhatsApp: {settings.whatsapp}
                </a>
              </li>
            )}
            {settings?.instagramUrl && (
              <li>
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  Instagram
                </a>
              </li>
            )}
            {settings?.facebookUrl && (
              <li>
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  Facebook
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-white/10 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} {settings?.companyName ?? "AB Stone World Pvt. Ltd."}. All rights reserved.</p>
      </div>
    </footer>
  );
}
