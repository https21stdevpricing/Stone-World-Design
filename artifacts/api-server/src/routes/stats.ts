import { Router, type IRouter } from "express";
import { db, productsTable, enquiriesTable, blogPostsTable, categoriesTable, mediaTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { requireAdmin } from "./admin";

const router: IRouter = Router();

router.get("/stats/dashboard", requireAdmin, async (_req, res): Promise<void> => {
  const [[totalProducts], [availableProducts], [totalEnquiries], [unreadEnquiries], [totalBlogPosts], [publishedBlogPosts], [totalCategories], [totalMedia], recentEnquiries] = await Promise.all([
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(productsTable),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(productsTable).where(eq(productsTable.available, true)),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(enquiriesTable),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(enquiriesTable).where(eq(enquiriesTable.isRead, false)),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(blogPostsTable),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(blogPostsTable).where(eq(blogPostsTable.published, true)),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(categoriesTable),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(mediaTable),
    db.select().from(enquiriesTable).orderBy(desc(enquiriesTable.createdAt)).limit(5),
  ]);

  res.json({
    totalProducts: totalProducts.count,
    availableProducts: availableProducts.count,
    totalEnquiries: totalEnquiries.count,
    unreadEnquiries: unreadEnquiries.count,
    totalBlogPosts: totalBlogPosts.count,
    publishedBlogPosts: publishedBlogPosts.count,
    totalCategories: totalCategories.count,
    totalMedia: totalMedia.count,
    recentEnquiries,
  });
});

router.get("/stats/products-by-category", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .groupBy(productsTable.categoryId, categoriesTable.name);

  res.json(rows.map((r) => ({
    categoryId: r.categoryId ?? null,
    categoryName: r.categoryName ?? "Uncategorized",
    count: r.count,
  })));
});

export default router;
