import { Footer } from "@/components/Footer";
import { useListProducts, useListCategories, useListBlogPosts } from "@workspace/api-client-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Shield, Truck, Star, Award, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect, useRef } from "react";
import { ProductImage } from "@/components/ProductImage";

const HERO_WORDS = ["Marble", "Quartz", "Stone", "Tiles", "Vision"];

const SHOWCASE_IMGS = [
  { src: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=900&q=80&auto=format&fit=crop", label: "Marble" },
  { src: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=900&q=80&auto=format&fit=crop", label: "Quartz" },
  { src: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=900&q=80&auto=format&fit=crop", label: "Sanitaryware" },
  { src: "https://images.unsplash.com/photo-1615971677499-5467cbab01b0?w=900&q=80&auto=format&fit=crop", label: "Tiles" },
  { src: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=900&q=80&auto=format&fit=crop", label: "Natural Stone" },
];

const CATEGORY_META: Record<string, { img: string; desc: string }> = {
  marble:              { img: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&q=80&auto=format&fit=crop",  desc: "Timeless Italian & Indian slabs." },
  tiles:               { img: "https://images.unsplash.com/photo-1615971677499-5467cbab01b0?w=800&q=80&auto=format&fit=crop",  desc: "Porcelain to designer, every room." },
  quartz:              { img: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80&auto=format&fit=crop",     desc: "Engineered for countertops & vanities." },
  sanitaryware:        { img: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80&auto=format&fit=crop",     desc: "Luxury bathware from premium brands." },
  ceramic:             { img: "https://images.unsplash.com/photo-1553787434-dd9eb4ea4d0e?w=800&q=80&auto=format&fit=crop",     desc: "Artisan fired ceramics." },
  "ceramic items":     { img: "https://images.unsplash.com/photo-1553787434-dd9eb4ea4d0e?w=800&q=80&auto=format&fit=crop",     desc: "Artisan fired ceramics." },
  cement:              { img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80&auto=format&fit=crop",     desc: "Premium structural grades." },
  "cement & concrete": { img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80&auto=format&fit=crop",     desc: "Premium structural grades." },
  "tmt bars":          { img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80&auto=format&fit=crop",  desc: "High-strength steel." },
  "tmt bars & steel":  { img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80&auto=format&fit=crop",  desc: "High-strength steel." },
  stone:               { img: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80&auto=format&fit=crop",  desc: "Natural stone grandeur." },
  "natural stone":     { img: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80&auto=format&fit=crop",  desc: "Natural stone grandeur." },
  "sand & aggregates": { img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80&auto=format&fit=crop",  desc: "Quality aggregates." },
};

const FALLBACK_CATEGORIES = [
  { id: 1, name: "Marble",       slug: "marble" },
  { id: 2, name: "Tiles",        slug: "tiles" },
  { id: 3, name: "Quartz",       slug: "quartz" },
  { id: 4, name: "Sanitaryware", slug: "sanitaryware" },
];

const TRUST = [
  { icon: Shield, label: "Quality Certified",  desc: "Rigorous checks on every batch" },
  { icon: Truck,  label: "Pan-India Delivery", desc: "Any pin code, on schedule" },
  { icon: Star,   label: "Expert Guidance",    desc: "Free consultation with every order" },
  { icon: Award,  label: "50+ Premium Brands", desc: "Indian & international names" },
];

const STEPS = [
  { num: "01", title: "Browse the Collection",  desc: "Explore 500+ materials. Filter by type, origin and budget in seconds." },
  { num: "02", title: "Submit Your Enquiry",    desc: "Tell us your project. Experts match you with the perfect material and price." },
  { num: "03", title: "Receive & Transform",    desc: "Pan-India delivery to site with optional installation support." },
];

export default function Home() {
  const [wordIdx, setWordIdx] = useState(0);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 400], [0, -60]);

  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % HERO_WORDS.length), 2600);
    return () => clearInterval(t);
  }, []);

  const { data: featuredData }   = useListProducts({ limit: 4 });
  const { data: blogData }       = useListBlogPosts({ published: true, limit: 3 });
  const { data: categoriesData } = useListCategories();

  const featuredProducts = featuredData?.products || [];
  const blogPosts        = blogData?.posts || [];
  const categories       = (categoriesData || []).slice(0, 4);
  const displayCats      = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  return (
    <div className="bg-white overflow-x-hidden">

      {/* ━━━━ HERO ━━━━ */}
      <section className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full pt-28 pb-16 sm:pt-32 sm:pb-20">
          <motion.div
            style={{ y: heroParallax }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            {/* Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-100 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <p className="text-[11px] text-teal-600 tracking-[0.22em] font-bold uppercase">Est. 2003 · Pitampura, New Delhi</p>
            </div>

            {/* Headline */}
            <h1
              className="font-black text-gray-950 tracking-[-0.04em] leading-[1.03] mb-6"
              style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
            >
              India&rsquo;s Finest{" "}
              <br className="hidden sm:block" />
              <span className="inline-flex items-baseline gap-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIdx}
                    initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="text-teal-500"
                  >
                    {HERO_WORDS[wordIdx]}
                  </motion.span>
                </AnimatePresence>
                <span className="text-gray-950">.</span>
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-400 text-[17px] sm:text-[19px] leading-relaxed max-w-[520px] mb-8 font-light">
              Premium building materials — marble, quartz, tiles &amp; more. Trusted by architects, developers and homeowners across India since&nbsp;2003.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gray-950 text-white rounded-full font-semibold text-sm hover:bg-gray-700 transition-all duration-200 shadow-sm"
              >
                Browse Collection <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-teal-500 text-white rounded-full font-semibold text-sm hover:bg-teal-400 transition-all duration-200 shadow-sm shadow-teal-500/25"
              >
                Get a Free Quote
              </Link>
            </div>

            {/* Material pills */}
            <div className="flex flex-wrap gap-2">
              {["Marble", "Quartz", "Tiles", "Sanitaryware", "Cement", "TMT Bars", "Stone"].map((m) => (
                <Link
                  key={m}
                  href={`/discover?search=${m.toLowerCase()}`}
                  className="px-3.5 py-1.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold hover:bg-teal-50 hover:text-teal-700 transition-colors"
                >
                  {m}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating stats — desktop */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-4"
        >
          {[
            { val: "20+",    sub: "Years of Trust" },
            { val: "10K+",   sub: "Projects Done" },
            { val: "500+",   sub: "Materials" },
          ].map((s, i) => (
            <motion.div
              key={s.val}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
              className="bg-white rounded-2xl px-5 py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-gray-100 text-right"
            >
              <p className="text-2xl font-black text-gray-950 leading-none">{s.val}</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">{s.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border-2 border-gray-300 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-gray-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* ━━━━ MATERIAL SHOWCASE STRIP ━━━━ */}
      <section className="py-0 bg-white overflow-hidden">
        <div className="flex gap-3 sm:gap-4 px-5 sm:px-8 max-w-7xl mx-auto mb-16">
          {SHOWCASE_IMGS.map((img, i) => (
            <motion.div
              key={img.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex-1 min-w-0"
              style={{ aspectRatio: "2/3" }}
            >
              <Link href={`/discover?search=${img.label.toLowerCase()}`} className="block w-full h-full">
                <div className="relative w-full h-full overflow-hidden rounded-2xl sm:rounded-3xl">
                  <img
                    src={img.src}
                    alt={img.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs font-bold tracking-wide">{img.label}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ━━━━ STATS BAR ━━━━ */}
      <section className="bg-gray-50 border-y border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "20+",      label: "Years of Excellence" },
              { value: "10,000+",  label: "Projects Delivered" },
              { value: "500+",     label: "Premium Materials" },
              { value: "Pan India",label: "Delivery Coverage" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <p className="text-2xl sm:text-3xl font-black text-teal-500 tracking-tight">{stat.value}</p>
                <p className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━ CATEGORIES ━━━━ */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] text-teal-500 tracking-[0.3em] uppercase font-black mb-2">Collections</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">Shop by Category</h2>
            </div>
            <Link href="/discover" className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {displayCats.map((cat, i) => {
              const meta = CATEGORY_META[(cat as any).name?.toLowerCase()] || { img: SHOWCASE_IMGS[0].src, desc: "" };
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
                    <div className="relative mt-auto p-5">
                      <h3 className="text-white font-bold text-lg">{(cat as any).name}</h3>
                      <p className="text-white/60 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{meta.desc}</p>
                      <div className="flex items-center gap-1 mt-1.5 text-teal-300 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                        Explore <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-6 md:hidden">
            <Link href="/discover" className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              View all materials <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━━ MANIFESTO ━━━━ */}
      <section className="py-24 sm:py-32 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[10px] text-teal-500 tracking-[0.3em] uppercase font-black mb-8">Our Philosophy</p>
            <h2
              className="font-black tracking-tight text-gray-950 leading-[1.1] mb-8"
              style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)" }}
            >
              A space shouldn't just be built.{" "}
              <span className="text-teal-500">It should be carved,</span>{" "}
              curated, and crafted with intention.
            </h2>
            <div className="flex items-center gap-4 justify-center">
              <div className="h-px w-10 bg-teal-200" />
              <p className="text-sm text-gray-400 font-semibold tracking-widest uppercase">AB Stone World Pvt. Ltd.</p>
              <div className="h-px w-10 bg-teal-200" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━━ DARK OFFERING ━━━━ */}
      <section className="py-20 sm:py-28 bg-gray-950 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="flex-1 space-y-6">
              <p className="text-[10px] text-teal-400 tracking-[0.3em] uppercase font-black">Our Offering</p>
              <h2
                className="font-black text-white tracking-tight leading-[1.08]"
                style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.4rem)" }}
              >
                Premium materials.{" "}
                <span className="text-teal-400">Fair pricing.</span>{" "}
                Expert guidance.
              </h2>
              <p className="text-gray-400 leading-relaxed max-w-lg text-sm">
                We bridge the gap between world-class building materials and the Indian homeowner, architect, and developer — with transparency, expertise, and care at every step.
              </p>
              <Link href="/about" className="inline-flex items-center gap-2 text-teal-400 font-semibold text-sm hover:text-teal-300 transition-colors">
                Our story <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3 w-full">
              {[
                { tag: "Geological royalty",    name: "Marble",       desc: "Sourced from Rajasthan quarries and Italian mountains.",    search: "marble" },
                { tag: "Engineered excellence", name: "Quartz",       desc: "93% natural quartz — hard, non-porous, endlessly beautiful.", search: "quartz" },
                { tag: "Every surface",         name: "Tiles",        desc: "Rustic terracotta to ultra-glossy large-format porcelain.",  search: "tiles" },
                { tag: "Luxury bathware",       name: "Sanitaryware", desc: "Premium systems from international brands.",                 search: "sanitaryware" },
              ].map((mat, i) => (
                <motion.div
                  key={mat.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <Link
                    href={`/discover?search=${encodeURIComponent(mat.search)}`}
                    className="group block p-5 rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.07] hover:border-teal-500/30 transition-all duration-250"
                  >
                    <p className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase mb-2">{mat.tag}</p>
                    <h3 className="text-white font-bold text-base mb-1.5">{mat.name}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{mat.desc}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━ FEATURED PRODUCTS ━━━━ */}
      {featuredProducts.length > 0 && (
        <section className="py-24 sm:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[10px] text-teal-500 tracking-[0.3em] uppercase font-black mb-2">Handpicked</p>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">Featured Selection</h2>
              </div>
              <Link href="/discover" className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                >
                  <Link href={`/discover/${product.id}`} className="group block">
                    <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 mb-3 relative">
                      <ProductImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <p className="text-[10px] text-teal-500 font-bold tracking-wider uppercase mb-0.5">{product.categoryName}</p>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors leading-snug">{product.name}</h3>
                    {product.price && (
                      <p className="text-xs text-gray-400 mt-0.5">₹{product.price}/{product.priceUnit || "sq.ft"}</p>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ━━━━ HOW IT WORKS ━━━━ */}
      <section className="py-24 sm:py-32 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[10px] text-teal-500 tracking-[0.3em] uppercase font-black mb-3">The Process</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">From Browse to Beautiful</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="flex flex-col items-start"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-5 shrink-0">
                  <span className="text-teal-600 font-black text-lg">{step.num}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-950 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━ WHY US ━━━━ */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[10px] text-teal-500 tracking-[0.3em] uppercase font-black mb-4">Why Stone World</p>
              <h2
                className="font-black tracking-tight text-gray-950 leading-[1.1] mb-6"
                style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
              >
                Two decades of trust,<br />built material by material.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8 text-sm">
                Since 2003 we've been the trusted name in premium building materials — for architects, contractors and homeowners who refuse to compromise.
              </p>
              <Link href="/about" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-950 text-white text-sm font-semibold hover:bg-gray-700 transition-colors">
                Our Story <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {TRUST.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="p-5 rounded-2xl bg-gray-50 border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-teal-500" />
                  </div>
                  <h3 className="font-bold text-gray-950 text-sm mb-1">{item.label}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━ CTA BANNER ━━━━ */}
      <section className="py-16 sm:py-20 bg-teal-500">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to build something extraordinary?
            </h2>
            <p className="text-teal-100 text-base max-w-lg mx-auto">
              Talk to our material specialists. Get personalised recommendations and a quote within 24 hours.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-600 rounded-full font-bold text-sm hover:bg-teal-50 transition-colors shadow-sm"
              >
                Get a Free Quote <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 text-white rounded-full font-bold text-sm hover:bg-teal-700 transition-colors"
              >
                Browse Materials
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━━ BLOG ━━━━ */}
      {blogPosts.length > 0 && (
        <section className="py-24 sm:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[10px] text-teal-500 tracking-[0.3em] uppercase font-black mb-2">Insights</p>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">From the Journal</h2>
              </div>
              <Link href="/blog" className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors">
                All articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
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
                    <p className="text-[10px] text-teal-500 font-bold tracking-wider uppercase mb-1.5">
                      {format(new Date(post.createdAt), "MMM d, yyyy")}
                    </p>
                    <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors leading-snug line-clamp-2">{post.title}</h3>
                    <div className="flex items-center gap-1 mt-2.5 text-xs font-semibold text-gray-400 group-hover:text-teal-500 transition-colors">
                      Read more <ChevronRight className="w-3.5 h-3.5" />
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
