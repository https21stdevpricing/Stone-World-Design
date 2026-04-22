import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Navbar />
      
      {/* Hero */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-black">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img src="/images/hero-marble.png" alt="AB Stone World Legacy" className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000" />
        </motion.div>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center space-y-6 max-w-4xl px-4 mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold tracking-tight text-white"
          >
            A Legacy Carved in Stone
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white/80 tracking-widest uppercase text-sm font-bold"
          >
            Since 2003 • Pitampura, Delhi
          </motion.p>
        </div>
      </section>

      <main className="flex-1">
        {/* Story Section */}
        <section className="py-24 md:py-32 container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-8 text-lg leading-relaxed text-muted-foreground font-normal">
            <p className="text-3xl font-bold tracking-tight text-foreground leading-snug">
              Based in India's capital region, AB Stone World Pvt. Ltd. has stood as a bastion of luxury building materials for over two decades.
            </p>
            <p>
              What began as a singular vision to supply exquisite marble to local builders has evolved into a premier marketplace serving discerning homeowners, visionary architects, and large-scale contractors across the nation. We are the bridge between raw geological magnificence and refined Indian craftsmanship.
            </p>
            <p>
              We traverse the globe and the deepest quarries of India to curate a staggering portfolio: from pristine imported marble and engineered quartz to robust TMT bars, cement, ceramic, and sanitaryware. We supply the foundation and the finishing touches.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-32 bg-foreground text-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 md:gap-24 max-w-5xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="text-primary text-sm tracking-widest uppercase font-bold">Our Mission</div>
                <h2 className="text-4xl font-bold tracking-tight leading-snug">Making every home an amazing place to live with breathtaking building materials.</h2>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="text-primary text-sm tracking-widest uppercase font-bold">Our Vision</div>
                <h2 className="text-4xl font-bold tracking-tight leading-snug">Making every person's material selection journey completely hassle-free — a true 360° experience.</h2>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-32 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold tracking-tight text-foreground">The Pillars of Our Atelier</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16 max-w-6xl mx-auto">
              {[
                { title: "Quality", desc: "Uncompromising standards in every slab, tile, and bar we supply. If it carries our name, it carries weight." },
                { title: "Trust", desc: "Two decades of transparency. No hidden flaws, no false promises. Just solid commitments." },
                { title: "Innovation", desc: "Continuously updating our catalog to reflect global design trends and advanced material engineering." },
                { title: "Customer-Centricity", desc: "A 360° experience tailored to homeowners and B2B giants alike. We handle the complexity; you enjoy the result." },
                { title: "Sustainability", desc: "Responsible sourcing and efficient logistics designed to respect the earth from which our materials originate." }
              ].map((value, i) => (
                <div key={value.title} className="space-y-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">0{i+1}</div>
                  <h3 className="text-xl font-bold text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground font-normal leading-relaxed text-lg">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Image Anchor */}
        <section className="py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="aspect-video overflow-hidden bg-muted relative">
              <img src="/images/cat-marble.png" alt="Stone World Collection" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-3xl md:text-5xl font-bold tracking-tight max-w-3xl text-center leading-snug px-4">
                  "No customer should feel left behind — every dream project gets its own look, its own attention, and its own masterpiece."
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
