import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import { useListProducts, useListCategories, useListBlogPosts } from "@workspace/api-client-react";
import { ProductImage } from "@/components/ProductImage";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLACEHOLDERS = [
  "Italian marble for living room...",
  "Quartz kitchen countertop...",
  "Bathroom tiles collection...",
  "Rajasthan sandstone...",
  "Luxury sanitaryware...",
];

const QUICK_LINKS = [
  { label: "Marble",       href: "/discover?search=marble" },
  { label: "Quartz",       href: "/discover?search=quartz" },
  { label: "Tiles",        href: "/discover?search=tiles" },
  { label: "Sanitaryware", href: "/discover?search=sanitaryware" },
  { label: "Natural Stone",href: "/discover?search=stone" },
  { label: "TMT Bars",     href: "/discover?search=tmt" },
];

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery]       = useState("");
  const [phIdx, setPhIdx]       = useState(0);
  const [, navigate]            = useLocation();
  const inputRef                = useRef<HTMLInputElement>(null);

  const { data: productsData } = useListProducts(
    { search: query, limit: 6 },
    { query: { enabled: isOpen && query.length >= 2 } as any }
  );
  const { data: categoriesData } = useListCategories();
  const { data: blogData } = useListBlogPosts(
    { published: true, limit: 20 },
    { query: { enabled: isOpen } as any }
  );

  const products = productsData?.products || [];
  const categories = (categoriesData || [])
    .filter(c => query.length >= 1 ? c.name.toLowerCase().includes(query.toLowerCase()) : true)
    .slice(0, 4);
  const posts = (blogData?.posts || [])
    .filter(p => query.length >= 1 ? p.title.toLowerCase().includes(query.toLowerCase()) : true)
    .slice(0, 2);

  useEffect(() => {
    if (isOpen) { setTimeout(() => inputRef.current?.focus(), 60); setQuery(""); setPhIdx(0); }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || query.length > 0) return;
    const t = setInterval(() => setPhIdx(i => (i + 1) % PLACEHOLDERS.length), 2800);
    return () => clearInterval(t);
  }, [isOpen, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const go = (path: string) => { navigate(path); onClose(); };

  const hasResults = products.length > 0 || categories.length > 0 || posts.length > 0;
  const showDefault = query.length < 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.97, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[10vh] left-1/2 -translate-x-1/2 z-[90] w-full max-w-[640px] px-4"
          >
            <div className="bg-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.18)] overflow-hidden border border-gray-100">

              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                <Search className="shrink-0 text-teal-500" strokeWidth={2.5} style={{ width: 18, height: 18 }} />
                <div className="relative flex-1 flex items-center min-w-0">
                  <AnimatePresence mode="wait">
                    {!query && (
                      <motion.span
                        key={phIdx + "-ph"}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.22 }}
                        className="absolute pointer-events-none text-sm text-gray-400 truncate w-full"
                      >
                        {PLACEHOLDERS[phIdx]}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && query.trim()) go(`/discover?search=${encodeURIComponent(query.trim())}`);
                    }}
                    className="w-full text-sm text-gray-900 font-medium bg-transparent outline-none placeholder-transparent"
                    placeholder={PLACEHOLDERS[phIdx]}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                {query ? (
                  <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-700 shrink-0 transition-colors p-1">
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {showDefault ? (
                  /* Default: quick-links */
                  <div className="p-4">
                    <p className="text-[10px] font-black tracking-[0.28em] text-gray-400 uppercase mb-3">Browse by material</p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_LINKS.map((ql) => (
                        <button
                          key={ql.label}
                          onClick={() => go(ql.href)}
                          className="px-3.5 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-teal-50 hover:text-teal-700 transition-colors"
                        >
                          {ql.label}
                        </button>
                      ))}
                    </div>
                    {categories.length > 0 && (
                      <div className="mt-5">
                        <p className="text-[10px] font-black tracking-[0.28em] text-gray-400 uppercase mb-3">All categories</p>
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => go(`/discover?categoryId=${cat.id}`)}
                            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 group transition-colors"
                          >
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-950">{cat.name}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-teal-500 transition-colors" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : !hasResults ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-gray-500 font-medium">No results for "<span className="text-gray-900">{query}</span>"</p>
                    <button
                      onClick={() => go(`/discover?search=${encodeURIComponent(query)}`)}
                      className="mt-3 text-xs font-semibold text-teal-500 hover:text-teal-700 transition-colors"
                    >
                      Browse all materials instead →
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {/* Products */}
                    {products.length > 0 && (
                      <div className="p-4">
                        <p className="text-[10px] font-black tracking-[0.28em] text-gray-400 uppercase mb-3">Products</p>
                        <div className="space-y-1">
                          {products.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => go(`/discover/${p.id}`)}
                              className="flex items-center gap-3 w-full px-2 py-2 rounded-xl hover:bg-gray-50 group transition-colors"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                <ProductImage src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-semibold text-gray-800 group-hover:text-teal-700 transition-colors truncate">{p.name}</p>
                                <p className="text-[11px] text-gray-400">{p.categoryName}</p>
                              </div>
                              {p.price && <p className="text-xs font-bold text-gray-700 shrink-0">₹{p.price}</p>}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => go(`/discover?search=${encodeURIComponent(query)}`)}
                          className="mt-3 flex items-center gap-1.5 text-xs font-bold text-teal-500 hover:text-teal-700 transition-colors"
                        >
                          View all results <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Blog posts */}
                    {posts.length > 0 && (
                      <div className="p-4">
                        <p className="text-[10px] font-black tracking-[0.28em] text-gray-400 uppercase mb-3">Journal</p>
                        {posts.map((post) => (
                          <button
                            key={post.id}
                            onClick={() => go(`/blog/${post.slug}`)}
                            className="flex items-center gap-3 w-full px-2 py-2 rounded-xl hover:bg-gray-50 group transition-colors"
                          >
                            {post.coverImageUrl && (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <p className="flex-1 text-sm font-medium text-gray-700 group-hover:text-gray-950 text-left line-clamp-1">{post.title}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer — keyboard hints only on desktop */}
              <div className="hidden md:flex px-4 py-2 border-t border-gray-100 items-center justify-between">
                <p className="text-[10px] text-gray-400">
                  Press <kbd className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-600">↵</kbd> to search
                </p>
                <p className="text-[10px] text-gray-400">
                  <kbd className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-600">⌘K</kbd> to open
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
