import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { GlobalSearch } from "./GlobalSearch";

export function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const links = [
    { href: "/discover", label: "Discover" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Journal" },
    { href: "/track", label: "Track Order" },
  ];

  const isHero = location === "/" && !scrolled;

  return (
    <>
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          isHero
            ? "bg-transparent border-transparent"
            : "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <img
              src="/sw-logo.png"
              alt="Stone World"
              className={`h-9 object-contain transition-all duration-300 ${isHero ? "brightness-0 invert" : ""}`}
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {links.map(link => {
              const isActive = link.href !== "/" && location.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium tracking-wide transition-colors duration-200 py-1 ${
                    isHero
                      ? "text-white/80 hover:text-white"
                      : isActive
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                  {isActive && !isHero && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-teal-500 rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isHero
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/contact"
              className={`hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                isHero
                  ? "bg-teal-500 text-white hover:bg-teal-400"
                  : "bg-gray-900 text-white hover:bg-gray-700"
              }`}
            >
              Get a Quote
            </Link>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button
                    className={`p-2 rounded-full transition-colors ${isHero ? "text-white" : "text-gray-700"}`}
                    aria-label="Menu"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-80 p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-gray-100">
                      <img src="/sw-logo.png" alt="Stone World" className="h-8 object-contain" />
                    </div>
                    <nav className="flex-1 p-6 space-y-1">
                      {[{ href: "/", label: "Home" }, ...links].map(link => {
                        const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                              isActive ? "bg-teal-50 text-teal-700" : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {link.label}
                          </Link>
                        );
                      })}
                    </nav>
                    <div className="p-6 border-t border-gray-100">
                      <Link
                        href="/contact"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center w-full py-3 rounded-full bg-gray-900 text-white font-semibold text-sm"
                      >
                        Get a Quote
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
