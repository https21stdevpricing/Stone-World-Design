import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { Footer } from "@/components/Footer";
import { useListCategories, useListProducts } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, SlidersHorizontal, X, Gem } from "lucide-react";
import { ListProductsOrigin } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Discover() {
  const rawSearch = useSearch();
  const params = new URLSearchParams(rawSearch);

  const [search, setSearch] = useState(params.get("search") || "");
  const [categoryId, setCategoryId] = useState<number | undefined>(
    params.get("categoryId") ? Number(params.get("categoryId")) : undefined
  );
  const [origin, setOrigin] = useState<ListProductsOrigin | undefined>(
    (params.get("origin") as ListProductsOrigin) || undefined
  );

  const { data: categories } = useListCategories();

  const { data, isLoading } = useListProducts({
    search: search || undefined,
    categoryId,
    origin: origin === "all" ? undefined : origin,
    limit: 50
  });

  const productCount = data?.products.length ?? 0;
  const hasFilters = !!(search || categoryId || origin);

  const clearAll = () => { setSearch(""); setCategoryId(undefined); setOrigin(undefined); };

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── APPLE STORIES–STYLE PAGE HEADER ── */}
      <div className="pt-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10 sm:py-14 flex items-end justify-between gap-6">
          <div className="space-y-2">
            {/* Stories-style label with icon */}
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center">
                <Gem className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-[10px] text-teal-600 tracking-[0.3em] font-black uppercase">Materials</p>
            </div>
            <h1
              className="font-black tracking-tight text-gray-950 leading-[1.02]"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.75rem)" }}
            >
              The Collection.
            </h1>
            <p className="text-gray-400 max-w-md text-sm leading-relaxed pt-1">
              500+ premium materials across 8 categories — marble, quartz, tiles, sanitaryware and more.
            </p>
          </div>

          {/* Product count badge */}
          {!isLoading && productCount > 0 && (
            <div className="hidden sm:flex items-end pb-1 shrink-0">
              <motion.div
                key={productCount}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-right"
              >
                <p className="text-3xl font-black text-gray-950 tabular-nums">{productCount}</p>
                <p className="text-xs text-gray-400 font-semibold">materials</p>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* ── STICKY FILTER BAR — glassmorphic ── */}
      <div className="sticky top-16 z-30 bg-white/85 backdrop-blur-xl border-b border-gray-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Category pill tabs — horizontal scroll */}
          <div className="flex items-stretch gap-0 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setCategoryId(undefined)}
              className={`whitespace-nowrap px-4 py-3 text-[12px] font-bold tracking-wide uppercase transition-all duration-200 border-b-[2px] shrink-0 ${
                !categoryId
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              All
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`whitespace-nowrap px-4 py-3 text-[12px] font-bold tracking-wide uppercase transition-all duration-200 border-b-[2px] shrink-0 ${
                  categoryId === cat.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}

            {/* Search + Origin — pinned right side of tab row */}
            <div className="ml-auto flex items-center gap-2 pl-4 py-1.5 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  placeholder="Search..."
                  className="pl-7 pr-3 rounded-full border-gray-200 focus-visible:ring-teal-500 focus-visible:border-teal-400 text-xs h-7 w-32 bg-gray-50/80"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select
                value={origin || "all"}
                onValueChange={(val) => setOrigin(val === "all" ? undefined : val as ListProductsOrigin)}
              >
                <SelectTrigger className="w-24 rounded-full border-gray-200 focus:ring-teal-400 h-7 text-[11px] font-semibold bg-gray-50/80">
                  <SelectValue placeholder="Origin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="imported">Imported</SelectItem>
                  <SelectItem value="national">Indian</SelectItem>
                </SelectContent>
              </Select>
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-teal-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── PRODUCT GRID ── */}
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
                onClick={clearAll}
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
