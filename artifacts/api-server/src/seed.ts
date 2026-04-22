import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./lib/logger";

const PRODUCT_IMAGES: Record<string, string> = {
  "italian-carrara-white-marble":
    "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&q=80&auto=format&fit=crop",
  "indian-makrana-white-marble":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop",
  "black-marquina-marble":
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80&auto=format&fit=crop",
  "calacatta-gold-marble":
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&auto=format&fit=crop",
  "black-galaxy-granite":
    "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80&auto=format&fit=crop",
  "kashmir-white-granite":
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80&auto=format&fit=crop",
  "calacatta-quartz-slab":
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80&auto=format&fit=crop",
  "nano-polished-porcelain-tiles":
    "https://images.unsplash.com/photo-1615971677499-5467cbab01b0?w=800&q=80&auto=format&fit=crop",
  "wooden-finish-ceramic-tiles":
    "https://images.unsplash.com/photo-1553787434-dd9eb4ea4d0e?w=800&q=80&auto=format&fit=crop",
  "kohler-wall-hung-wc-suite":
    "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80&auto=format&fit=crop",
  "53-grade-opc-cement":
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80&auto=format&fit=crop",
  "fe-500d-tmt-bars":
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80&auto=format&fit=crop",
};

export async function backfillProductImages(): Promise<void> {
  const products = await db.select().from(productsTable);

  let updated = 0;
  for (const product of products) {
    const slugBase = product.slug.replace(/-\d{13,}$/, "");
    const imageUrl = PRODUCT_IMAGES[slugBase];
    if (imageUrl && !product.imageUrl) {
      await db
        .update(productsTable)
        .set({ imageUrl })
        .where(eq(productsTable.id, product.id));
      updated++;
    }
  }

  if (updated > 0) {
    logger.info({ updated }, "Backfilled images for seeded products");
  }
}
