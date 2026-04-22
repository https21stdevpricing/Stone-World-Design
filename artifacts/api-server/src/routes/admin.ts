import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db, siteSettingsTable } from "@workspace/db";
import { AdminLoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

const validTokens = new Set<string>();

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

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

  const token = generateToken();
  validTokens.add(token);

  res.json({ success: true, token });
});

router.post("/admin/logout", (req, res): void => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) validTokens.delete(token);
  res.json({ success: true, message: "Logged out" });
});

router.get("/admin/session", (req, res): void => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token && validTokens.has(token)) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

export function requireAdmin(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || !validTokens.has(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export default router;
