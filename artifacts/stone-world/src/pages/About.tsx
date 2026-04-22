import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, MapPin, Award, Users, Layers, Target, Globe, Heart, Zap } from "lucide-react";

const TIMELINE = [
  { year: "2003", title: "The Foundation", desc: "AB Stone World is established in Pitampura, Delhi, with a curated selection of premium Indian marble. A singular vision: bring the finest building materials to every home and project." },
  { year: "2008", title: "Expanding Categories", desc: "We grow beyond marble to include tiles, quartz, and cement — becoming the NCR's go-to destination for builders, contractors, and interior designers seeking quality at scale." },
  { year: "2013", title: "B2B Partnerships", desc: "Strategic tie-ups with major real estate developers and construction firms. AB Stone World begins supplying materials for large-scale commercial and residential projects across Delhi NCR." },
  { year: "2018", title: "Digital Transformation", desc: "Launch of our online product catalog and enquiry system, opening our doors to customers across India. Material discovery becomes effortless, accessible from anywhere, anytime." },
  { year: "2021", title: "National Expansion", desc: "Pan-India delivery capabilities introduced. Our catalog expands to include sanitaryware, ceramic, TMT bars, and natural stone — a true one-stop destination for all building materials." },
  { year: "2024", title: "20 Years Strong", desc: "Celebrating two decades of excellence. 10,000+ projects delivered. 500+ premium materials in catalog. Trusted by homeowners, architects, and developers across every major Indian city." },
];

const VALUES = [
  { icon: Award, title: "Uncompromising Quality", desc: "Every slab, tile, and bar we supply passes rigorous quality checks. Our name on a material means our full commitment to its excellence." },
  { icon: Heart, title: "Customer First, Always", desc: "A complete 360° experience — whether you're a homeowner choosing bathroom tiles or a developer planning 200 apartments. Your vision drives our work." },
  { icon: Zap, title: "Material Intelligence", desc: "Two decades of sourcing expertise means we know which marble holds up in coastal climates, which tile works outdoors, and what your budget can truly achieve." },
  { icon: Globe, title: "Responsible Sourcing", desc: "We partner with quarries and manufacturers who share our commitment to ethical extraction, fair labour, and environmentally responsible practices." },
];

const STATS = [
  { value: "2003", label: "Founded" },
  { value: "10,000+", label: "Projects Delivered" },
  { value: "500+", label: "Materials in Catalog" },
  { value: "50+", label: "Brand Partners" },
];

export default function About() {
  return (
    <div className="bg-white">

      {/* ── HERO ── */}
      <section className="relative min-h-[70vh] flex items-end pb-16 overflow-hidden bg-gray-950 pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `radial-gradient(ellipse at 30% 70%, rgba(0,180,180,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(0,180,180,0.08) 0%, transparent 50%)`,
          }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <p className="text-teal-400 text-[11px] tracking-[0.35em] font-semibold uppercase">Our Story</p>
            <h1
              className="font-black tracking-tight text-white leading-[1.0]"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
            >
              A Legacy<br />Carved in Stone.
            </h1>
            <p className="text-white/50 text-base sm:text-lg max-w-xl leading-relaxed">
              Twenty years of curating India's finest building materials. One city. One vision. A nation transformed.
            </p>
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Pitampura, New Delhi · Est. 2003</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHO WE ARE ── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold mb-4">Who We Are</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950 leading-[1.1]">
                India's Premier Destination for Luxury Building Materials
              </h2>
            </div>
            <div className="space-y-5 text-gray-500 leading-relaxed">
              <p>
                What began as a singular vision in 2003 — to bring exquisite marble to local builders in Delhi — has grown into something far greater. AB Stone World Pvt. Ltd. is today one of India's most trusted names in premium building materials.
              </p>
              <p>
                We are the bridge between raw geological magnificence and the refined spaces where people live, work, and dream. Our catalog spans marble, quartz, tiles, ceramic, sanitaryware, cement, TMT bars, and natural stone — each category curated with the same obsessive attention to quality and authenticity.
              </p>
              <p>
                We don't just sell materials. We consult, advise, source globally, and deliver nationally. From a homeowner renovating a bathroom to a developer building an entire township — we serve every scale with equal care, deep expertise, and absolute commitment.
              </p>
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 text-teal-500 font-semibold text-sm hover:text-teal-700 transition-colors"
              >
                Browse our collection <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 bg-gray-950">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {STATS.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <p className="text-3xl sm:text-4xl font-black text-teal-400 tracking-tight">{m.value}</p>
                <p className="text-[11px] text-gray-500 mt-2 font-medium tracking-wider uppercase">{m.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold mb-3">Purpose</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">Mission &amp; Vision</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-3xl bg-gray-950 text-white"
            >
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 flex items-center justify-center mb-6">
                <Target className="w-5 h-5 text-teal-400" />
              </div>
              <p className="text-[11px] text-teal-400 tracking-[0.3em] uppercase font-semibold mb-3">Mission</p>
              <h3 className="text-xl sm:text-2xl font-bold leading-snug mb-4">
                Making every home an extraordinary place to live — through beautiful, responsibly sourced building materials that inspire.
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We exist to democratize access to premium materials — making world-class quality achievable for every budget, every project, every Indian home and commercial space.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="p-8 rounded-3xl border border-gray-100 bg-gray-50"
            >
              <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center mb-6">
                <Layers className="w-5 h-5 text-teal-500" />
              </div>
              <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold mb-3">Vision</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-4">
                A completely seamless, 360° material selection experience — from first browse to final installation.
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We're building the future of construction retail in India — where choosing the right materials is an inspiring journey, not a stressful one.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="py-24 sm:py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold mb-3">Our Journey</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">Two Decades of Excellence</h2>
          </div>
          <div className="relative">
            <div className="absolute left-5 top-2 bottom-2 w-px bg-gray-200" />
            <div className="space-y-10">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="relative pl-16"
                >
                  <div className="absolute left-0 top-0.5 w-10 h-10 rounded-xl bg-white border-2 border-teal-500 flex items-center justify-center shadow-sm shadow-teal-200">
                    <span className="text-teal-600 font-black text-[9px] leading-none text-center">{item.year}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-950 mb-1.5">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold mb-3">What We Stand For</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex gap-5 p-6 rounded-2xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <val.icon className="w-5 h-5 text-teal-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-950 mb-2">{val.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{val.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section className="py-20 sm:py-28 bg-gray-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-5"
          >
            <p className="text-teal-400 text-4xl font-black">"</p>
            <h2
              className="font-bold text-white leading-snug"
              style={{ fontSize: "clamp(1.4rem, 3.5vw, 2.5rem)" }}
            >
              No customer should feel left behind. Every dream project deserves its own masterpiece — regardless of budget or scale.
            </h2>
            <div className="flex items-center gap-3 justify-center">
              <div className="h-px w-8 bg-teal-500/40" />
              <p className="text-gray-500 text-sm font-medium">AB Stone World · Leadership Team</p>
              <div className="h-px w-8 bg-teal-500/40" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SEO CONTENT ── */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold mb-3">Why Choose Us</p>
              <h2 className="text-2xl font-black tracking-tight text-gray-950 mb-4">The Stone World Advantage</h2>
            </div>
            <div className="md:col-span-2 prose prose-gray max-w-none text-sm leading-relaxed text-gray-500">
              <p>
                <strong className="text-gray-800">AB Stone World Pvt. Ltd.</strong> has been at the forefront of India's premium building materials industry since 2003. Based in Pitampura, New Delhi, we have built an unmatched reputation for quality, reliability, and deep material expertise that few companies in the country can match.
              </p>
              <p className="mt-4">
                Our strength lies not just in the breadth of our catalog — which covers everything from Italian Statuario marble to engineered quartz countertops, vitrified tiles to designer sanitaryware, structural TMT bars to decorative ceramic — but in the depth of our expertise. Our team of material specialists brings decades of combined experience in sourcing, quality assessment, and project consultation.
              </p>
              <p className="mt-4">
                We are proud to serve a diverse client base that includes individual homeowners undertaking personal renovation projects, interior designers and architects seeking premium materials for high-end projects, real estate developers building residential and commercial complexes, and construction contractors requiring materials at scale with reliable delivery timelines.
              </p>
              <p className="mt-4">
                Our commitment to responsible sourcing means we work only with quarries, manufacturers, and distributors who adhere to ethical practices — ensuring that the beauty we help create doesn't come at the cost of people or the environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 sm:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">Ready to Start Your Project?</h2>
          <p className="text-gray-500 leading-relaxed text-sm">
            Our material specialists are ready to guide you. Free consultation, expert recommendations, and pan-India delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gray-950 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
            >
              Talk to an Expert <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              Browse the Collection
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
