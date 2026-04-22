import { Footer } from "@/components/Footer";
import { useListProducts, useListCategories, useListBlogPosts } from "@workspace/api-client-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Shield, Truck, Star, Award, Phone } from "lucide-react";
import { format } from "date-fns";

const CATEGORY_META: Record<string, { img: string; desc: string }> = {
  marble: { img: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&q=80&auto=format&fit=crop", desc: "Timeless Italian & Indian slabs for floors, walls and statement pieces." },
  tiles: { img: "https://images.unsplash.com/photo-1615971677499-5467cbab01b0?w=800&q=80&auto=format&fit=crop", desc: "From porcelain to designer, tiles that define every room." },
  quartz: { img: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80&auto=format&fit=crop", desc: "Engineered precision for countertops, vanities and more." },
  cement: { img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80&auto=format&fit=crop", desc: "Premium grades for structural foundations and finishes." },
  "cement & concrete": { img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80&auto=format&fit=crop", desc: "Premium grades for structural foundations and finishes." },
  sanitaryware: { img: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80&auto=format&fit=crop", desc: "Luxury bathware from the world's leading brands." },
  ceramic: { img: "https://images.unsplash.com/photo-1553787434-dd9eb4ea4d0e?w=800&q=80&auto=format&fit=crop", desc: "Artisan ceramics blending tradition with modern aesthetics." },
  "ceramic items": { img: "https://images.unsplash.com/photo-1553787434-dd9eb4ea4d0e?w=800&q=80&auto=format&fit=crop", desc: "Artisan ceramics blending tradition with modern aesthetics." },
  "tmt bars": { img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80&auto=format&fit=crop", desc: "High-strength steel for commercial and residential construction." },
  "tmt bars & steel": { img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80&auto=format&fit=crop", desc: "High-strength steel for commercial and residential construction." },
  stone: { img: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80&auto=format&fit=crop", desc: "Natural stone varieties for outdoor and indoor grandeur." },
  "natural stone": { img: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80&auto=format&fit=crop", desc: "Natural stone varieties for outdoor and indoor grandeur." },
  "sand & aggregates": { img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80&auto=format&fit=crop", desc: "Quality aggregates for construction and landscaping." },
};

const MATERIALS = [
  { name: "Marble", tagline: "Geological royalty", desc: "Sourced from Rajasthan quarries and Italian mountains. No two slabs are alike.", search: "marble" },
  { name: "Quartz", tagline: "Engineered excellence", desc: "93% natural quartz fused with resins for surfaces that are hard, non-porous, and endlessly beautiful.", search: "quartz" },
  { name: "Tiles", tagline: "Every surface, covered", desc: "From rustic terracotta to ultra-glossy large-format porcelain. Thousands of patterns.", search: "tiles" },
  { name: "Sanitaryware", tagline: "Luxury bathware", desc: "Premium commodes, basins, and shower systems from international brands.", search: "sanitaryware" },
];

const STEPS = [
  { num: "01", title: "Browse Our Collection", desc: "Explore 500+ materials across 8 categories. Filter by type, origin, and budget." },
  { num: "02", title: "Submit Your Enquiry", desc: "Tell us your project. Our experts match you with perfect materials and price." },
  { num: "03", title: "Receive & Install", desc: "Pan-India delivery to your site, with optional installation coordination." },
];

const TRUST = [
  { icon: Shield, label: "Quality Certified", desc: "Every material passes rigorous checks" },
  { icon: Truck, label: "Pan-India Delivery", desc: "Any pin code, on time" },
  { icon: Star, label: "Expert Guidance", desc: "Free consultation included" },
  { icon: Award, label: "50+ Premium Brands", desc: "Indian & International trusted names" },
];

export default function Home() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 180]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  const { data: featuredData } = useListProducts({ limit: 4 });
  const featuredProducts = featuredData?.products || [];

  const { data: blogData } = useListBlogPosts({ published: true, limit: 3 });
  const blogPosts = blogData?.posts || [];

  const { data: categoriesData } = useListCategories();
  const categories = (categoriesData || []).slice(0, 4);

  const fallbackCategories = [
    { id: 1, name: "Marble", slug: "marble" },
    { id: 2, name: "Tiles", slug: "tiles" },
    { id: 3, name: "Quartz", slug: "quartz" },
    { id: 4, name: "Sanitaryware", slug: "sanitaryware" },
  ];
  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

  return (
    <div className="bg-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden bg-gray-950">
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 w-full h-[115%] top-0"
        >
          <img
            src="https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=1600&q=80&auto=format&fit=crop"
            alt="Luxury Marble"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/30 via-transparent to-transparent" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/50" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-5 max-w-5xl mx-auto"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-teal-400 text-[11px] tracking-[0.35em] font-semibold uppercase mb-6"
          >
            Est. 2003 · Pitampura, Delhi · India
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-white font-black tracking-[-0.04em] leading-[1.0] mb-6"
            style={{ fontSize: "clamp(2.8rem, 8.5vw, 6.5rem)" }}
          >
            Where Stone<br />
            <span className="text-teal-400">Meets Vision.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white/60 text-base sm:text-lg font-normal max-w-xl mx-auto leading-relaxed mb-10"
          >
            India's premier marketplace for marble, quartz, tiles, and luxury building materials.
            Trusted by 10,000+ projects across the nation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              href="/discover"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-teal-500 text-white font-semibold text-sm hover:bg-teal-400 transition-all duration-200 shadow-lg shadow-teal-500/25"
            >
              Explore the Collection <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/25 text-white font-semibold text-sm hover:bg-white/10 hover:border-white/40 transition-all duration-200"
            >
              Get a Free Quote
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <div className="w-5 h-9 border border-white/30 rounded-full flex justify-center pt-1.5">
            <div className="w-[3px] h-2 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-gray-950 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "20+", label: "Years of Excellence" },
              { value: "10,000+", label: "Projects Delivered" },
              { value: "500+", label: "Premium Materials" },
              { value: "Pan India", label: "Delivery Coverage" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <p className="text-2xl sm:text-3xl font-black text-teal-400 tracking-tight">{stat.value}</p>
                <p className="text-[11px] text-gray-500 font-medium tracking-wider uppercase mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section className="py-28 sm:py-36 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold mb-8">Our Philosophy</p>
            <h2
              className="font-black tracking-tight text-gray-950 leading-[1.1] mb-8"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            >
              A space shouldn't just be built.{" "}
              <span className="text-teal-500">It should be carved,</span>{" "}
              curated, and crafted with intention.
            </h2>
            <div className="flex items-center gap-4 justify-center">
              <div className="h-px w-10 bg-teal-200" />
              <p className="text-sm text-gray-400 font-medium tracking-widest uppercase">AB Stone World Pvt. Ltd.</p>
              <div className="h-px w-10 bg-teal-200" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-8 pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold mb-2">Collections</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">Shop by Category</h2>
            </div>
            <Link href="/discover" className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {displayCategories.map((cat, i) => {
              const meta = CATEGORY_META[cat.name.toLowerCase()] || { img: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&q=80&auto=format&fit=crop", desc: "" };
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                >
                  <Link
                    href={`/discover?categoryId=${cat.id}`}
                    className="group relative flex flex-col aspect-[3/4] overflow-hidden rounded-2xl sm:rounded-3xl"
                  >
                    <img
                      src={meta.img}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="relative mt-auto p-5">
                      <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                      <p className="text-white/60 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{meta.desc}</p>
                      <div className="flex items-center gap-1 mt-1 text-teal-300 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Explore <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FULL-WIDTH QUOTE ── */}
      <section className="py-20 sm:py-28 bg-gray-950 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="flex-1 space-y-6">
              <p className="text-[11px] text-teal-400 tracking-[0.3em] uppercase font-semibold">Our Offering</p>
              <h2
                className="font-black text-white tracking-tight leading-[1.08]"
                style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)" }}
              >
                Premium materials.{" "}
                <span className="text-teal-400">Fair pricing.</span>{" "}
                Expert guidance.
              </h2>
              <p className="text-gray-400 leading-relaxed max-w-lg">
                We bridge the gap between world-class building materials and the Indian homeowner, architect, and developer — with transparency, expertise, and care at every step.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-teal-400 font-semibold text-sm hover:text-teal-300 transition-colors"
              >
                Our story <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3 w-full">
              {MATERIALS.map((mat, i) => (
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
                    <p className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase mb-2">{mat.tagline}</p>
                    <h3 className="text-white font-bold text-base mb-2">{mat.name}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{mat.desc}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      {featuredProducts.length > 0 && (
        <section className="py-24 sm:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold mb-2">Handpicked</p>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">Featured Selection</h2>
              </div>
              <Link href="/discover" className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors">
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
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-400 to-slate-700 flex items-center justify-center">
                          <span className="text-white/20 font-black text-5xl tracking-tight">SW</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-teal-500 font-semibold tracking-wider uppercase mb-0.5">{product.categoryName}</p>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors leading-snug">{product.name}</h3>
                    {product.price && (
                      <p className="text-xs text-gray-400 mt-0.5">₹{product.price}/{product.priceUnit || 'sq.ft'}</p>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 sm:py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold mb-3">The Process</p>
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
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-5">
                  <span className="text-teal-600 font-black text-lg">{step.num}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-950 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold mb-4">Why Stone World</p>
              <h2
                className="font-black tracking-tight text-gray-950 leading-[1.1] mb-6"
                style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
              >
                Two decades of trust,<br />built material by material.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8 text-sm">
                From a homeowner renovating their kitchen to a developer building 200 apartments — we serve every scale with the same commitment to quality. No hidden costs. No compromises.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gray-950 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
              >
                Talk to an expert <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {TRUST.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-teal-200 hover:bg-teal-50/40 transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                    <item.icon className="w-4 h-4 text-teal-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 mb-1">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── JOURNAL ── */}
      {blogPosts.length > 0 && (
        <section className="py-24 sm:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold mb-2">Insights</p>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">The Journal</h2>
              </div>
              <Link href="/blog" className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors">
                All articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {blogPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <Link href={`/blog/${post.slug}`} className="group block">
                    <div className="aspect-[16/10] overflow-hidden rounded-xl bg-gray-200 mb-4">
                      {post.coverImageUrl ? (
                        <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-100 to-slate-200" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium mb-1.5">{format(new Date(post.createdAt), 'MMM d, yyyy')}</p>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-teal-600 transition-colors leading-snug line-clamp-2">{post.title}</h3>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-28 sm:py-36 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=1200&q=80&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <p className="text-[11px] text-teal-400 tracking-[0.3em] uppercase font-semibold">Ready to Begin?</p>
            <h2
              className="font-black text-white tracking-tight leading-[1.05]"
              style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)" }}
            >
              Your dream space starts<br />with the right material.
            </h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
              Free consultation for homeowners, architects, and developers. Our experts guide you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-teal-500 text-white font-semibold text-sm hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20"
              >
                Start Your Enquiry
              </Link>
              <a
                href="tel:+919999999999"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/15 text-white font-semibold text-sm hover:bg-white/8 transition-colors"
              >
                <Phone className="w-4 h-4" /> Call Us Directly
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
