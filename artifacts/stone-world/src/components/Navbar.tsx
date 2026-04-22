import { Link } from "wouter";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const links = [
    { href: "/", label: "Home" },
    { href: "/discover", label: "Discover" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Journal" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/sw-logo.png" alt="Stone World" className="h-12 object-contain" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium tracking-wide hover:text-primary transition-colors">
              {link.label.toUpperCase()}
            </Link>
          ))}
          <Button asChild variant="default" className="rounded-full px-6">
            <Link href="/contact">ENQUIRE NOW</Link>
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] flex flex-col gap-8 pt-16">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="text-lg font-serif hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
              <Button asChild variant="default" className="rounded-full mt-4">
                <Link href="/contact">ENQUIRE NOW</Link>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
