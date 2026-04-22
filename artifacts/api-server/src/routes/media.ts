import { Router, type IRouter } from "express";
import { db, mediaTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UploadMediaBody, DeleteMediaParams } from "@workspace/api-zod";
import { requireAdmin } from "./admin";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const router: IRouter = Router();
const MEDIA_DIR = "/tmp/sw-media";

function ensureMediaDir() {
  try { mkdirSync(MEDIA_DIR, { recursive: true }); } catch {}
}

router.get("/media", requireAdmin, async (_req, res): Promise<void> => {
  const items = await db.select().from(mediaTable).orderBy(mediaTable.createdAt);
  res.json(items);
});

router.post("/media", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UploadMediaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { filename, dataUrl, mimeType } = parsed.data;

  const matches = dataUrl.match(/^data:[^;]+;base64,(.+)$/);
  let size = 0;
  let savedUrl = dataUrl;

  if (matches) {
    try {
      ensureMediaDir();
      const buffer = Buffer.from(matches[1], "base64");
      const safeName = `${Date.now()}-${filename.replace(/[^a-z0-9._-]/gi, "_")}`;
      const filePath = join(MEDIA_DIR, safeName);
      writeFileSync(filePath, buffer);
      size = buffer.length;
      savedUrl = `/api/media/file/${safeName}`;
    } catch {
      size = Math.round(dataUrl.length * 0.75);
    }
  }

  const [media] = await db
    .insert(mediaTable)
    .values({ filename, url: savedUrl, mimeType, size })
    .returning();

  res.status(201).json(media);
});

router.delete("/media/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteMediaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(mediaTable).where(eq(mediaTable.id, params.data.id));
  res.json({ success: true, message: "Media deleted" });
});

export default router;
