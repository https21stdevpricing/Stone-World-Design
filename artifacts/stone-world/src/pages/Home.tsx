import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useListProducts, useListCategories, useListBlogPosts } from "@workspace/api-client-react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Shield, Truck, Star, Award, CheckCircle2, Phone } from "lucide-react";
import { format } from "date-fns";

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};

const STAGGER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
};

const CATEGORY_META: Record<string, { img: string; desc: string }> = {
  marble: { img: "/images/cat-marble.png", desc: "Timeless Italian & Indian slabs for floors, walls and statement pieces." },
  tiles: { img: "/images/cat-tiles.png", desc: "From porcelain to designer, tiles that define every room." },
  quartz: { img: "/images/cat-quartz.png", desc: "Engineered precision for countertops, vanities and more." },
  cement: { img: "/images/cat-cement.png", desc: "Premium grades for structural foundations and finishes." },
  sanitaryware: { img: "/images/cat-marble.png", desc: "Luxury bathware from the world's leading brands." },
  ceramic: { img: "/images/cat-tiles.png", desc: "Artisan ceramics blending tradition with modern aesthetics." },
  "tmt bars": { img: "/images/cat-cement.png", desc: "High-strength steel for commercial and residential construction." },
  stone: { img: "/images/cat-marble.png", desc: "Natural stone varieties for outdoor and indoor grandeur." },
};

const MATERIALS = [
  { name: "Marble", slug: "marble", tagline: "Geological royalty", desc: "Sourced from Rajasthan quarries and Italian mountains. Each slab is unique — no two patterns repeat in nature.", color: "from-stone-100 to-stone-300" },
  { name: "Quartz", slug: "quartz", tagline: "Engineered excellence", desc: "93% natural quartz fused with polymer resins for surfaces that are hard, non-porous, and endlessly beautiful.", color: "from-teal-50 to-teal-200" },
  { name: "Tiles", slug: "tiles", tagline: "Every surface, covered", desc: "Thousands of patterns, textures, and finishes — from rustic terracotta to ultra-glossy large-format porcelain.", color: "from-slate-100 to-slate-300" },
  { name: "Sanitaryware", slug: "sanitaryware", tagline: "Luxury bathware", desc: "Premium commodes, basins, and shower systems. International brands meet expert installation guidance.", color: "from-sky-50 to-sky-200" },
];

const STEPS = [
  { num: "01", title: "Browse the Collection", desc: "Explore 500+ materials across 8 categories. Filter by type, origin, budget and style." },
  { num: "02", title: "Submit Your Enquiry", desc: "Tell us your project scope. We match you with the perfect materials and provide expert recommendations." },
  { num: "03", title: "Receive & Install", desc: "Pan-India delivery to your site, with optional installation coordination and after-sales support." },
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], ["0%", "30%"]);

  const { data: featuredData } = useListProducts({ limit: 4 });
  const featuredProducts = featuredData?.products || [];

  const { data: blogData } = useListBlogPosts({ published: true, limit: 3 });
  const blogPosts = blogData?.posts || [];

  const { data: categoriesData } = useListCategories();
  const categories = (categoriesData || []).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative h-screen min-h-[600px] w-full overflow-hidden bg-black flex items-center justify-center">
        <motion.div style={{ y: heroY }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
          <img src="/images/hero-marble.png" alt="Luxury Marble" className="w-full h-full object-cover opacity-55" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="space-y-6"
          >
            <p className="text-teal-400 text-xs tracking-[0.4em] font-bold uppercase">Est. 2003 · Pitampura, Delhi</p>
            <h1 className="text-white text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.02]">
              Where Every Surface<br />
              <span className="text-teal-400">Tells a Story</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg font-normal max-w-2xl mx-auto leading-relaxed">
              India's premier marketplace for marble, stone, quartz, tiles, and luxury building materials.
              Serving homeowners, architects, and developers across India since 2003.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="bg-teal-500 hover:bg-teal-400 text-white rounded-full px-10 py-6 text-sm font-semibold shadow-lg shadow-teal-500/30 transition-all duration-300">
                <Link href="/discover">Explore the Collection</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 rounded-full px-10 py-6 text-sm font-semibold bg-transparent">
                <Link href="/contact">Get a Free Consultation</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-14 bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            variants={STAGGER}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: "20+", label: "Years of legacy" },
              { value: "10,000+", label: "Projects delivered" },
              { value: "500+", label: "Premium materials" },
              { value: "Pan India", label: "Delivery coverage" },
            ].map(stat => (
              <motion.div key={stat.label} variants={FADE_UP} className="space-y-1">
                <p className="text-3xl sm:text-4xl font-bold text-teal-400">{stat.value}</p>
                <p className="text-xs text-gray-400 font-medium tracking-wider uppercase">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── BRAND MANIFESTO ── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            variants={STAGGER}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="space-y-8"
          >
            <motion.p variants={FADE_UP} className="text-teal-500 text-xs tracking-[0.4em] font-bold uppercase">Our Philosophy</motion.p>
            <motion.h2 variants={FADE_UP} className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              "A space should not just be built.<br />It should be <em className="not-italic text-teal-500">carved, curated,</em><br />and crafted with intention."
            </motion.h2>
            <motion.div variants={FADE_UP} className="flex items-center gap-4 justify-center">
              <div className="h-px w-12 bg-teal-200" />
              <p className="text-sm text-gray-500 font-medium tracking-widest uppercase">AB Stone World Pvt. Ltd.</p>
              <div className="h-px w-12 bg-teal-200" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-teal-500 text-xs tracking-[0.4em] font-bold uppercase mb-3">Collections</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Shop by Category</h2>
            </div>
            <Link href="/discover" className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <motion.div
            variants={STAGGER}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {(categories.length > 0 ? categories : [
              { id: 1, name: "Marble", slug: "marble" },
              { id: 2, name: "Tiles", slug: "tiles" },
              { id: 3, name: "Quartz", slug: "quartz" },
              { id: 4, name: "Sanitaryware", slug: "sanitaryware" },
            ]).map((cat) => {
              const meta = CATEGORY_META[cat.name.toLowerCase()] || { img: "/images/cat-marble.png", desc: "" };
              return (
                <motion.div key={cat.id} variants={FADE_UP}>
                  <Link
                    href={`/discover?categoryId=${cat.id}`}
                    className="group relative block aspect-[3/4] overflow-hidden bg-gray-200 rounded-2xl"
                  >
                    <img
                      src={meta.img}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <h3 className="text-white text-lg sm:text-xl font-bold">{cat.name}</h3>
                      <p className="text-white/60 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{meta.desc}</p>
                      <div className="flex items-center gap-1 mt-3 text-teal-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Explore <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-teal-500 text-xs tracking-[0.4em] font-bold uppercase mb-3">The Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">From Browse to Beautiful</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">A streamlined journey from discovery to delivery, guided by our expert team at every step.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative"
              >
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%+1.25rem)] w-10 h-px bg-gray-200 z-0" />
                )}
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
                    <span className="text-teal-600 font-bold text-lg">{step.num}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MATERIALS SPOTLIGHT ── */}
      <section className="py-16 sm:py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-teal-400 text-xs tracking-[0.4em] font-bold uppercase mb-3">Materials</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">What We Offer</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MATERIALS.map((mat, i) => (
              <motion.div
                key={mat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  href={`/discover?search=${encodeURIComponent(mat.slug)}`}
                  className="group flex flex-col h-full p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-teal-500/40 transition-all duration-300"
                >
                  <p className="text-xs text-teal-400 font-bold tracking-wider uppercase mb-2">{mat.tagline}</p>
                  <h3 className="text-xl font-bold text-white mb-3">{mat.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed flex-1">{mat.desc}</p>
                  <div className="flex items-center gap-2 mt-6 text-teal-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Browse {mat.name} <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      {featuredProducts.length > 0 && (
        <section className="py-24 sm:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-teal-500 text-xs tracking-[0.4em] font-bold uppercase mb-3">Handpicked</p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Featured Selection</h2>
              </div>
              <Link href="/discover" className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Link href={`/discover/${product.id}`} className="group block">
                    <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 mb-4 relative">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-500 to-slate-800 flex items-center justify-center">
                          <span className="text-white/20 font-bold text-4xl">SW</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-2xl" />
                    </div>
                    <p className="text-xs text-teal-500 font-bold tracking-widest uppercase mb-1">{product.categoryName}</p>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{product.name}</h3>
                    {product.price && (
                      <p className="text-xs text-gray-500 mt-1">₹{product.price}/{product.priceUnit || 'sq.ft'}</p>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WHY STONE WORLD ── */}
      <section className="py-24 sm:py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <p className="text-teal-500 text-xs tracking-[0.4em] font-bold uppercase mb-3">Why Us</p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-snug">Two decades of trust, built material by material.</h2>
              </div>
              <p className="text-gray-500 leading-relaxed">
                From a homeowner renovating their kitchen to a developer building 200 apartments — we serve every scale with the same commitment to quality and transparency.
                No hidden costs. No compromises. Just the best materials, delivered on time.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, label: "Quality Guaranteed", desc: "Every material inspected before dispatch" },
                  { icon: Truck, label: "Pan-India Delivery", desc: "Reliable logistics to any pin code" },
                  { icon: Star, label: "Expert Guidance", desc: "Free consultation with material specialists" },
                  { icon: Award, label: "Premium Brands", desc: "50+ trusted international and Indian brands" },
                ].map(item => (
                  <div key={item.label} className="flex gap-3 p-4 rounded-xl bg-white border border-gray-100">
                    <item.icon className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-200">
                <img src="/images/cat-marble.png" alt="Quality Materials" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-teal-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">10,000+ Projects</p>
                  <p className="text-xs text-gray-500">Delivered across India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── JOURNAL ── */}
      {blogPosts.length > 0 && (
        <section className="py-24 sm:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-teal-500 text-xs tracking-[0.4em] font-bold uppercase mb-3">Insights</p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">The Journal</h2>
              </div>
              <Link href="/blog" className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                All articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`} className="group block">
                    <div className="aspect-[16/10] overflow-hidden rounded-xl bg-gray-100 mb-5">
                      {post.coverImageUrl ? (
                        <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-100 to-slate-200 flex items-center justify-center">
                          <span className="text-teal-400/50 font-bold text-3xl">SW</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-medium mb-2">{format(new Date(post.createdAt), 'MMM d, yyyy')}</p>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-teal-600 transition-colors leading-snug">{post.title}</h3>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-24 sm:py-32 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="/images/hero-marble.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center space-y-8">
          <p className="text-teal-400 text-xs tracking-[0.4em] font-bold uppercase">Ready to Begin?</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Your dream space starts<br />with the right material.
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Speak with our material specialists today. Free consultation for homeowners, architects, and developers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-teal-500 hover:bg-teal-400 text-white rounded-full px-10 py-6 text-sm font-semibold shadow-lg shadow-teal-500/20">
              <Link href="/contact">Start Your Enquiry</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-full px-10 py-6 text-sm font-semibold bg-transparent">
              <a href="tel:+919999999999" className="flex items-center gap-2"><Phone className="w-4 h-4" /> Call Us Directly</a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
