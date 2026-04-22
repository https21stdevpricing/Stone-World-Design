import { useState, useEffect, useRef } from "react";
import { Link, useSearch } from "wouter";
import { Footer } from "@/components/Footer";
import { useListCategories, useListProducts } from "@workspace/api-client-react";
import { ListProductsOrigin } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, X, Gem, SlidersHorizontal } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";

export default function Discover() {
  const rawSearch = useSearch();
  const params = new URLSearchParams(rawSearch);

  const [search, setSearch]       = useState(params.get("search") || "");
  const [categoryId, setCategoryId] = useState<number | undefined>(
    params.get("categoryId") ? Number(params.get("categoryId")) : undefined
  );
  const [origin, setOrigin]       = useState<ListProductsOrigin | undefined>(
    (params.get("origin") as ListProductsOrigin) || undefined
  );
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useListCategories();

  const { data, isLoading } = useListProducts({
    search: search || undefined,
    categoryId,
    origin: origin === ("all" as ListProductsOrigin) ? undefined : origin,
    limit: 50,
  });

  const productCount = data?.products.length ?? 0;
  const hasFilters = !!(search || categoryId || origin);

  const clearAll = () => { setSearch(""); setCategoryId(undefined); setOrigin(undefined); };

  const expandSearch = () => {
    setSearchExpanded(true);
    setTimeout(() => searchRef.current?.focus(), 80);
  };
  const collapseSearch = () => {
    if (!search) { setSearchExpanded(false); }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") { e.preventDefault(); expandSearch(); }
      if (e.key === "Escape" && searchExpanded) { setSearch(""); setSearchExpanded(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchExpanded]);

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* PAGE HEADER */}
      <div className="pt-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
          <div className="flex items-end justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center shadow-sm shadow-teal-500/30">
                  <Gem className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-[10px] text-teal-600 tracking-[0.3em] font-black uppercase">Materials</p>
              </div>
              <h1
                className="font-black tracking-tight text-gray-950 leading-[1.02]"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
              >
                The Collection.
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm pt-0.5">
                500+ premium materials across 8 categories.
              </p>
            </div>

            {!isLoading && productCount > 0 && (
              <div className="hidden sm:flex items-end pb-1 shrink-0">
                <motion.div key={productCount} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-3xl font-black text-gray-950 tabular-nums leading-none">{productCount}</p>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5 text-right">items</p>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STICKY FILTER BAR */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Row 1: Search + Origin pills + clear */}
          <div className="flex items-center gap-2 pt-3 pb-2">
            {/* Expandable search */}
            <AnimatePresence mode="wait">
              {searchExpanded ? (
                <motion.div
                  key="expanded"
                  initial={{ width: 120, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  exit={{ width: 120, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex-1"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-teal-500" />
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onBlur={collapseSearch}
                    placeholder="Search materials, types..."
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-teal-300 bg-teal-50/60 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
                  />
                  {search && (
                    <button
                      onMouseDown={(e) => { e.preventDefault(); setSearch(""); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.button
                  key="collapsed"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={expandSearch}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all duration-200 text-sm font-medium shrink-0 ${
                    search
                      ? "border-teal-400 bg-teal-50 text-teal-600"
                      : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  {search ? <span className="text-xs truncate max-w-[80px]">{search}</span> : <span>Search</span>}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Origin pills */}
            <div className="flex gap-1.5 shrink-0">
              {[
                { value: undefined,    label: "All" },
                { value: "national" as ListProductsOrigin,  label: "Indian" },
                { value: "imported" as ListProductsOrigin, label: "Imported" },
              ].map(({ value, label }) => (
                <button
                  key={label}
                  onClick={() => setOrigin(value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    origin === value
                      ? "bg-teal-500 text-white shadow-sm shadow-teal-500/25"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {hasFilters && !searchExpanded && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors shrink-0"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Row 2: Category tabs */}
          <div className="flex items-stretch gap-0 overflow-x-auto scrollbar-hide pb-0.5">
            <button
              onClick={() => setCategoryId(undefined)}
              className={`whitespace-nowrap px-4 py-2.5 text-[11px] font-bold tracking-wider uppercase transition-all duration-200 border-b-2 shrink-0 ${
                !categoryId ? "border-teal-500 text-teal-600" : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              All
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`whitespace-nowrap px-4 py-2.5 text-[11px] font-bold tracking-wider uppercase transition-all duration-200 border-b-2 shrink-0 ${
                  categoryId === cat.id ? "border-teal-500 text-teal-600" : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* PRODUCT GRID */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          ) : data?.products.length === 0 ? (
            <div className="text-center py-32 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-700 font-semibold text-lg">No materials found.</p>
              <p className="text-gray-400 text-sm">Try adjusting your filters or search terms.</p>
              <button onClick={clearAll} className="text-sm font-semibold text-teal-500 hover:text-teal-700 transition-colors">
                Clear all filters
              </button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
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
                      <div className="aspect-[4/5] bg-gray-100 mb-3.5 relative overflow-hidden rounded-2xl">
                        <ProductImage
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {!product.available && (
                          <div className="absolute top-2.5 right-2.5 bg-white/90 text-gray-600 text-[9px] tracking-wider font-bold uppercase px-2 py-1 rounded-full">
                            Out of Stock
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-teal-500 font-bold tracking-wider uppercase">
                          {product.categoryName}{product.origin ? ` · ${product.origin}` : ""}
                        </p>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm text-gray-900 group-hover:text-teal-600 transition-colors leading-snug">{product.name}</h3>
                          {product.price && (
                            <p className="text-sm font-bold text-gray-900 whitespace-nowrap shrink-0">
                              ₹{product.price}<span className="text-xs font-medium text-gray-400">/{product.priceUnit || "sq.ft"}</span>
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
