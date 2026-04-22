import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useListCategories, useListProducts } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Loader2 } from "lucide-react";
import { ListProductsOrigin } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Discover() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [origin, setOrigin] = useState<ListProductsOrigin | undefined>(undefined);

  const { data: categories } = useListCategories();
  
  const { data, isLoading } = useListProducts({
    search: search || undefined,
    categoryId,
    origin: origin === "all" ? undefined : origin,
    limit: 50
  });

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24">
        {/* Header */}
        <div className="py-20 bg-foreground text-background">
          <div className="container mx-auto px-4 text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-serif">The Collection</h1>
            <p className="text-lg font-light tracking-wide text-background/80 max-w-2xl mx-auto">
              A curated catalog of the world's most exquisite materials. Filter by origin, category, or search directly.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="border-b border-border sticky top-[80px] md:top-[96px] z-40 bg-background/90 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button 
                onClick={() => setCategoryId(undefined)}
                className={`whitespace-nowrap text-xs tracking-widest uppercase pb-1 border-b-2 transition-colors ${!categoryId ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                All Materials
              </button>
              {categories?.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`whitespace-nowrap text-xs tracking-widest uppercase pb-1 border-b-2 transition-colors ${categoryId === cat.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex gap-4 w-full md:w-auto items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search material..." 
                  className="pl-9 rounded-none border-b focus-visible:ring-0 focus-visible:border-primary bg-transparent"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={origin || "all"} onValueChange={(val) => setOrigin(val === "all" ? undefined : val as ListProductsOrigin)}>
                <SelectTrigger className="w-32 rounded-none border-b focus:ring-0 bg-transparent">
                  <SelectValue placeholder="Origin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Origins</SelectItem>
                  <SelectItem value="imported">Imported</SelectItem>
                  <SelectItem value="national">Indian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="container mx-auto px-4 py-16">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : data?.products.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-xl font-serif text-muted-foreground">No selections match your criteria.</p>
              <button onClick={() => { setSearch(""); setCategoryId(undefined); setOrigin(undefined); }} className="mt-4 text-sm tracking-widest uppercase text-primary hover:underline">
                Clear Filters
              </button>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-16 gap-x-8"
            >
              <AnimatePresence>
                {data?.products.map((product, i) => (
                  <motion.div 
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  >
                    <Link href={`/discover/${product.id}`} className="group block h-full">
                      <div className="aspect-[4/5] bg-muted mb-4 relative overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                        )}
                        {!product.available && (
                          <div className="absolute top-4 right-4 bg-background/90 text-foreground text-[10px] tracking-widest uppercase px-3 py-1 backdrop-blur-sm">
                            Out of Stock
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors leading-tight">{product.name}</h3>
                          {product.price && (
                            <p className="text-sm font-medium whitespace-nowrap">₹{product.price} <span className="text-xs font-light text-muted-foreground">/{product.priceUnit || 'sq.ft'}</span></p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">{product.categoryName} {product.origin ? `• ${product.origin}` : ''}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
