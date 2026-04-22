import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AdminLoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

const ADMIN_TOKEN = "sw-admin-authenticated";

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const [settings] = await db.select().from(siteSettingsTable).limit(1);
  if (!settings) {
    res.status(500).json({ error: "Settings not configured" });
    return;
  }

  const valid = await bcrypt.compare(parsed.data.password, settings.adminPasswordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  res.json({ success: true, token: ADMIN_TOKEN });
});

router.post("/admin/logout", async (_req, res): Promise<void> => {
  res.json({ success: true, message: "Logged out" });
});

router.get("/admin/session", async (req, res): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token === ADMIN_TOKEN) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

export function requireAdmin(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export default router;
