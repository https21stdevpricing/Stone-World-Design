import { useState, useCallback } from "react";
import { useRoute, Link } from "wouter";
import { Footer } from "@/components/Footer";
import { useGetProduct, getGetProductQueryKey, useListProducts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2, CheckCircle2, XCircle, ArrowRight, ChevronLeft,
  Package, MapPin, Layers, Truck, Phone, Star, Shield, ArrowUpRight, Maximize2, Share2, Check
} from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { ImageLightbox } from "@/components/ImageLightbox";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

const MATERIAL_STORY: Record<string, { tagline: string; story: string; applications: string[]; care: string }> = {
  marble: {
    tagline: "The king of natural stones",
    story: "Marble is metamorphic rock formed when limestone is subjected to extreme heat and pressure deep within the earth. The result is a material of extraordinary beauty — no two slabs share the same veining pattern, making each installation utterly unique. Prized since antiquity for its lustrous surface and warmth, marble remains the definitive luxury building material.",
    applications: ["Living room floors", "Kitchen countertops", "Bathroom walls", "Feature walls", "Staircases", "Exterior cladding"],
    care: "Seal annually with a penetrating stone sealer. Clean with pH-neutral stone cleaner. Avoid acidic cleaners, citrus, or vinegar which can etch the surface."
  },
  quartz: {
    tagline: "Engineered for perfection",
    story: "Engineered quartz surfaces are composed of 90-93% natural quartz crystals bound with polymer resins. This fusion creates a surface that is harder than granite, non-porous, and virtually maintenance-free. Unlike natural stone, quartz offers consistent pattern and colour across the entire slab — ideal for large-format installations.",
    applications: ["Kitchen countertops", "Bathroom vanities", "Commercial surfaces", "Wall cladding", "Flooring", "Island worktops"],
    care: "Wipe with warm soapy water. Avoid prolonged exposure to direct sunlight (UV can affect pigments). Do not place hot pots directly on the surface."
  },
  tiles: {
    tagline: "Infinite possibilities, endless style",
    story: "Modern tiles have evolved far beyond simple ceramic squares. Today's collections include large-format porcelain (up to 1200x2400mm), handcrafted zellige, book-matched slabs, and digitally printed surfaces that replicate any texture imaginable. The right tile can make a room feel spacious, intimate, rustic, or ultra-modern.",
    applications: ["Bathroom floors & walls", "Kitchen backsplash", "Outdoor terraces", "Swimming pools", "Commercial lobbies", "Feature walls"],
    care: "Clean regularly with a pH-neutral tile cleaner. Re-grout every 5-7 years or when grout shows wear. Apply grout sealer to prevent staining."
  },
  ceramic: {
    tagline: "Artisan craft, modern performance",
    story: "Ceramic tiles are kiln-fired clay products — one of humanity's oldest building materials, now reimagined with modern manufacturing precision. Glazed ceramics offer rich, deep colours that never fade. Unglazed varieties develop a natural patina over time. Both are durable, water-resistant, and infinitely versatile.",
    applications: ["Wall tiles", "Decorative accents", "Kitchen walls", "Bathroom walls", "Fireplace surrounds", "Garden walls"],
    care: "Clean with standard tile cleaner. Avoid abrasive scrubbers on glazed surfaces. Check for cracks annually and replace damaged tiles promptly."
  },
  sanitaryware: {
    tagline: "Where form meets function",
    story: "Modern sanitaryware is the intersection of industrial engineering and pure aesthetics. Vitreous china and fireclay are fired at over 1200°C to create surfaces that are hygienic, durable, and beautifully smooth. Today's designs — from wall-hung WCs to freestanding baths — prioritise both ergonomics and visual elegance.",
    applications: ["Bathrooms", "Guest toilets", "Master ensuite", "Commercial washrooms", "Hotel projects", "Spa installations"],
    care: "Clean weekly with a non-abrasive bathroom cleaner. Avoid bleach on coloured sanitaryware. Check cistern mechanisms annually."
  },
  cement: {
    tagline: "The foundation of everything",
    story: "Modern Portland cement is a precisely engineered blend of limestone, silica, alumina, and iron oxide, ground to extraordinary fineness and fired in rotary kilns at 1450°C. The resulting clinker, when mixed with water, undergoes a chemical hydration reaction — hardening into a material of remarkable compressive strength.",
    applications: ["Structural foundations", "Columns & beams", "Flooring screeds", "Plastering", "Precast elements", "Road construction"],
    care: "Store in dry conditions, away from moisture. Use within 90 days of manufacture. Check for lumps before use — lumpy cement has undergone partial hydration."
  },
  "tmt bars": {
    tagline: "The steel backbone of India",
    story: "Thermo-Mechanically Treated (TMT) bars undergo a controlled water-quenching process immediately after rolling, creating a tough outer martensitic layer around a softer, more ductile ferrite-pearlite core. This unique structure gives TMT bars superior tensile strength, ductility, and earthquake resistance compared to ordinary steel bars.",
    applications: ["Multi-storey buildings", "Bridges & flyovers", "Commercial structures", "Industrial buildings", "Residential foundations", "Retaining walls"],
    care: "Store elevated off the ground on wooden planks. Protect from prolonged moisture exposure. Use within 6 months of manufacture for optimal performance."
  },
  stone: {
    tagline: "Raw geological grandeur",
    story: "Natural stone — granite, sandstone, slate, travertine, and limestone — captures hundreds of millions of years of geological history in each slab. Unlike any manufactured material, natural stone develops character over time, its surface evolving with use and exposure. Each piece is a geological record, unique and irreplaceable.",
    applications: ["Exterior cladding", "Garden paving", "Pool surrounds", "Landscape features", "Water features", "Heritage restoration"],
    care: "Seal porous stones annually. Clean with stone-specific cleaners. For outdoor stone, treat with a weather-resistant impregnating sealer."
  }
};

function getMaterialKey(categoryName: string | undefined): string {
  if (!categoryName) return "marble";
  const lower = categoryName.toLowerCase();
  if (lower.includes("quartz")) return "quartz";
  if (lower.includes("tile")) return "tiles";
  if (lower.includes("ceramic")) return "ceramic";
  if (lower.includes("sanitary")) return "sanitaryware";
  if (lower.includes("cement")) return "cement";
  if (lower.includes("tmt") || lower.includes("bar")) return "tmt bars";
  if (lower.includes("stone")) return "stone";
  return "marble";
}

export default function ProductDetail() {
  const [, params] = useRoute("/discover/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const { toast } = useToast();
  const recentlyViewedIds = useRecentlyViewed(id);

  const { data: product, isLoading } = useGetProduct(id, {
    query: {
      enabled: !!id,
      queryKey: getGetProductQueryKey(id)
    }
  });

  const { data: relatedData } = useListProducts(
    { categoryId: product?.categoryId ?? undefined, limit: 12 },
    { query: { enabled: !!product?.categoryId } }
  );
  const relatedProducts = (relatedData?.products ?? [])
    .filter(p => p.id !== id)
    .slice(0, 6);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const title = product?.name ?? "Check out this product";
    const text = `${title} — Stone World`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user cancelled or share failed — no-op
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
        toast({ title: "Link copied!", description: "The product link has been copied to your clipboard." });
      } catch {
        // clipboard not available
      }
    }
  }, [product?.name, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white pt-16">
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white pt-16">
        <div className="flex-1 flex flex-col justify-center items-center gap-6 pt-16 px-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-950">Product Not Found</h2>
          <p className="text-gray-400 max-w-sm text-sm">This product may have been removed or the link may be incorrect.</p>
          <Button asChild variant="outline" className="rounded-full font-semibold px-8">
            <Link href="/discover">Browse Collection</Link>
          </Button>
        </div>
      </div>
    );
  }

  const allImages = [product.imageUrl, ...(product.images || [])].filter(Boolean) as string[];
  const matKey = getMaterialKey(product.categoryName ?? undefined);
  const matStory = MATERIAL_STORY[matKey] || MATERIAL_STORY["marble"];

  return (
    <div className="min-h-screen flex flex-col bg-white pt-16">

      {/* Sticky breadcrumb */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2">
          <Link href="/discover" className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors shrink-0">
            <ChevronLeft className="w-3.5 h-3.5" /> Collection
          </Link>
          <span className="text-gray-300 text-sm hidden sm:inline">/</span>
          <Link href={`/discover?categoryId=${product.categoryId}`} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors hidden sm:inline truncate max-w-[120px]">
            {product.categoryName}
          </Link>
          <span className="text-gray-300 text-sm hidden sm:inline">/</span>
          <span className="text-sm font-semibold text-gray-900 truncate max-w-[180px] sm:max-w-xs">{product.name}</span>
          {product.available && (
            <span className="ml-auto shrink-0 text-[10px] font-black text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full tracking-wide">In Stock</span>
          )}
        </div>
      </div>

      <main className="flex-1 py-10 pb-16">

        {/* ── PRODUCT MAIN ── */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-start">

            {/* Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-3"
            >
              <div
                className="aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 relative group cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              >
                <ProductImage
                  src={allImages[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                {product.available && (
                  <div className="absolute top-4 left-4 bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    In Stock
                  </div>
                )}
                <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <Maximize2 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2.5">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${activeImage === i ? "border-teal-500 shadow-md" : "border-transparent opacity-55 hover:opacity-100"}`}
                    >
                      <ProductImage src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="lg:sticky lg:top-28 space-y-6"
            >
              {/* Category + Origin */}
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/discover?categoryId=${product.categoryId}`}
                  className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full hover:bg-teal-100 transition-colors"
                >
                  {product.categoryName}
                </Link>
                {product.origin && (
                  <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                    <MapPin className="w-3 h-3" />{product.origin}
                  </span>
                )}
                <button
                  onClick={handleShare}
                  aria-label="Share this product"
                  className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
                >
                  {shareCopied
                    ? <><Check className="w-3.5 h-3.5 text-teal-500" /><span className="text-teal-600">Copied!</span></>
                    : <><Share2 className="w-3.5 h-3.5" />Share</>
                  }
                </button>
              </div>

              {/* Name + Price */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950 leading-tight">
                  {product.name}
                </h1>
                {product.price && (
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-2xl font-black text-gray-950">₹{product.price}</p>
                    <p className="text-sm font-medium text-gray-400">/ {product.priceUnit || 'sq.ft'}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-gray-500 leading-relaxed text-[14px] border-t border-gray-100 pt-5">
                  {product.description}
                </p>
              )}

              {/* Availability pills */}
              <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-5">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${product.available ? "bg-teal-50 text-teal-700" : "bg-gray-100 text-gray-500"}`}>
                  {product.available
                    ? <CheckCircle2 className="w-3.5 h-3.5" />
                    : <XCircle className="w-3.5 h-3.5" />}
                  {product.available ? "In Stock" : "On Request"}
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${product.deliveryAvailable ? "bg-teal-50 text-teal-700" : "bg-gray-100 text-gray-500"}`}>
                  <Truck className="w-3.5 h-3.5" />
                  {product.deliveryAvailable ? "Pan-India Delivery" : "Store Pickup"}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="space-y-2.5 border-t border-gray-100 pt-5">
                <Button asChild size="lg" className="w-full bg-gray-950 hover:bg-gray-800 text-white rounded-full h-13 font-semibold text-sm tracking-wide">
                  <Link href={`/contact?interest=${encodeURIComponent(product.name)}`}>
                    Request Quote &amp; Details <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full rounded-full h-13 font-semibold text-sm border-gray-200 hover:bg-gray-50 text-gray-700">
                  <a href="tel:+919999999999" className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" /> Speak to an Expert
                  </a>
                </Button>
              </div>

              {/* Trust signals */}
              <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-5">
                {[
                  { icon: Shield, label: "Quality Verified" },
                  { icon: Star, label: "Premium Grade" },
                  { icon: Truck, label: "Fast Delivery" },
                ].map(t => (
                  <div key={t.label} className="flex flex-col items-center gap-1.5 text-center p-3 rounded-xl bg-gray-50">
                    <t.icon className="w-4 h-4 text-teal-500" />
                    <p className="text-[11px] font-semibold text-gray-600">{t.label}</p>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── MATERIAL STORY — dark section ── */}
        <section className="mt-20 bg-gray-950 py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-14 items-center">
              <div className="space-y-4">
                <p className="text-teal-400 text-[11px] tracking-[0.35em] font-semibold uppercase">Material Story</p>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">{matStory.tagline}</h2>
                <p className="text-gray-400 leading-relaxed text-sm">{matStory.story}</p>
              </div>
              <div className="space-y-4">
                <p className="text-teal-400 text-[11px] tracking-[0.35em] font-semibold uppercase">Ideal Applications</p>
                <ul className="space-y-2.5">
                  {matStory.applications.map(app => (
                    <li key={app} className="flex items-center gap-3 text-gray-300 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                      {app}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── SPECIFICATIONS ── */}
        {(product.origin || product.categoryName) && (
          <section className="py-16">
            <div className="max-w-5xl mx-auto px-6">
              <div className="mb-8">
                <p className="text-teal-500 text-[11px] tracking-[0.35em] font-semibold uppercase mb-3">Technical Details</p>
                <h2 className="text-2xl font-black text-gray-950">Specifications</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Category", value: product.categoryName, icon: Layers },
                  { label: "Origin", value: product.origin, icon: MapPin },
                  { label: "Availability", value: product.available ? "In Stock" : "On Request", icon: Package },
                  { label: "Delivery", value: product.deliveryAvailable ? "Pan-India" : "Pickup Only", icon: Truck },
                  { label: "Price Unit", value: product.priceUnit || "sq.ft", icon: Star },
                ].filter(s => s.value).map(spec => (
                  <div key={spec.label} className="p-5 rounded-2xl border border-gray-100 space-y-3">
                    <spec.icon className="w-5 h-5 text-teal-500" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{spec.label}</p>
                      <p className="font-bold text-gray-900 text-sm">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CARE GUIDE ── */}
        <section className="py-12 bg-teal-50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex gap-5 items-start">
              <div className="w-11 h-11 rounded-2xl bg-teal-100 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-teal-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-gray-950">Care &amp; Maintenance Guide</h3>
                <p className="text-gray-500 leading-relaxed text-sm max-w-2xl">{matStory.care}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── RELATED PRODUCTS ── */}
        {relatedProducts.length > 0 && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="mb-8">
                <p className="text-teal-500 text-[11px] tracking-[0.35em] font-semibold uppercase mb-3">You May Also Like</p>
                <h2 className="text-2xl font-black text-gray-950">More from {product.categoryName}</h2>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                {relatedProducts.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="shrink-0 w-56 sm:w-64 snap-start"
                  >
                    <Link href={`/discover/${p.id}`} className="group block rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                        <ProductImage
                          src={p.imageUrl ?? ""}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                        />
                        {p.available && (
                          <div className="absolute top-2.5 left-2.5 bg-teal-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                            In Stock
                          </div>
                        )}
                      </div>
                      <div className="p-4 space-y-1.5">
                        <p className="text-xs font-semibold text-teal-600">{p.categoryName}</p>
                        <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{p.name}</p>
                        {p.price && (
                          <p className="text-xs text-gray-500 font-medium">₹{p.price} / {p.priceUnit || 'sq.ft'}</p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── RECENTLY VIEWED ── */}
        <RecentlyViewed ids={recentlyViewedIds} />

        {/* ── ENQUIRY CTA ── */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="rounded-3xl bg-gray-950 p-8 sm:p-12 text-center space-y-5">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Interested in this product?</h2>
              <p className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">
                Get in touch for pricing, availability, samples, and installation guidance. We typically respond within 2 business hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="bg-teal-500 hover:bg-teal-400 text-white rounded-full px-10 py-6 font-semibold text-sm">
                  <Link href={`/contact?interest=${encodeURIComponent(product.name)}`}>
                    Request a Quote <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 rounded-full px-10 py-6 font-semibold text-sm bg-transparent">
                  <Link href="/discover">
                    Continue Browsing <ArrowUpRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      <AnimatePresence>
        {lightboxOpen && (
          <ImageLightbox
            images={allImages}
            initialIndex={activeImage}
            onClose={() => setLightboxOpen(false)}
            onIndexChange={(i) => setActiveImage(i)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
