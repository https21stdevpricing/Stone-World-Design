import { pgTable, text, serial, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  categoryId: integer("category_id"),
  price: numeric("price", { precision: 10, scale: 2 }),
  priceUnit: text("price_unit"),
  origin: text("origin").notNull().default("national"),
  available: boolean("available").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  imageUrl: text("image_url"),
  images: text("images").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  deliveryAvailable: boolean("delivery_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
