import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Package, Grid3X3, BookOpen, ArrowRight } from "lucide-react";
import { useListProducts, useListCategories, useListBlogPosts } from "@workspace/api-client-react";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: productsData } = useListProducts(
    { search: query, limit: 5 },
    { query: { enabled: isOpen && query.length >= 2 } as any }
  );
  const { data: categoriesData } = useListCategories();
  const { data: blogData } = useListBlogPosts(
    { published: true, limit: 20 },
    { query: { enabled: isOpen } as any }
  );

  const products = productsData?.products || [];
  const categories = (categoriesData || []).filter(c =>
    query.length >= 1 ? c.name.toLowerCase().includes(query.toLowerCase()) : true
  ).slice(0, 4);
  const posts = (blogData?.posts || []).filter(p =>
    query.length >= 1 ? p.title.toLowerCase().includes(query.toLowerCase()) : true
  ).slice(0, 3);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  const hasResults = products.length > 0 || categories.length > 0 || posts.length > 0;
  const showDefault = query.length < 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products, categories, articles..."
                className="flex-1 text-lg font-medium text-gray-900 placeholder-gray-400 bg-transparent outline-none"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {showDefault ? (
                <div className="p-6 space-y-6">
                  <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Quick Links</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Marble Collection", path: "/discover?categoryId=1", icon: Grid3X3 },
                      { label: "Tiles & Ceramic", path: "/discover?categoryId=2", icon: Grid3X3 },
                      { label: "Quartz Surfaces", path: "/discover?categoryId=3", icon: Package },
                      { label: "Sanitaryware", path: "/discover?categoryId=4", icon: Package },
                      { label: "The Journal", path: "/blog", icon: BookOpen },
                      { label: "Contact Us", path: "/contact", icon: ArrowRight },
                    ].map(item => (
                      <button
                        key={item.path}
                        onClick={() => go(item.path)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-teal-50 hover:text-teal-700 transition-colors text-left group"
                      >
                        <item.icon className="w-4 h-4 text-gray-400 group-hover:text-teal-600 shrink-0" />
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-teal-700">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {products.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-bold tracking-widest text-gray-400 uppercase px-2 mb-3">Products</p>
                      <div className="space-y-1">
                        {products.map(p => (
                          <button
                            key={p.id}
                            onClick={() => go(`/discover/${p.id}`)}
                            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                              {p.imageUrl
                                ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                : <span className="text-white/50 text-xs font-bold">SW</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate text-sm">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.categoryName}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {categories.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-bold tracking-widest text-gray-400 uppercase px-2 mb-3">Categories</p>
                      <div className="flex flex-wrap gap-2 px-2">
                        {categories.map(c => (
                          <button
                            key={c.id}
                            onClick={() => go(`/discover?categoryId=${c.id}`)}
                            className="px-4 py-2 rounded-full bg-gray-100 hover:bg-teal-50 hover:text-teal-700 transition-colors text-sm font-semibold text-gray-700"
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {posts.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-bold tracking-widest text-gray-400 uppercase px-2 mb-3">Articles</p>
                      <div className="space-y-1">
                        {posts.map(p => (
                          <button
                            key={p.id}
                            onClick={() => go(`/blog/${p.slug}`)}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                          >
                            <BookOpen className="w-4 h-4 text-gray-400 group-hover:text-teal-500 shrink-0" />
                            <p className="font-medium text-gray-800 text-sm truncate">{p.title}</p>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 ml-auto shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!hasResults && query.length >= 2 && (
                    <div className="p-12 text-center">
                      <p className="text-gray-400 font-medium">No results for "<span className="text-gray-700">{query}</span>"</p>
                      <button
                        onClick={() => go(`/discover?search=${encodeURIComponent(query)}`)}
                        className="mt-4 text-teal-600 font-semibold text-sm hover:underline"
                      >
                        Search all products →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">Press <kbd className="font-mono bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-500 shadow-sm">Esc</kbd> to close</span>
              <span className="text-xs text-gray-400">⌘K to open anywhere</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
