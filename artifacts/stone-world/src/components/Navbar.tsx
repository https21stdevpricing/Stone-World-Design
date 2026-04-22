import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Menu, X, ChevronDown,
  Diamond, Layers, Package, Droplets, Columns3, Cylinder, Hammer, Mountain,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlobalSearch } from "./GlobalSearch";

const CATEGORIES = [
  { label: "Marble",       icon: Diamond,   href: "/discover?search=marble",      desc: "Italian & Indian" },
  { label: "Quartz",       icon: Layers,    href: "/discover?search=quartz",      desc: "Engineered surfaces" },
  { label: "Tiles",        icon: Columns3,  href: "/discover?search=tiles",       desc: "Floor & wall" },
  { label: "Sanitaryware", icon: Droplets,  href: "/discover?search=sanitaryware",desc: "Bath essentials" },
  { label: "Ceramic",      icon: Package,   href: "/discover?search=ceramic",     desc: "Artisan fired" },
  { label: "Cement",       icon: Cylinder,  href: "/discover?search=cement",      desc: "Foundation grade" },
  { label: "TMT Bars",     icon: Hammer,    href: "/discover?search=tmt",         desc: "Steel backbone" },
  { label: "Natural Stone",icon: Mountain,  href: "/discover?search=stone",       desc: "Geological grade" },
];

export function Navbar() {
  const [location] = useLocation();
  const [scrolled,     setScrolled]     = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const discoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setDiscoverOpen(false); }, [location]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") { setMobileOpen(false); setDiscoverOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (discoverRef.current && !discoverRef.current.contains(e.target as Node)) setDiscoverOpen(false);
    };
    if (discoverOpen) document.addEventListener("mousedown", onMouse);
    return () => document.removeEventListener("mousedown", onMouse);
  }, [discoverOpen]);

  const links = [
    { href: "/discover",  label: "Discover",     hasDropdown: true },
    { href: "/about",     label: "About",        hasDropdown: false },
    { href: "/blog",      label: "Journal",      hasDropdown: false },
    { href: "/track",     label: "Track Order",  hasDropdown: false },
  ];

  const glass = scrolled
    ? "bg-white/88 backdrop-blur-2xl border-b border-black/[0.05] shadow-[0_1px_24px_rgba(0,0,0,0.07)]"
    : "bg-transparent";

  return (
    <>
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <nav className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-400 ${glass}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-full flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <motion.img
              src={`${import.meta.env.BASE_URL}sw-logo.png`}
              alt="Stone World"
              className="h-8 w-auto object-contain"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-[-0.045em] text-[20px] leading-none text-gray-950 select-none"
            >
              Stone World
            </motion.span>
          </Link>

          {/* Center nav — desktop */}
          <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            {links.map((link) => {
              const isActive = location.startsWith(link.href);
              if (link.hasDropdown) {
                return (
                  <div key={link.href} ref={discoverRef} className="relative">
                    <button
                      onClick={() => setDiscoverOpen(o => !o)}
                      className={`flex items-center gap-1 text-[13px] font-medium py-1 transition-colors duration-200 relative ${
                        isActive ? "text-gray-950 font-semibold" : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {link.label}
                      <motion.span animate={{ rotate: discoverOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                      </motion.span>
                      {isActive && !discoverOpen && (
                        <motion.span
                          layoutId="nav-line"
                          className="absolute -bottom-px left-0 right-0 h-[2px] bg-teal-500 rounded-full"
                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        />
                      )}
                    </button>

                    <AnimatePresence>
                      {discoverOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute top-[calc(100%+14px)] left-1/2 -translate-x-1/2 w-[480px] bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden"
                        >
                          <div className="px-5 pt-4 pb-2 border-b border-gray-100">
                            <p className="text-[10px] font-black tracking-[0.25em] text-gray-400 uppercase">Materials</p>
                          </div>
                          <div className="grid grid-cols-2 gap-px p-3 bg-gray-100/50">
                            {CATEGORIES.map((cat) => (
                              <Link
                                key={cat.label}
                                href={cat.href}
                                onClick={() => setDiscoverOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white hover:bg-teal-50 hover:text-teal-700 transition-all duration-150 group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-teal-100 flex items-center justify-center shrink-0 transition-colors">
                                  <cat.icon className="w-4 h-4 text-gray-500 group-hover:text-teal-600 transition-colors" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-800 group-hover:text-teal-700 transition-colors leading-tight">{cat.label}</p>
                                  <p className="text-[11px] text-gray-400 leading-tight">{cat.desc}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                          <div className="px-5 py-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between">
                            <Link href="/discover" onClick={() => setDiscoverOpen(false)} className="text-xs font-bold text-teal-600 hover:text-teal-700">Browse All Materials →</Link>
                            <div className="flex gap-4">
                              <Link href="/discover?origin=national"  onClick={() => setDiscoverOpen(false)} className="text-xs font-medium text-gray-400 hover:text-gray-700">Indian</Link>
                              <Link href="/discover?origin=imported" onClick={() => setDiscoverOpen(false)} className="text-xs font-medium text-gray-400 hover:text-gray-700">Imported</Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-[13px] font-medium py-1 transition-colors duration-200 ${
                    isActive ? "text-gray-950 font-semibold" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-line"
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
              className="p-2.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
              aria-label="Search"
            >
              <Search className="w-[17px] h-[17px]" />
            </button>
            <Link
              href="/contact"
              className="hidden md:inline-flex items-center px-5 py-2 rounded-full text-[13px] font-semibold bg-teal-500 text-white hover:bg-teal-600 shadow-sm shadow-teal-500/20 transition-all duration-200 ml-1"
            >
              Get a Quote
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2.5 rounded-full text-gray-700 hover:bg-gray-100 transition-colors ml-1"
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-[82vw] max-w-[320px] bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <img
                    src={`${import.meta.env.BASE_URL}sw-logo.png`}
                    alt="Stone World"
                    className="h-8 w-auto object-contain"
                  />
                  <span className="font-black tracking-[-0.04em] text-[17px] text-gray-950">Stone World</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 overflow-y-auto">
                {[{ href: "/", label: "Home" }, ...links.map(l => ({ href: l.href, label: l.label }))].map((link) => {
                  const isAct = location === link.href || (link.href !== "/" && location.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors mb-0.5 ${
                        isAct ? "bg-teal-50 text-teal-600" : "text-gray-800 hover:bg-gray-50 hover:text-gray-950"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="px-4 pb-2.5 text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">Browse By Material</p>
                  {CATEGORIES.map(cat => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <cat.icon className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </nav>

              <div className="px-4 pb-8 pt-3 border-t border-gray-100">
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
