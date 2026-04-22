import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useListProducts, useListCategories, useListBlogPosts } from "@workspace/api-client-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  const { data: featuredProductsData } = useListProducts({ limit: 4 });
  const featuredProducts = featuredProductsData?.products || [];

  const { data: blogData } = useListBlogPosts({ published: true, limit: 3 });
  const blogPosts = blogData?.posts || [];

  const { data: categoriesData } = useListCategories();
  const categories = categoriesData || [];

  const categoryImages: Record<string, string> = {
    "marble": "/images/cat-marble.png",
    "tiles": "/images/cat-tiles.png",
    "quartz": "/images/cat-quartz.png",
    "sanitaryware": "/images/cat-marble.png", // fallback
    "ceramic": "/images/cat-tiles.png", // fallback
    "cement": "/images/cat-cement.png",
    "tmt bars": "/images/cat-cement.png", // fallback
    "stone": "/images/cat-marble.png" // fallback
  };

  const defaultCategories = [
    { id: 1, name: "Marble", slug: "marble" },
    { id: 2, name: "Tiles", slug: "tiles" },
    { id: 3, name: "Quartz", slug: "quartz" },
    { id: 4, name: "Sanitaryware", slug: "sanitaryware" }
  ];

  const displayCategories = categories.length > 0 ? categories.slice(0, 4) : defaultCategories;

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        <motion.div style={{ y: y1 }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
          <img
            src="/images/hero-marble.png"
            alt="Luxury Marble"
            className="w-full h-full object-cover opacity-60"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background/90" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.2, 0.65, 0.3, 0.9] }}
          >
            <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight leading-tight mb-6">
              Geological Magnificence,<br />Refined.
            </h1>
            <p className="text-white/80 text-lg md:text-xl font-light max-w-2xl mx-auto mb-10 tracking-wide">
              Step into a curated gallery of the world's finest marble, stone, and luxury building materials. Every surface whispers quality.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none px-8 py-7 text-sm tracking-[0.2em] uppercase transition-all duration-300">
              <Link href="/discover">Enter the Collection</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-b border-border/40 py-12 bg-background relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/40">
            <div className="space-y-2">
              <h3 className="text-4xl font-serif text-primary">20+</h3>
              <p className="text-xs tracking-widest text-muted-foreground uppercase">Years Legacy</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-serif text-primary">10k+</h3>
              <p className="text-xs tracking-widest text-muted-foreground uppercase">Projects</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-serif text-primary">50+</h3>
              <p className="text-xs tracking-widest text-muted-foreground uppercase">Premium Brands</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-serif text-primary">All India</h3>
              <p className="text-xs tracking-widest text-muted-foreground uppercase">Delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Manifesto */}
      <section className="py-32 bg-foreground text-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-serif leading-snug">
              "We believe a space should not just be built; it should be carved, curated, and crafted with intention. Making every home an amazing place to live."
            </h2>
            <div className="w-12 h-1 bg-primary mx-auto" />
            <p className="text-muted text-sm tracking-widest uppercase">AB Stone World Pvt. Ltd.</p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-16">
            <div className="space-y-4">
              <h2 className="text-4xl font-serif text-foreground">Curated Categories</h2>
              <p className="text-muted-foreground tracking-wide">Materials sourced for uncompromising quality.</p>
            </div>
            <Button asChild variant="ghost" className="hidden md:flex hover:bg-transparent hover:text-primary tracking-widest uppercase text-xs">
              <Link href="/discover">View All Categories <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayCategories.map((cat, i) => {
              const imagePath = categoryImages[cat.name.toLowerCase()] || "/images/cat-marble.png";
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Link href={`/discover?categoryId=${cat.id}`} className="group block relative aspect-[3/4] overflow-hidden bg-muted">
                    <img
                      src={imagePath}
                      alt={cat.name}
                      className="absolute w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 transition-opacity duration-500 group-hover:bg-black/40" />
                    <div className="absolute inset-x-0 bottom-0 p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-white text-2xl font-serif">{cat.name}</h3>
                      <div className="w-0 h-[1px] bg-white mt-4 transition-all duration-500 group-hover:w-full" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-32 bg-muted/30 border-y border-border/40">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-serif text-foreground">Featured Selection</h2>
              <p className="text-muted-foreground tracking-wide">Handpicked surfaces of extraordinary character.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Link href={`/discover/${product.id}`} className="group block">
                    <div className="aspect-[4/5] overflow-hidden bg-muted mb-6 relative">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                      )}
                    </div>
                    <div className="space-y-2 text-center">
                      <p className="text-xs tracking-widest text-muted-foreground uppercase">{product.categoryName}</p>
                      <h3 className="text-lg font-serif text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <Button asChild variant="outline" className="rounded-none px-8 py-6 text-xs tracking-widest uppercase border-foreground text-foreground hover:bg-foreground hover:text-background transition-all duration-300">
                <Link href="/discover">Explore Full Catalog</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Journal Teaser */}
      {blogPosts.length > 0 && (
        <section className="py-32 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-16">
              <div className="space-y-4">
                <h2 className="text-4xl font-serif text-foreground">The Journal</h2>
                <p className="text-muted-foreground tracking-wide">Insights from the world of luxury materials.</p>
              </div>
              <Button asChild variant="ghost" className="hidden md:flex hover:bg-transparent hover:text-primary tracking-widest uppercase text-xs">
                <Link href="/blog">Read All Articles <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {blogPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`} className="group block">
                    <div className="aspect-[16/10] overflow-hidden bg-muted mb-6">
                      {post.coverImageUrl ? (
                        <img
                          src={post.coverImageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground font-mono">{format(new Date(post.createdAt), 'MMM dd, yyyy')}</p>
                      <h3 className="text-xl font-serif text-foreground group-hover:text-primary transition-colors leading-snug">{post.title}</h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <section className="py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/hero-marble.png')] bg-cover bg-center mix-blend-overlay" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif text-primary-foreground mb-8">Ready to define your space?</h2>
          <Button asChild size="lg" className="bg-background text-foreground hover:bg-white rounded-none px-10 py-7 text-sm tracking-[0.2em] uppercase transition-all duration-300">
            <Link href="/contact">Consult Our Experts</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
