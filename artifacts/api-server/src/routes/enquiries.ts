import { Router, type IRouter } from "express";
import { db, enquiriesTable } from "@workspace/db";
import { eq, and, ne, sql, desc, type SQL } from "drizzle-orm";
import {
  ListEnquiriesQueryParams,
  CreateEnquiryBody,
  MarkEnquiryReadParams,
  MarkEnquiryReadBody,
  ExportEnquiriesQueryParams,
  TrackEnquiryQueryParams,
  TrackByPhoneQueryParams,
  UpdateEnquiryStatusParams,
  UpdateEnquiryStatusBody,
} from "@workspace/api-zod";
import { requireAdmin } from "./admin";
import { sendStatusNotification } from "../lib/notify";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function generateReferenceNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "SW";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

router.get("/enquiries", requireAdmin, async (req, res): Promise<void> => {
  const query = ListEnquiriesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { audience, read, limit = 20, offset = 0 } = query.data;

  const conditions: SQL<unknown>[] = [];
  if (audience && audience !== "all") conditions.push(eq(enquiriesTable.audience, audience));
  if (read != null) conditions.push(eq(enquiriesTable.isRead, read));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(enquiriesTable)
    .where(whereClause);

  const [unreadResult] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(enquiriesTable)
    .where(eq(enquiriesTable.isRead, false));

  const rows = await db
    .select()
    .from(enquiriesTable)
    .where(whereClause)
    .orderBy(desc(enquiriesTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({
    enquiries: rows,
    total: countResult.count,
    unread: unreadResult.count,
    limit,
    offset,
  });
});

router.get("/enquiries/track", async (req, res): Promise<void> => {
  const query = TrackEnquiryQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Reference number is required" });
    return;
  }

  const [enquiry] = await db
    .select({
      id: enquiriesTable.id,
      referenceNumber: enquiriesTable.referenceNumber,
      name: enquiriesTable.name,
      status: enquiriesTable.status,
      productInterest: enquiriesTable.productInterest,
      createdAt: enquiriesTable.createdAt,
    })
    .from(enquiriesTable)
    .where(eq(enquiriesTable.referenceNumber, query.data.ref))
    .limit(1);

  if (!enquiry) {
    res.status(404).json({ error: "Enquiry not found. Please check your reference number." });
    return;
  }

  res.json(enquiry);
});

router.get("/enquiries/track-by-phone", async (req, res): Promise<void> => {
  const query = TrackByPhoneQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "A valid phone number is required" });
    return;
  }

  const normalizedInput = query.data.phone.replace(/\D/g, "").slice(-10);

  if (normalizedInput.length < 10) {
    res.status(400).json({ error: "Please enter a valid 10-digit phone number" });
    return;
  }

  const rows = await db
    .select({
      referenceNumber: enquiriesTable.referenceNumber,
      status: enquiriesTable.status,
      createdAt: enquiriesTable.createdAt,
    })
    .from(enquiriesTable)
    .where(
      and(
        sql`right(regexp_replace(${enquiriesTable.phone}, '[^0-9]', '', 'g'), 10) = ${normalizedInput}`,
        ne(enquiriesTable.status, "closed")
      )
    )
    .orderBy(desc(enquiriesTable.createdAt))
    .limit(1);

  if (rows.length === 0) {
    res.status(404).json({ error: "No open enquiries found for this phone number. Please check the number or contact us directly." });
    return;
  }

  res.json(rows);
});

router.post("/enquiries", async (req, res): Promise<void> => {
  const parsed = CreateEnquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let referenceNumber: string;
  let attempts = 0;
  while (true) {
    referenceNumber = generateReferenceNumber();
    const existing = await db
      .select({ id: enquiriesTable.id })
      .from(enquiriesTable)
      .where(eq(enquiriesTable.referenceNumber, referenceNumber))
      .limit(1);
    if (existing.length === 0) break;
    if (++attempts > 10) {
      referenceNumber = generateReferenceNumber() + Date.now().toString(36).slice(-3);
      break;
    }
  }

  await db.insert(enquiriesTable).values({
    ...parsed.data,
    referenceNumber,
    status: "new",
  });

  res.status(201).json({
    success: true,
    message: "Enquiry submitted successfully",
    referenceNumber,
  });
});

router.put("/enquiries/:id/read", requireAdmin, async (req, res): Promise<void> => {
  const params = MarkEnquiryReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = MarkEnquiryReadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(enquiriesTable)
    .set({ isRead: parsed.data.isRead })
    .where(eq(enquiriesTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Enquiry not found" });
    return;
  }

  res.json(updated);
});

router.put("/enquiries/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateEnquiryStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateEnquiryStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [current] = await db
    .select({ status: enquiriesTable.status })
    .from(enquiriesTable)
    .where(eq(enquiriesTable.id, params.data.id));

  const previousStatus = current?.status;

  const [updated] = await db
    .update(enquiriesTable)
    .set({ status: parsed.data.status })
    .where(eq(enquiriesTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Enquiry not found" });
    return;
  }

  res.json(updated);

  const statusChanged = previousStatus !== updated.status;
  if (statusChanged && updated.email && updated.referenceNumber) {
    const baseUrl = process.env.APP_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
    const trackingUrl = `${baseUrl}/track?ref=${updated.referenceNumber}`;
    sendStatusNotification({
      customerName: updated.name,
      customerEmail: updated.email,
      referenceNumber: updated.referenceNumber,
      newStatus: updated.status,
      trackingUrl,
    }).catch((err: unknown) => {
      logger.error({ err, enquiryId: updated.id }, "[notify] Failed to send status email");
    });
  }
});

router.get("/enquiries/export", requireAdmin, async (req, res): Promise<void> => {
  const query = ExportEnquiriesQueryParams.safeParse(req.query);

  const conditions: SQL<unknown>[] = [];
  if (query.success && query.data.audience && query.data.audience !== "all") {
    conditions.push(eq(enquiriesTable.audience, query.data.audience));
  }

  const rows = await db
    .select()
    .from(enquiriesTable)
    .where(conditions.length > 0 ? conditions[0] : undefined)
    .orderBy(desc(enquiriesTable.createdAt));

  const headers = ["ID", "Reference", "Name", "Phone", "Email", "Audience", "Project Type", "Budget", "Message", "Product Interest", "Location", "Status", "Read", "Date"];
  const csvRows = rows.map((r) => [
    r.id,
    r.referenceNumber ?? "",
    `"${r.name.replace(/"/g, '""')}"`,
    r.phone,
    r.email ?? "",
    r.audience,
    r.projectType ?? "",
    r.budget ?? "",
    `"${r.message.replace(/"/g, '""')}"`,
    r.productInterest ?? "",
    r.location ?? "",
    r.status,
    r.isRead ? "Yes" : "No",
    r.createdAt.toISOString(),
  ].join(","));

  const csv = [headers.join(","), ...csvRows].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=enquiries.csv");
  res.send(csv);
});

export default router;
