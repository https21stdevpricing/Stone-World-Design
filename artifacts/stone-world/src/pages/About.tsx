import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-32">
        <div className="container mx-auto px-4 max-w-4xl space-y-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-serif text-foreground">Our Story</h1>
            <p className="text-xl text-muted-foreground font-light">Established in 2003 by passionate builders.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-serif text-primary">Mission</h2>
              <p className="text-lg leading-relaxed text-foreground/80">
                Making every home an amazing place to live with breathtaking building materials. We believe your surroundings shape your life.
              </p>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-serif text-primary">Vision</h2>
              <p className="text-lg leading-relaxed text-foreground/80">
                Making every person's material selection journey completely hassle-free. A true 360° experience in the category from selection to delivery.
              </p>
            </div>
          </div>

          <div className="bg-muted p-12 rounded-2xl text-center space-y-8">
            <h2 className="text-3xl font-serif">Our Values</h2>
            <p className="text-xl font-light leading-relaxed max-w-2xl mx-auto italic">
              "No customer should feel left behind — every dream project gets its own look, its own attention, and its own masterpiece."
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
