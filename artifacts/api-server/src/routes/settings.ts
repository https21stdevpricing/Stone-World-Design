import { Router, type IRouter } from "express";
import { db, siteSettingsTable, type SiteSettings } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";
import { requireAdmin } from "./admin";

const router: IRouter = Router();

function stripSensitive(settings: SiteSettings) {
  const { adminPasswordHash: _hash, smtpPass, ...safe } = settings;
  return {
    ...safe,
    smtpPassSet: !!smtpPass,
  };
}

router.get("/settings/public", async (_req, res): Promise<void> => {
  const [settings] = await db.select().from(siteSettingsTable).limit(1);
  if (!settings) {
    res.status(404).json({ error: "Settings not found" });
    return;
  }
  const { adminPasswordHash: _hash, id: _id, updatedAt: _updatedAt, smtpHost: _sh, smtpPort: _sp, smtpUser: _su, smtpPass: _spass, smtpFrom: _sf, notificationsEnabled: _ne, ...publicFields } = settings;
  res.json(publicFields);
});

router.get("/settings", requireAdmin, async (_req, res): Promise<void> => {
  const [settings] = await db.select().from(siteSettingsTable).limit(1);
  if (!settings) {
    res.status(404).json({ error: "Settings not found" });
    return;
  }
  res.json(stripSensitive(settings));
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

  const { currentPassword, newPassword, smtpPass, ...rest } = parsed.data;

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

  const updatePayload: Record<string, unknown> = { ...rest, adminPasswordHash };
  if (smtpPass !== undefined && smtpPass !== "") {
    updatePayload.smtpPass = smtpPass;
  }

  const updateData = Object.fromEntries(
    Object.entries(updatePayload).filter(([, v]) => v !== undefined)
  ) as Partial<typeof siteSettingsTable.$inferInsert>;

  const [updated] = await db
    .update(siteSettingsTable)
    .set(updateData)
    .where(eq(siteSettingsTable.id, current.id))
    .returning();

  res.json(stripSensitive(updated));
});

export default router;
