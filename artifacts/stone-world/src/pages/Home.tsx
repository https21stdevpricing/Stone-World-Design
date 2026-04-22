import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[90vh] overflow-hidden flex items-center justify-center">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <img 
            src="/images/hero-marble.png" 
            alt="Luxury Marble Slab" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight"
          >
            Nature's Masterpiece,<br />Your Sanctuary.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto text-white/90"
          >
            India's premier destination for breathtaking marbles, quartz, tiles, and luxury building materials.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 text-lg tracking-wide">
              <Link href="/discover">EXPLORE COLLECTIONS</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* About Strip */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="font-serif text-2xl md:text-3xl italic">
            "Making every home an amazing place to live with breathtaking building materials."
          </p>
          <p className="mt-4 uppercase tracking-[0.2em] text-sm opacity-80">— Est. 2003</p>
        </div>
      </section>

      {/* Category Showcase */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-serif text-foreground">The Collections</h2>
            <p className="text-muted-foreground tracking-wide">Curated perfection for every surface.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Marbles", img: "/images/cat-marble.png", href: "/discover?cat=marble" },
              { title: "Tiles", img: "/images/cat-tiles.png", href: "/discover?cat=tiles" },
              { title: "Quartz", img: "/images/cat-quartz.png", href: "/discover?cat=quartz" },
              { title: "Construction", img: "/images/cat-cement.png", href: "/discover?cat=construction" }
            ].map((cat, i) => (
              <motion.div 
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative aspect-[4/5] overflow-hidden cursor-pointer"
              >
                <Link href={cat.href}>
                  <img src={cat.img} alt={cat.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                  <div className="absolute bottom-8 left-8">
                    <h3 className="text-2xl font-serif text-white">{cat.title}</h3>
                    <div className="h-0.5 w-0 bg-white mt-2 transition-all duration-500 group-hover:w-full" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
