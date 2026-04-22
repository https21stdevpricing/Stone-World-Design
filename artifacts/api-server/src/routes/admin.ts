import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db, siteSettingsTable } from "@workspace/db";
import { AdminLoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

const validTokens = new Set<string>();

// bcrypt hash of "admin@stone2024" — used only on first-run bootstrap when site_settings is empty
const DEFAULT_PASSWORD_HASH = "$2b$10$F5m1CEEH7mhNmoi5a73/t.g8OOsNKxKyPNHFFPrujv4Q3ImZz28U.";

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  let [settings] = await db.select().from(siteSettingsTable).limit(1);

  if (!settings) {
    // Bootstrap: insert default settings with default password "admin@stone2024"
    [settings] = await db.insert(siteSettingsTable).values({
      companyName: "Stone World",
      adminPasswordHash: DEFAULT_PASSWORD_HASH,
    }).returning();
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

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || !validTokens.has(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export default router;
