import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, MapPin, Award, Users, Layers } from "lucide-react";

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const TIMELINE = [
  { year: "2003", title: "The Foundation", desc: "AB Stone World is established in Pitampura, Delhi, with a small but curated selection of Indian marble. The vision: bring the finest building materials to every home." },
  { year: "2008", title: "Expanding Categories", desc: "We expand beyond marble to include tiles, quartz, and cement, becoming a true one-stop destination for builders and contractors across NCR." },
  { year: "2013", title: "B2B Partnerships", desc: "Major tie-ups with real estate developers and construction firms. AB Stone World begins supplying materials at scale for commercial and residential projects." },
  { year: "2018", title: "Digital Transformation", desc: "Launch of online catalog and enquiry system. Customers across India can now browse and enquire from anywhere, anytime." },
  { year: "2024", title: "National Footprint", desc: "Serving 10,000+ projects across India. Our catalog grows to 500+ premium materials with pan-India delivery and expert installation guidance." },
];

const VALUES = [
  {
    icon: Award,
    title: "Uncompromising Quality",
    desc: "Every slab, tile, and bar we supply passes through our rigorous quality checks. If it carries our name, it carries our complete commitment."
  },
  {
    icon: Users,
    title: "Customer First, Always",
    desc: "A 360° experience designed for you — whether you're a homeowner choosing bathroom tiles or a developer planning 200 apartments."
  },
  {
    icon: Layers,
    title: "Material Intelligence",
    desc: "Two decades of sourcing experience means we know which marble holds up in humid climates, which tile works best outdoors, and what your budget can truly achieve."
  },
  {
    icon: MapPin,
    title: "Responsible Sourcing",
    desc: "We partner with quarries and manufacturers who share our commitment to ethical extraction, fair labour, and environmentally responsible practices."
  },
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative h-[75vh] min-h-[480px] flex items-end overflow-hidden bg-black pb-16">
        <motion.div
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img src="/images/hero-marble.png" alt="AB Stone World Story" className="w-full h-full object-cover opacity-45" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-5"
          >
            <p className="text-teal-400 text-xs tracking-[0.4em] font-bold uppercase">Our Story</p>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
              A Legacy<br />Carved in Stone
            </h1>
            <p className="text-white/60 text-base sm:text-lg font-normal max-w-xl">
              Twenty years of curating the finest building materials. One city. One vision. A nation transformed.
            </p>
            <div className="flex items-center gap-3 text-white/50 text-sm">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Pitampura, New Delhi · Est. 2003</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STICKY PAGE HEADER ── */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-3">
          <Users className="w-4 h-4 text-teal-500" />
          <span className="text-sm font-semibold text-gray-600">About Us</span>
        </div>
      </div>

      <main className="flex-1">

        {/* ── STORY ── */}
        <section className="py-24 sm:py-32">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div className="space-y-6">
                <p className="text-teal-500 text-xs tracking-[0.4em] font-bold uppercase">Who We Are</p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-snug">
                  India's Premier Destination for Luxury Building Materials
                </h2>
              </div>
              <div className="space-y-5 text-gray-500 leading-relaxed text-base">
                <p>
                  What began as a singular vision in 2003 — to bring exquisite marble to local builders in Delhi — has grown into something far greater. AB Stone World Pvt. Ltd. is today one of India's most trusted names in premium building materials.
                </p>
                <p>
                  We are the bridge between raw geological magnificence and the refined spaces where people live, work, and dream. Our catalog spans marble, quartz, tiles, ceramic, sanitaryware, cement, TMT bars, and natural stone — each category curated with the same obsessive attention to quality.
                </p>
                <p>
                  We don't just sell materials. We consult, advise, source globally, and deliver nationally. From Pitampura, Delhi, we serve homeowners renovating a single bathroom and developers building entire townships — with equal care, expertise, and commitment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── KEY METRICS ── */}
        <section className="py-16 bg-gray-950">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center"
            >
              {[
                { value: "2003", label: "Founded" },
                { value: "10,000+", label: "Projects Delivered" },
                { value: "500+", label: "Materials in Catalog" },
                { value: "50+", label: "Brand Partners" },
              ].map(m => (
                <div key={m.label}>
                  <p className="text-3xl sm:text-4xl font-bold text-teal-400">{m.value}</p>
                  <p className="text-xs text-gray-400 mt-2 font-medium tracking-wider uppercase">{m.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── MISSION & VISION ── */}
        <section className="py-24 sm:py-32">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="space-y-6 p-8 rounded-2xl bg-gray-950 text-white"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <span className="text-teal-400 text-lg font-bold">M</span>
                </div>
                <p className="text-teal-400 text-xs tracking-widest font-bold uppercase">Our Mission</p>
                <h3 className="text-xl sm:text-2xl font-bold leading-snug">
                  Making every home an amazing place to live through breathtaking, responsibly sourced building materials.
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  We exist to democratize access to premium materials — making quality and beauty achievable for every budget, every project, every Indian home.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="space-y-6 p-8 rounded-2xl border border-gray-100 bg-white"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <span className="text-teal-500 text-lg font-bold">V</span>
                </div>
                <p className="text-teal-500 text-xs tracking-widest font-bold uppercase">Our Vision</p>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                  A completely hassle-free, 360° material selection experience — from first browse to final installation.
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
              <p className="text-teal-500 text-xs tracking-[0.4em] font-bold uppercase mb-3">Our Journey</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Two Decades of Excellence</h2>
            </div>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />
              <div className="space-y-12">
                {TIMELINE.map((item, i) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="relative pl-16"
                  >
                    <div className="absolute left-0 top-1 w-12 h-12 rounded-xl bg-white border-2 border-teal-500 flex items-center justify-center shadow-sm">
                      <span className="text-teal-600 font-bold text-[10px] leading-tight text-center">{item.year}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="py-24 sm:py-32 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-teal-500 text-xs tracking-[0.4em] font-bold uppercase mb-3">What We Stand For</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Our Core Values</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-8">
              {VALUES.map((val, i) => (
                <motion.div
                  key={val.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-5 p-6 rounded-2xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <val.icon className="w-5 h-5 text-teal-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-gray-900">{val.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{val.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── QUOTE VISUAL ── */}
        <section className="relative py-24 overflow-hidden bg-gray-950">
          <div className="absolute inset-0 opacity-15">
            <img src="/images/cat-marble.png" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative max-w-4xl mx-auto px-6 text-center space-y-6">
            <p className="text-teal-400 text-4xl font-bold">"</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
              No customer should feel left behind — every dream project deserves its own masterpiece.
            </h2>
            <div className="flex items-center gap-3 justify-center">
              <div className="h-px w-10 bg-teal-500/50" />
              <p className="text-gray-400 text-sm font-medium">AB Stone World · Leadership Team</p>
              <div className="h-px w-10 bg-teal-500/50" />
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Ready to Start Your Project?</h2>
            <p className="text-gray-500 leading-relaxed">
              Get in touch with our material specialists. We'll guide you through our collection, help you choose the right materials, and ensure your project is a success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gray-900 text-white font-semibold text-sm hover:bg-gray-700 transition-colors"
              >
                Talk to an Expert <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Browse the Collection
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
