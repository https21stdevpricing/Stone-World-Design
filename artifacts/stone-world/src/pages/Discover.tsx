import { useState } from "react";
import { Link } from "wouter";
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

  const productCount = data?.products.length ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Page header — white minimal */}
      <div className="pt-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-10 sm:py-14">
          <p className="text-[10px] text-teal-500 tracking-[0.3em] font-bold uppercase mb-3">Browse</p>
          <h1
            className="font-black tracking-tight text-gray-950 leading-[1.05]"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            The Collection.
          </h1>
          <p className="text-gray-400 mt-3 max-w-lg text-sm leading-relaxed">
            500+ premium materials across 8 categories — marble, quartz, tiles, sanitaryware and more.
          </p>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-0">
          {/* Category tabs — horizontal scroll */}
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide border-b border-gray-100">
            <button
              onClick={() => setCategoryId(undefined)}
              className={`whitespace-nowrap px-4 py-3.5 text-[12px] font-bold tracking-wider uppercase transition-all duration-200 border-b-2 shrink-0 ${
                !categoryId
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              All
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`whitespace-nowrap px-4 py-3.5 text-[12px] font-bold tracking-wider uppercase transition-all duration-200 border-b-2 shrink-0 ${
                  categoryId === cat.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search + Origin row */}
          <div className="flex items-center gap-3 py-2.5">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search material..."
                className="pl-8 rounded-full border-gray-200 focus-visible:ring-teal-500 focus-visible:border-teal-400 text-sm h-8 bg-gray-50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={origin || "all"}
              onValueChange={(val) => setOrigin(val === "all" ? undefined : val as ListProductsOrigin)}
            >
              <SelectTrigger className="w-28 rounded-full border-gray-200 focus:ring-teal-400 h-8 text-xs font-semibold bg-gray-50">
                <SelectValue placeholder="Origin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Origins</SelectItem>
                <SelectItem value="imported">Imported</SelectItem>
                <SelectItem value="national">Indian</SelectItem>
              </SelectContent>
            </Select>
            {(search || categoryId || origin) && (
              <button
                onClick={() => { setSearch(""); setCategoryId(undefined); setOrigin(undefined); }}
                className="text-xs text-gray-400 hover:text-teal-600 font-semibold transition-colors"
              >
                Clear
              </button>
            )}
            {!isLoading && productCount > 0 && (
              <span className="text-xs text-gray-400 ml-auto hidden sm:inline">
                {productCount} result{productCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-10">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          ) : data?.products.length === 0 ? (
            <div className="text-center py-32 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-600 font-semibold text-lg">No materials found.</p>
              <p className="text-gray-400 text-sm">Try adjusting your filters or search terms.</p>
              <button
                onClick={() => { setSearch(""); setCategoryId(undefined); setOrigin(undefined); }}
                className="text-sm font-semibold text-teal-500 hover:text-teal-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10"
            >
              <AnimatePresence>
                {data?.products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
                  >
                    <Link href={`/discover/${product.id}`} className="group block">
                      <div className="aspect-[4/5] bg-gray-100 mb-3.5 relative overflow-hidden rounded-xl">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-teal-400 to-slate-800 flex items-center justify-center">
                            <span className="text-white/20 font-black text-4xl tracking-tight">SW</span>
                          </div>
                        )}
                        {!product.available && (
                          <div className="absolute top-3 right-3 bg-white/90 text-gray-600 text-[10px] tracking-wider font-bold uppercase px-2.5 py-1 rounded-full backdrop-blur-sm">
                            Out of Stock
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-teal-500 font-semibold tracking-wider uppercase">
                          {product.categoryName}{product.origin ? ` · ${product.origin}` : ''}
                        </p>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-sm text-gray-900 group-hover:text-teal-600 transition-colors leading-snug">{product.name}</h3>
                          {product.price && (
                            <p className="text-sm font-bold text-gray-900 whitespace-nowrap shrink-0">
                              ₹{product.price} <span className="text-xs font-medium text-gray-400">/{product.priceUnit || 'sq.ft'}</span>
                            </p>
                          )}
                        </div>
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
