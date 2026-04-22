import { useRoute } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const [, params] = useRoute("/discover/:id");
  const id = params?.id ? parseInt(params.id) : 0;

  const { data: product, isLoading } = useGetProduct(id, {
    query: {
      enabled: !!id,
      queryKey: getGetProductQueryKey(id)
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center gap-6 pt-24">
          <h2 className="text-3xl font-bold">Product Not Found</h2>
          <Button asChild variant="outline" className="rounded-full font-bold uppercase tracking-widest text-xs px-8">
            <Link href="/discover">Back to Collection</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 py-12 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start max-w-7xl mx-auto">
            
            {/* Visuals Left */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="aspect-[4/5] bg-muted overflow-hidden bg-black/5">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-slate-900 flex items-center justify-center">
                    <span className="text-white/20 font-bold text-6xl tracking-tighter">SW</span>
                  </div>
                )}
              </div>
              
              {product.images && product.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((img, i) => (
                    <div key={i} className="aspect-square bg-muted overflow-hidden">
                      <img src={img} alt={`${product.name} view ${i}`} className="w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Details Right */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:sticky lg:top-32 space-y-10"
            >
              <div className="space-y-4 border-b border-border/40 pb-10">
                <div className="flex items-center gap-3 text-xs font-bold tracking-widest uppercase text-muted-foreground">
                  <Link href={`/discover?categoryId=${product.categoryId}`} className="hover:text-primary transition-colors">{product.categoryName}</Link>
                  <span>/</span>
                  <span>{product.origin}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">{product.name}</h1>
                
                {product.price && (
                  <div className="pt-4">
                    <p className="text-3xl font-bold">₹{product.price} <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground ml-2">/ {product.priceUnit || 'sq.ft'}</span></p>
                  </div>
                )}
              </div>

              {product.description && (
                <div className="prose prose-lg text-muted-foreground font-medium leading-relaxed">
                  <p>{product.description}</p>
                </div>
              )}

              <div className="space-y-4 pt-6">
                <div className="flex items-center gap-3 text-sm font-bold">
                  <CheckCircle2 className={`w-5 h-5 ${product.available ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={product.available ? 'text-foreground' : 'text-muted-foreground'}>
                    {product.available ? 'Available in Stock' : 'Currently Unavailable (Enquire for ETA)'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold">
                  <CheckCircle2 className={`w-5 h-5 ${product.deliveryAvailable ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={product.deliveryAvailable ? 'text-foreground' : 'text-muted-foreground'}>
                    {product.deliveryAvailable ? 'Pan-India Delivery Available' : 'Store Pickup Only'}
                  </span>
                </div>
              </div>

              <div className="pt-10">
                <Button asChild size="lg" className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full h-16 font-bold text-sm tracking-[0.2em] uppercase">
                  <Link href={`/contact?interest=${encodeURIComponent(product.name)}`}>
                    Request Quote & Details
                  </Link>
                </Button>
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="pt-10 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="border border-border px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
