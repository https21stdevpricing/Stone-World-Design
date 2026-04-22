import { Router, type IRouter } from "express";
import { db, mediaTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UploadMediaBody, DeleteMediaParams } from "@workspace/api-zod";
import { requireAdmin } from "./admin";
import { randomUUID } from "crypto";
import { objectStorageClient } from "../lib/objectStorage";

const router: IRouter = Router();

function getPrivateObjectDir(): string {
  const dir = process.env.PRIVATE_OBJECT_DIR || "";
  if (!dir) {
    throw new Error("PRIVATE_OBJECT_DIR not set");
  }
  return dir;
}

function parseObjectPath(path: string): { bucketName: string; objectName: string } {
  if (!path.startsWith("/")) path = `/${path}`;
  const parts = path.split("/");
  return { bucketName: parts[1], objectName: parts.slice(2).join("/") };
}

router.get("/media/file/:filename", async (req, res): Promise<void> => {
  const { filename } = req.params;
  if (!filename) {
    res.status(400).json({ error: "Missing filename" });
    return;
  }

  const [match] = await db
    .select()
    .from(mediaTable)
    .where(eq(mediaTable.filename, filename))
    .limit(1);

  if (match) {
    res.redirect(302, match.url);
    return;
  }

  res.status(404).json({ error: "Media file not found" });
});

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
  if (!matches) {
    res.status(400).json({ error: "dataUrl must be a valid base64 data URL" });
    return;
  }

  const buffer = Buffer.from(matches[1], "base64");
  const size = buffer.length;

  const privateObjectDir = getPrivateObjectDir();
  const objectId = randomUUID();
  const fullPath = `${privateObjectDir}/uploads/${objectId}`;
  const { bucketName, objectName } = parseObjectPath(fullPath);

  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objectName);
  await file.save(buffer, { contentType: mimeType, resumable: false });

  const savedUrl = `/api/storage/objects/uploads/${objectId}`;

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
