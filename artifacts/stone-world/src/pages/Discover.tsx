import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { Footer } from "@/components/Footer";
import { useListCategories, useListProducts } from "@workspace/api-client-react";
import { ListProductsOrigin } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, X } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";

export default function Discover() {
  const rawSearch = useSearch();
  const params = new URLSearchParams(rawSearch);

  const [search,     setSearch]     = useState(params.get("search") || "");
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
    origin: origin === ("all" as ListProductsOrigin) ? undefined : origin,
    limit: 60,
  });

  const productCount = data?.products.length ?? 0;
  const hasFilters = !!(search || categoryId || origin);
  const clearAll = () => { setSearch(""); setCategoryId(undefined); setOrigin(undefined); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSearch(""); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── PAGE HEADER ── */}
      <div className="pt-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-10 pb-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.3em] text-gray-400 uppercase font-semibold mb-1.5">The Collection</p>
              <h1
                className="font-black tracking-tight text-gray-950 leading-[1.02]"
                style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)" }}
              >
                Discover.
              </h1>
            </div>
            {!isLoading && productCount > 0 && (
              <motion.p
                key={productCount}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-black text-gray-100 pb-1 tabular-nums select-none"
              >
                {productCount}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* ── STICKY FILTER BAR ── */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Row 1: Search + Origin toggle */}
          <div className="flex items-center gap-2 sm:gap-3 py-3">
            {/* Search — always visible */}
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search materials, types..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/15 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Origin toggle */}
            <div className="flex items-center rounded-xl border border-gray-200 p-0.5 shrink-0 bg-gray-50">
              {[
                { value: undefined,                         label: "All"      },
                { value: "national"  as ListProductsOrigin, label: "Indian"   },
                { value: "imported"  as ListProductsOrigin, label: "Imported" },
              ].map(({ value, label }) => (
                <button
                  key={label}
                  onClick={() => setOrigin(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    origin === value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Clear */}
            {hasFilters && (
              <button
                onClick={clearAll}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Row 2: Category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-3">
            <button
              onClick={() => setCategoryId(undefined)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                !categoryId
                  ? "bg-gray-950 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  categoryId === cat.id
                    ? "bg-gray-950 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRODUCT GRID ── */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {isLoading ? (
            <div className="flex justify-center items-center h-72">
              <Loader2 className="h-7 w-7 animate-spin text-teal-500" />
            </div>
          ) : data?.products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-800 font-bold text-lg">No materials found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search terms.</p>
              </div>
              <button
                onClick={clearAll}
                className="mt-2 text-sm font-semibold text-teal-500 hover:text-teal-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-12"
            >
              <AnimatePresence>
                {data?.products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.035, 0.25) }}
                  >
                    <Link href={`/discover/${product.id}`} className="group block">
                      {/* Image */}
                      <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden rounded-2xl mb-3.5">
                        <ProductImage
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                        {/* Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                          {product.origin === "imported" && (
                            <span className="bg-white/90 text-gray-600 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                              Imported
                            </span>
                          )}
                          {!product.available && (
                            <span className="bg-white/90 text-gray-500 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                              Out of Stock
                            </span>
                          )}
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                      </div>

                      {/* Text */}
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium mb-0.5 truncate">
                          {product.categoryName}
                        </p>
                        <h3 className="font-semibold text-sm text-gray-900 group-hover:text-teal-600 transition-colors leading-snug truncate">
                          {product.name}
                        </h3>
                        {product.price ? (
                          <p className="mt-1.5 text-sm font-black text-gray-800">
                            ₹{product.price}
                            <span className="text-xs font-normal text-gray-400 ml-0.5">/{product.priceUnit || "sq.ft"}</span>
                          </p>
                        ) : (
                          <p className="mt-1.5 text-xs text-gray-400 font-medium">Price on enquiry</p>
                        )}
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
