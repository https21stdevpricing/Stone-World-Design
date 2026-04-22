import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db, siteSettingsTable } from "@workspace/db";
import { AdminLoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

interface TokenEntry {
  createdAt: number;
}

// Tokens expire after 8 hours
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;
const validTokens = new Map<string, TokenEntry>();

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function isTokenValid(token: string): boolean {
  const entry = validTokens.get(token);
  if (!entry) return false;
  if (Date.now() - entry.createdAt > TOKEN_TTL_MS) {
    validTokens.delete(token);
    return false;
  }
  return true;
}

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  let [settings] = await db.select().from(siteSettingsTable).limit(1);

  if (!settings) {
    // First-run bootstrap: generate a random initial password and log it once
    const initialPassword = randomBytes(12).toString("hex");
    const hash = await bcrypt.hash(initialPassword, 12);
    [settings] = await db.insert(siteSettingsTable).values({
      companyName: "Stone World",
      adminPasswordHash: hash,
    }).returning();
    console.warn(
      `\n==================================================\n` +
      `FIRST RUN: Admin account created.\n` +
      `Initial password: ${initialPassword}\n` +
      `Log in and change it immediately in Settings.\n` +
      `==================================================\n`
    );
  }

  const valid = await bcrypt.compare(parsed.data.password, settings.adminPasswordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  const token = generateToken();
  validTokens.set(token, { createdAt: Date.now() });

  res.json({ success: true, token });
});

router.post("/admin/logout", (req, res): void => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) validTokens.delete(token);
  res.json({ success: true, message: "Logged out" });
});

router.get("/admin/session", (req, res): void => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token && isTokenValid(token)) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || !isTokenValid(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export function isAdminRequest(req: Request): boolean {
  const token = req.headers.authorization?.replace("Bearer ", "");
  return !!token && isTokenValid(token);
}

export default router;
