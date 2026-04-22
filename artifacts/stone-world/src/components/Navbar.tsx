import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/", label: "HOME" },
    { href: "/discover", label: "DISCOVER" },
    { href: "/about", label: "ABOUT" },
    { href: "/blog", label: "JOURNAL" },
    { href: "/contact", label: "CONTACT" },
  ];

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 md:px-8 h-24 flex items-center justify-between">
        
        <Link href="/" className="flex items-center">
          <AnimatePresence mode="wait">
            {!scrolled ? (
              <motion.span 
                key="wordmark"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`text-2xl font-serif tracking-wide ${location === "/" && !scrolled ? 'text-white' : 'text-foreground'}`}
              >
                Stone World
              </motion.span>
            ) : (
              <motion.img 
                key="monogram"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                src="/sw-logo.png" 
                alt="Stone World" 
                className="h-10 object-contain" 
              />
            )}
          </AnimatePresence>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {links.map((link) => {
            const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
            const isHeroTransparent = location === "/" && !scrolled;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`text-xs font-semibold tracking-[0.2em] transition-all duration-300 relative py-2 ${isHeroTransparent ? 'text-white/90 hover:text-white' : 'text-foreground/80 hover:text-foreground'}`}
              >
                {link.label}
                {isActive && (
                  <motion.div 
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          <Button asChild className="rounded-full px-8 text-xs tracking-widest font-semibold ml-4">
            <Link href="/contact">ENQUIRE NOW</Link>
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={location === "/" && !scrolled ? 'text-white' : 'text-foreground'}>
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] border-l-0 pt-24 px-8">
              <div className="flex flex-col gap-8">
                {links.map((link) => {
                  const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
                  return (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      className={`text-3xl font-serif transition-colors ${isActive ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <div className="pt-8 border-t mt-4">
                  <Button asChild size="lg" className="w-full rounded-full text-sm tracking-widest h-14">
                    <Link href="/contact">ENQUIRE NOW</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
