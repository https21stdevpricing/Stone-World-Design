import { Router, type IRouter } from "express";
import { db, enquiriesTable } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import {
  ListEnquiriesQueryParams,
  CreateEnquiryBody,
  MarkEnquiryReadParams,
  MarkEnquiryReadBody,
  ExportEnquiriesQueryParams,
} from "@workspace/api-zod";
import { requireAdmin } from "./admin";

const router: IRouter = Router();

router.get("/enquiries", requireAdmin, async (req, res): Promise<void> => {
  const query = ListEnquiriesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { audience, read, limit = 20, offset = 0 } = query.data;

  const conditions: any[] = [];
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

router.post("/enquiries", async (req, res): Promise<void> => {
  const parsed = CreateEnquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.insert(enquiriesTable).values(parsed.data);
  res.status(201).json({ success: true, message: "Enquiry submitted successfully" });
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

router.get("/enquiries/export", requireAdmin, async (req, res): Promise<void> => {
  const query = ExportEnquiriesQueryParams.safeParse(req.query);

  const conditions: any[] = [];
  if (query.success && query.data.audience && query.data.audience !== "all") {
    conditions.push(eq(enquiriesTable.audience, query.data.audience));
  }

  const rows = await db
    .select()
    .from(enquiriesTable)
    .where(conditions.length > 0 ? conditions[0] : undefined)
    .orderBy(desc(enquiriesTable.createdAt));

  const headers = ["ID", "Name", "Phone", "Email", "Audience", "Project Type", "Budget", "Message", "Product Interest", "Location", "Read", "Date"];
  const csvRows = rows.map((r) => [
    r.id,
    `"${r.name.replace(/"/g, '""')}"`,
    r.phone,
    r.email ?? "",
    r.audience,
    r.projectType ?? "",
    r.budget ?? "",
    `"${r.message.replace(/"/g, '""')}"`,
    r.productInterest ?? "",
    r.location ?? "",
    r.isRead ? "Yes" : "No",
    r.createdAt.toISOString(),
  ].join(","));

  const csv = [headers.join(","), ...csvRows].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=enquiries.csv");
  res.send(csv);
});

export default router;
