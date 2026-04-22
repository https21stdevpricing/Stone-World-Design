import { Router, type IRouter } from "express";
import { db, siteSettingsTable, type SiteSettings } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";
import { requireAdmin } from "./admin";

const router: IRouter = Router();

function stripHash(settings: SiteSettings) {
  const { adminPasswordHash: _omit, ...safe } = settings;
  return safe;
}

router.get("/settings", requireAdmin, async (_req, res): Promise<void> => {
  const [settings] = await db.select().from(siteSettingsTable).limit(1);
  if (!settings) {
    res.status(404).json({ error: "Settings not found" });
    return;
  }
  res.json(stripHash(settings));
});

router.put("/settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [current] = await db.select().from(siteSettingsTable).limit(1);
  if (!current) {
    res.status(404).json({ error: "Settings not found" });
    return;
  }

  const { currentPassword, newPassword, ...rest } = parsed.data;

  let adminPasswordHash = current.adminPasswordHash;
  if (newPassword) {
    if (!currentPassword) {
      res.status(400).json({ error: "Current password required to change password" });
      return;
    }
    const valid = await bcrypt.compare(currentPassword, current.adminPasswordHash);
    if (!valid) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }
    adminPasswordHash = await bcrypt.hash(newPassword, 10);
  }

  const updateData = Object.fromEntries(
    Object.entries({ ...rest, adminPasswordHash }).filter(([, v]) => v !== undefined)
  ) as Partial<typeof siteSettingsTable.$inferInsert>;

  const [updated] = await db
    .update(siteSettingsTable)
    .set(updateData)
    .where(eq(siteSettingsTable.id, current.id))
    .returning();

  res.json(stripHash(updated));
});

export default router;
