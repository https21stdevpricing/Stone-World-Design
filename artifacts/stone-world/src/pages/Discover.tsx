import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useListCategories, useListProducts } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      
      <main className="flex-1 pt-16">
        {/* Hero Header */}
        <div className="py-16 sm:py-20 bg-gray-950">
          <div className="max-w-5xl mx-auto px-6 space-y-4">
            <p className="text-teal-400 text-xs tracking-[0.4em] font-bold uppercase">Browse</p>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">The Collection</h1>
            <p className="text-base text-gray-400 max-w-xl">
              500+ premium materials across 8 categories. Filter by type, origin, or search to find exactly what you need.
            </p>
          </div>
        </div>

        {/* Sticky Page Header */}
        <div className="sticky top-16 z-30 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            <span className="text-sm font-semibold text-gray-600">All Materials</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="border-b border-border sticky top-28 z-30 bg-white/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button 
                onClick={() => setCategoryId(undefined)}
                className={`whitespace-nowrap text-xs font-bold tracking-widest uppercase pb-1 border-b-2 transition-colors ${!categoryId ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                All Materials
              </button>
              {categories?.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`whitespace-nowrap text-xs font-bold tracking-widest uppercase pb-1 border-b-2 transition-colors ${categoryId === cat.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
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
                  className="pl-9 rounded-none border-b font-medium focus-visible:ring-0 focus-visible:border-primary bg-transparent"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={origin || "all"} onValueChange={(val) => setOrigin(val === "all" ? undefined : val as ListProductsOrigin)}>
                <SelectTrigger className="w-32 rounded-none border-b font-bold focus:ring-0 bg-transparent">
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
              <p className="text-xl font-bold text-muted-foreground">No selections match your criteria.</p>
              <button onClick={() => { setSearch(""); setCategoryId(undefined); setOrigin(undefined); }} className="mt-4 text-sm font-bold tracking-widest uppercase text-primary hover:underline">
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
                          <div className="w-full h-full bg-gradient-to-br from-primary to-slate-900 flex items-center justify-center">
                            <span className="text-white/20 font-bold text-4xl tracking-tighter">SW</span>
                          </div>
                        )}
                        {!product.available && (
                          <div className="absolute top-4 right-4 bg-background/90 text-foreground text-[10px] tracking-widest font-bold uppercase px-3 py-1 backdrop-blur-sm">
                            Out of Stock
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors leading-tight">{product.name}</h3>
                          {product.price && (
                            <p className="text-sm font-bold whitespace-nowrap">₹{product.price} <span className="text-xs font-medium text-muted-foreground">/{product.priceUnit || 'sq.ft'}</span></p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{product.categoryName} {product.origin ? `• ${product.origin}` : ''}</p>
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
