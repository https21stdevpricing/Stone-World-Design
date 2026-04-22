import { Footer } from "@/components/Footer";
import { useListProducts, useListCategories, useListBlogPosts } from "@workspace/api-client-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect, useRef } from "react";
import { ProductImage } from "@/components/ProductImage";

const HERO_WORDS = ["Marble", "Quartz", "Stone", "Tiles"];

const SHOWCASE = [
  { src: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=1200&q=85&auto=format&fit=crop", label: "Marble",       search: "marble"      },
  { src: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=900&q=85&auto=format&fit=crop",  label: "Quartz",       search: "quartz"      },
  { src: "https://images.unsplash.com/photo-1615971677499-5467cbab01b0?w=900&q=85&auto=format&fit=crop", label: "Tiles",       search: "tiles"       },
  { src: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=900&q=85&auto=format&fit=crop", label: "Natural Stone",search: "stone"       },
];

const CATEGORY_META: Record<string, { img: string; desc: string }> = {
  marble:              { img: SHOWCASE[0].src, desc: "Timeless Italian & Indian slabs." },
  tiles:               { img: SHOWCASE[2].src, desc: "Porcelain to designer, every room." },
  quartz:              { img: SHOWCASE[1].src, desc: "Engineered for countertops & vanities." },
  sanitaryware:        { img: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80&auto=format&fit=crop", desc: "Luxury bathware from premium brands." },
  ceramic:             { img: "https://images.unsplash.com/photo-1553787434-dd9eb4ea4d0e?w=800&q=80&auto=format&fit=crop", desc: "Artisan fired ceramics." },
  "ceramic items":     { img: "https://images.unsplash.com/photo-1553787434-dd9eb4ea4d0e?w=800&q=80&auto=format&fit=crop", desc: "Artisan fired ceramics." },
  cement:              { img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80&auto=format&fit=crop", desc: "Premium structural grades." },
  "cement & concrete": { img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80&auto=format&fit=crop", desc: "Premium structural grades." },
  "tmt bars":          { img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80&auto=format&fit=crop", desc: "High-strength steel." },
  "tmt bars & steel":  { img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80&auto=format&fit=crop", desc: "High-strength steel." },
  stone:               { img: SHOWCASE[3].src, desc: "Natural stone grandeur." },
  "natural stone":     { img: SHOWCASE[3].src, desc: "Natural stone grandeur." },
  "sand & aggregates": { img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80&auto=format&fit=crop", desc: "Quality aggregates." },
};

const FALLBACK_CATEGORIES = [
  { id: 1, name: "Marble",       slug: "marble" },
  { id: 2, name: "Tiles",        slug: "tiles" },
  { id: 3, name: "Quartz",       slug: "quartz" },
  { id: 4, name: "Sanitaryware", slug: "sanitaryware" },
];

const STATS = [
  { value: "20+",      label: "Years" },
  { value: "10,000+",  label: "Projects" },
  { value: "500+",     label: "Materials" },
  { value: "Pan India",label: "Delivery" },
];

const STEPS = [
  { num: "01", title: "Browse",  desc: "Filter 500+ materials by type, origin and budget." },
  { num: "02", title: "Enquire", desc: "Submit your project. Experts match you with the right material." },
  { num: "03", title: "Receive", desc: "Pan-India delivery with optional installation support." },
];

export default function Home() {
  const [wordIdx, setWordIdx] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -70]);

  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % HERO_WORDS.length), 2800);
    return () => clearInterval(t);
  }, []);

  const { data: featuredData }   = useListProducts({ limit: 4 });
  const { data: blogData }       = useListBlogPosts({ published: true, limit: 2 });
  const { data: categoriesData } = useListCategories();

  const featuredProducts = featuredData?.products || [];
  const blogPosts        = blogData?.posts || [];
  const rawCats          = (categoriesData || []).slice(0, 4);
  const displayCats      = rawCats.length > 0 ? rawCats : FALLBACK_CATEGORIES;

  return (
    <div className="bg-white overflow-x-hidden">

      {/* ══════ HERO ══════ */}
      <section ref={heroRef} className="relative min-h-[100svh] flex flex-col justify-center bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full pt-24 pb-16">
          <div className="grid lg:grid-cols-[55%_45%] gap-10 xl:gap-16 items-center">

            {/* Text side */}
            <motion.div
              style={{ y: heroY }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-[11px] text-gray-400 tracking-[0.3em] uppercase font-semibold mb-8">
                Est. 2003 · Pitampura, New Delhi
              </p>

              <h1
                className="font-black text-gray-950 tracking-[-0.04em] leading-[1.01] mb-6"
                style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
              >
                India's finest{" "}
                <br className="hidden sm:block" />
                <span className="inline-flex items-baseline gap-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={wordIdx}
                      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
                      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                      className="text-teal-500"
                    >
                      {HERO_WORDS[wordIdx]}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-gray-950">.</span>
                </span>
              </h1>

              <p className="text-gray-400 text-base sm:text-[17px] leading-relaxed max-w-[460px] mb-9">
                500+ premium building materials for homes, offices and landmark projects.
                Trusted by architects and homeowners since 2003.
              </p>

              <div className="flex flex-wrap gap-3 mb-12">
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-gray-950 text-white rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors"
                >
                  Browse Collection <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-teal-500 text-white rounded-full font-semibold text-sm hover:bg-teal-600 transition-colors shadow-sm shadow-teal-500/25"
                >
                  Free Quote
                </Link>
              </div>

              {/* Inline stats */}
              <div className="flex flex-wrap items-center gap-x-7 gap-y-4 pt-6 border-t border-gray-100">
                {STATS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
                  >
                    <p className="text-xl font-black text-gray-950 leading-none">{s.value}</p>
                    <p className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase mt-0.5">{s.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Photo montage — desktop only */}
            <div className="relative hidden lg:block h-[540px]">
              {/* Main card */}
              <motion.div
                initial={{ opacity: 0, y: 48, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-0 w-[300px] h-[400px] rounded-3xl overflow-hidden shadow-2xl shadow-gray-200"
              >
                <img
                  src={SHOWCASE[0].src}
                  alt="Premium Marble"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <p className="text-white/60 text-[10px] tracking-[0.25em] uppercase font-semibold">Premium</p>
                  <p className="text-white font-bold text-lg leading-tight">Italian Marble</p>
                </div>
              </motion.div>

              {/* Secondary card */}
              <motion.div
                initial={{ opacity: 0, x: -32, rotate: -5 }}
                animate={{ opacity: 1, x: 0, rotate: -3 }}
                transition={{ duration: 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-8 left-4 w-[220px] h-[175px] rounded-2xl overflow-hidden shadow-xl border-4 border-white"
              >
                <img
                  src={SHOWCASE[2].src}
                  alt="Designer Tiles"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <p className="absolute bottom-3.5 left-4 text-white font-bold text-sm">Designer Tiles</p>
              </motion.div>

              {/* Teal accent chip */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7, type: "spring", stiffness: 300 }}
                className="absolute top-[240px] left-[80px] bg-teal-500 text-white rounded-2xl px-4 py-3 shadow-lg shadow-teal-500/30"
              >
                <p className="text-[10px] font-black tracking-wider uppercase text-teal-100">In Stock</p>
                <p className="text-white font-black text-lg leading-none">500+</p>
                <p className="text-teal-100 text-[11px]">Materials</p>
              </motion.div>

              {/* Third small card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute top-12 left-2 w-[130px] h-[130px] rounded-2xl overflow-hidden shadow-lg border-4 border-white"
              >
                <img
                  src={SHOWCASE[1].src}
                  alt="Quartz"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <p className="absolute bottom-2.5 left-3 text-white font-bold text-xs">Quartz</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border border-gray-300 flex items-start justify-center pt-1.5"
          >
            <div className="w-0.5 h-2 rounded-full bg-gray-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════ EDITORIAL SHOWCASE ══════ */}
      <section className="bg-white pb-8 sm:pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row gap-3 h-auto sm:h-[540px]">

            {/* Large left — Marble */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex-[2] min-h-[300px] sm:min-h-0 rounded-3xl overflow-hidden group cursor-pointer"
            >
              <Link href="/discover?search=marble" className="block w-full h-full">
                <img
                  src={SHOWCASE[0].src}
                  alt="Marble"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white/60 text-[10px] tracking-[0.25em] uppercase font-semibold mb-1">Our finest</p>
                  <p className="text-white font-black text-3xl leading-none mb-2">Marble</p>
                  <div className="flex items-center gap-1.5 text-teal-300 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                    Explore collection <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Right column — two stacked */}
            <div className="flex sm:flex-col gap-3 flex-1">
              {[SHOWCASE[1], SHOWCASE[2]].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.12 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex-1 min-h-[160px] sm:min-h-0 rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <Link href={`/discover?search=${s.search}`} className="block w-full h-full">
                    <img
                      src={s.src}
                      alt={s.label}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <p className="text-white font-bold text-base">{s.label}</p>
                    </div>
                    <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Material categories — scrollable pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {["Marble", "Quartz", "Tiles", "Sanitaryware", "Cement", "TMT Bars", "Stone"].map((m) => (
              <Link
                key={m}
                href={`/discover?search=${m.toLowerCase()}`}
                className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-[12px] font-semibold hover:bg-teal-50 hover:text-teal-700 transition-colors"
              >
                {m}
              </Link>
            ))}
            <Link
              href="/discover"
              className="px-4 py-2 rounded-full border border-gray-200 text-gray-400 text-[12px] font-semibold hover:text-gray-700 transition-colors"
            >
              View all →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════ CATEGORIES ══════ */}
      <section className="py-20 sm:py-28 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] text-gray-400 tracking-[0.3em] uppercase font-semibold mb-2">Collections</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950">Shop by Category</h2>
            </div>
            <Link href="/discover" className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {displayCats.map((cat, i) => {
              const meta = CATEGORY_META[(cat as any).name?.toLowerCase()] || { img: SHOWCASE[0].src, desc: "" };
              return (
                <motion.div
                  key={(cat as any).id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                >
                  <Link
                    href={`/discover?categoryId=${(cat as any).id}`}
                    className="group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl"
                    style={{ aspectRatio: "3/4" }}
                  >
                    <img
                      src={meta.img}
                      alt={(cat as any).name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    <div className="relative mt-auto p-4 sm:p-5">
                      <h3 className="text-white font-bold text-base sm:text-lg leading-tight">{(cat as any).name}</h3>
                      <p className="text-white/60 text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">{meta.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-5 md:hidden">
            <Link href="/discover" className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              All materials <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════ BRAND STATEMENT ══════ */}
      <section className="py-20 sm:py-28 bg-gray-950 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] text-teal-400 tracking-[0.35em] uppercase font-bold mb-8">Our Philosophy</p>
            <h2
              className="font-black text-white tracking-[-0.03em] leading-[1.08]"
              style={{ fontSize: "clamp(1.9rem, 5vw, 3.6rem)" }}
            >
              A space shouldn't just be built.{" "}
              <span className="text-teal-400">It should be carved,</span>{" "}
              curated, and crafted with intention.
            </h2>
            <div className="flex items-center gap-4 justify-center mt-8">
              <div className="h-px w-8 bg-teal-500/40" />
              <p className="text-sm text-gray-500 font-semibold tracking-widest uppercase">AB Stone World Pvt. Ltd.</p>
              <div className="h-px w-8 bg-teal-500/40" />
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
            >
              Our story <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════ FEATURED PRODUCTS ══════ */}
      {featuredProducts.length > 0 && (
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[10px] text-gray-400 tracking-[0.3em] uppercase font-semibold mb-2">Handpicked</p>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950">Featured Selection</h2>
              </div>
              <Link href="/discover" className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                >
                  <Link href={`/discover/${product.id}`} className="group block">
                    <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100 mb-3.5 relative">
                      <ProductImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {product.available && (
                        <div className="absolute top-3 left-3 bg-white/90 text-teal-600 text-[9px] tracking-wider font-bold uppercase px-2 py-0.5 rounded-full">
                          In Stock
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">{product.categoryName}</p>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-teal-600 transition-colors leading-snug">{product.name}</h3>
                    {product.price && (
                      <p className="text-sm font-black text-gray-800 mt-1">
                        ₹{product.price}
                        <span className="text-xs font-normal text-gray-400 ml-0.5">/{product.priceUnit || "sq.ft"}</span>
                      </p>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════ PROCESS ══════ */}
      <section className="py-20 sm:py-28 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-end justify-between mb-14 sm:mb-16">
            <div>
              <p className="text-[10px] text-gray-400 tracking-[0.3em] uppercase font-semibold mb-2">The Process</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950">From Browse to Beautiful</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-10 sm:gap-12">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col"
              >
                <p className="text-4xl font-black text-gray-100 leading-none mb-5 tracking-tight">{step.num}</p>
                <h3 className="text-lg font-bold text-gray-950 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CTA BANNER ══════ */}
      <section className="py-20 sm:py-24 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-8"
          >
            <div>
              <p className="text-[10px] text-gray-400 tracking-[0.3em] uppercase font-semibold mb-3">Start Today</p>
              <h2
                className="font-black tracking-tight text-gray-950 leading-[1.06]"
                style={{ fontSize: "clamp(1.8rem, 4.5vw, 3rem)" }}
              >
                Ready to build something<br className="hidden sm:block" /> extraordinary?
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-teal-500 text-white rounded-full font-semibold text-sm hover:bg-teal-600 transition-colors shadow-sm shadow-teal-500/25"
              >
                Get a Free Quote <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-gray-200 text-gray-700 rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Browse Materials
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════ JOURNAL ══════ */}
      {blogPosts.length > 0 && (
        <section className="py-20 sm:py-28 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[10px] text-gray-400 tracking-[0.3em] uppercase font-semibold mb-2">Insights</p>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950">From the Journal</h2>
              </div>
              <Link href="/blog" className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors">
                All articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              {blogPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`} className="group block">
                    {post.coverImageUrl && (
                      <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100 mb-4">
                        <img
                          src={post.coverImageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mb-1.5">
                      {format(new Date(post.createdAt), "MMM d, yyyy")}
                    </p>
                    <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors leading-snug text-base line-clamp-2">{post.title}</h3>
                    <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-gray-400 group-hover:text-teal-500 transition-colors">
                      Read article <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
