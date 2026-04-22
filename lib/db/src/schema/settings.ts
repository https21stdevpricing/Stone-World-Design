import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull().default("Stone World"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  whatsapp: text("whatsapp"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  adminPasswordHash: text("admin_password_hash").notNull(),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(false),
  smtpHost: text("smtp_host"),
  smtpPort: text("smtp_port"),
  smtpUser: text("smtp_user"),
  smtpPass: text("smtp_pass"),
  smtpFrom: text("smtp_from"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettingsTable).omit({ id: true, updatedAt: true });
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettingsTable.$inferSelect;
