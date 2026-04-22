import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQueries } from "@tanstack/react-query";
import { getGetProductQueryOptions } from "@workspace/api-client-react";
import { ProductImage } from "@/components/ProductImage";
import { Clock } from "lucide-react";

interface RecentlyViewedProps {
  ids: number[];
}

export function RecentlyViewed({ ids }: RecentlyViewedProps) {
  const results = useQueries({
    queries: ids.map(id => getGetProductQueryOptions(id)),
  });

  if (ids.length < 2) return null;

  const products = ids
    .map((id, i) => results[i]?.data)
    .filter(Boolean) as NonNullable<(typeof results)[number]["data"]>[];

  if (products.length < 2) return null;

  return (
    <section className="py-14 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-7 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <p className="text-teal-500 text-[11px] tracking-[0.35em] font-semibold uppercase mb-0.5">Your Browse History</p>
            <h2 className="text-xl font-black text-gray-950">Recently Viewed</h2>
          </div>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="shrink-0 w-48 sm:w-56 snap-start"
            >
              <Link
                href={`/discover/${p.id}`}
                className="group block rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                  <ProductImage
                    src={p.imageUrl ?? ""}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                  {p.available && (
                    <div className="absolute top-2 left-2 bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      In Stock
                    </div>
                  )}
                </div>
                <div className="p-3.5 space-y-1">
                  <p className="text-[10px] font-semibold text-teal-600 truncate">{p.categoryName}</p>
                  <p className="font-bold text-gray-900 text-xs leading-snug line-clamp-2">{p.name}</p>
                  {p.price ? (
                    <p className="text-xs text-gray-500 font-medium">₹{p.price} / {p.priceUnit || "sq.ft"}</p>
                  ) : (
                    <p className="text-[10px] text-gray-400 font-medium">Price on enquiry</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
