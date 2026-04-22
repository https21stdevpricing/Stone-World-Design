import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Search, X } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { GlobalSearch } from "./GlobalSearch";

export function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  const textOpacity = useTransform(scrollY, [0, 48], [1, 0]);
  const textY = useTransform(scrollY, [0, 48], [0, -4]);
  const imgOpacity = useTransform(scrollY, [8, 52], [0, 1]);
  const imgY = useTransform(scrollY, [8, 52], [6, 0]);

  useEffect(() => {
    const unsub = scrollY.on("change", (y) => setScrolled(y > 20));
    return unsub;
  }, [scrollY]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const isHome = location === "/";
  const isHero = isHome && !scrolled;

  const links = [
    { href: "/discover", label: "Discover" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Journal" },
    { href: "/track", label: "Track Order" },
  ];

  return (
    <>
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isHero
            ? "h-[72px] bg-transparent"
            : "h-16 bg-white/96 backdrop-blur-2xl border-b border-black/[0.06] shadow-[0_1px_12px_rgba(0,0,0,0.06)]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-full flex items-center justify-between">

          {/* Logo: seamless text → image morph */}
          <Link href="/" className="flex items-center shrink-0">
            <div className="relative h-8" style={{ width: 140 }}>
              {/* Text logo */}
              <motion.div
                style={{ opacity: textOpacity, y: textY }}
                className="absolute inset-0 flex items-center pointer-events-none"
              >
                <span
                  className={`font-black tracking-[-0.045em] text-[19px] leading-none whitespace-nowrap select-none transition-colors duration-300 ${
                    isHero ? "text-white" : "text-gray-950"
                  }`}
                >
                  Stone World
                </span>
              </motion.div>
              {/* Image logo */}
              <motion.div
                style={{ opacity: imgOpacity, y: imgY }}
                className="absolute inset-0 flex items-center pointer-events-none"
              >
                <img
                  src="/sw-logo.png"
                  alt="Stone World"
                  className="h-8 w-auto object-contain"
                />
              </motion.div>
            </div>
          </Link>

          {/* Center nav links */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {links.map((link) => {
              const isActive = location.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-[13px] font-medium tracking-wide py-1 transition-colors duration-200 ${
                    isHero
                      ? "text-white/75 hover:text-white"
                      : isActive
                      ? "text-gray-950 font-semibold"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                  {isActive && !isHero && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-px left-0 right-0 h-[2px] bg-teal-500 rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                isHero
                  ? "text-white/70 hover:text-white hover:bg-white/10"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
              aria-label="Search"
            >
              <Search className="w-[17px] h-[17px]" />
            </button>

            <Link
              href="/contact"
              className={`hidden md:inline-flex items-center px-5 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                isHero
                  ? "bg-white text-gray-950 hover:bg-gray-50"
                  : "bg-teal-500 text-white hover:bg-teal-600 shadow-sm"
              }`}
            >
              Get a Quote
            </Link>

            <button
              onClick={() => setMobileOpen(true)}
              className={`md:hidden p-2.5 rounded-full transition-colors ${
                isHero ? "text-white" : "text-gray-700"
              }`}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 38 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-[80vw] max-w-[320px] bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
                <img src="/sw-logo.png" alt="Stone World" className="h-7 w-auto object-contain" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-4 overflow-y-auto">
                {[{ href: "/", label: "Home" }, ...links].map((link) => {
                  const isActive =
                    location === link.href ||
                    (link.href !== "/" && location.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center px-4 py-3.5 rounded-xl text-[15px] font-medium transition-colors mb-1 ${
                        isActive
                          ? "bg-teal-50 text-teal-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="px-5 pb-8 pt-3 border-t border-gray-100">
                <Link
                  href="/contact"
                  className="flex items-center justify-center w-full py-4 rounded-2xl bg-teal-500 text-white font-bold text-[15px] hover:bg-teal-600 transition-colors"
                >
                  Get a Free Quote
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
