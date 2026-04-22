import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, sql, ilike, and, inArray, asc, desc } from "drizzle-orm";
import {
  ListProductsQueryParams,
  CreateProductBody,
  UpdateProductBody,
  GetProductParams,
  UpdateProductParams,
  DeleteProductParams,
  BulkDeleteProductsBody,
  BulkToggleProductAvailabilityBody,
} from "@workspace/api-zod";
import { requireAdmin } from "./admin";

const router: IRouter = Router();

function buildProductResult(p: any, catName?: string | null) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? null,
    categoryId: p.categoryId ?? null,
    categoryName: catName ?? null,
    price: p.price != null ? parseFloat(p.price) : null,
    priceUnit: p.priceUnit ?? null,
    origin: p.origin,
    available: p.available,
    featured: p.featured,
    imageUrl: p.imageUrl ?? null,
    images: p.images ?? [],
    tags: p.tags ?? [],
    deliveryAvailable: p.deliveryAvailable,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

router.get("/products/featured", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      product: productsTable,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(eq(productsTable.featured, true), eq(productsTable.available, true)))
    .orderBy(desc(productsTable.createdAt))
    .limit(8);

  res.json(rows.map((r) => buildProductResult(r.product, r.categoryName)));
});

router.get("/products/bulk-delete", requireAdmin, async (_req, res): Promise<void> => {
  res.status(405).json({ error: "Use POST /products/bulk-delete" });
});

router.get("/products/bulk-toggle", requireAdmin, async (_req, res): Promise<void> => {
  res.status(405).json({ error: "Use POST /products/bulk-toggle" });
});

router.get("/products", async (req, res): Promise<void> => {
  const query = ListProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { categoryId, search, available, origin, limit = 20, offset = 0 } = query.data;

  const conditions: any[] = [];
  if (categoryId != null) conditions.push(eq(productsTable.categoryId, categoryId));
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
  if (available != null) conditions.push(eq(productsTable.available, available));
  if (origin && origin !== "all") conditions.push(eq(productsTable.origin, origin));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(productsTable)
    .where(whereClause);

  const rows = await db
    .select({
      product: productsTable,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(whereClause)
    .orderBy(desc(productsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({
    products: rows.map((r) => buildProductResult(r.product, r.categoryName)),
    total: countResult.count,
    limit,
    offset,
  });
});

router.post("/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const slug =
    parsed.data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") +
    "-" +
    Date.now();

  const [product] = await db
    .insert(productsTable)
    .values({ ...parsed.data, slug, price: parsed.data.price?.toString() })
    .returning();

  res.status(201).json(buildProductResult(product, null));
});

router.post("/products/bulk-delete", requireAdmin, async (req, res): Promise<void> => {
  const parsed = BulkDeleteProductsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.delete(productsTable).where(inArray(productsTable.id, parsed.data.ids));
  res.json({ success: true, message: "Products deleted" });
});

router.post("/products/bulk-toggle", requireAdmin, async (req, res): Promise<void> => {
  const parsed = BulkToggleProductAvailabilityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db
    .update(productsTable)
    .set({ available: parsed.data.available })
    .where(inArray(productsTable.id, parsed.data.ids));

  res.json({ success: true, message: "Products updated" });
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, id));

  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(buildProductResult(row.product, row.categoryName));
});

router.put("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(productsTable)
    .set({ ...parsed.data, price: parsed.data.price?.toString() })
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(buildProductResult(updated, null));
});

router.delete("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [deleted] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json({ success: true, message: "Product deleted" });
});

export default router;
