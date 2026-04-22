import { Router, type IRouter } from "express";
import { db, blogPostsTable } from "@workspace/db";
import { eq, sql, desc, and, type SQL } from "drizzle-orm";
import {
  ListBlogPostsQueryParams,
  CreateBlogPostBody,
  GenerateBlogPostBody,
  GetBlogPostParams,
  UpdateBlogPostParams,
  UpdateBlogPostBody,
  DeleteBlogPostParams,
} from "@workspace/api-zod";
import { requireAdmin, isAdminRequest } from "./admin";
import OpenAI from "openai";

const router: IRouter = Router();

const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_BASE ?? "https://api.openai.com/v1",
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

router.get("/blog", async (req, res): Promise<void> => {
  const query = ListBlogPostsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { published, limit = 10, offset = 0 } = query.data;

  const conditions: SQL<unknown>[] = [];
  // Unauthenticated requests may only access published posts
  const adminAccess = isAdminRequest(req);
  if (adminAccess && published != null) {
    conditions.push(eq(blogPostsTable.published, published));
  } else if (!adminAccess) {
    conditions.push(eq(blogPostsTable.published, true));
  }

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  const [countResult] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(blogPostsTable)
    .where(whereClause);

  const rows = await db
    .select()
    .from(blogPostsTable)
    .where(whereClause)
    .orderBy(desc(blogPostsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({ posts: rows, total: countResult.count, limit, offset });
});

router.post("/blog", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateBlogPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const slug =
    parsed.data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") +
    "-" +
    Date.now();
  const readTimeMinutes = estimateReadTime(parsed.data.content);

  const [post] = await db
    .insert(blogPostsTable)
    .values({ ...parsed.data, slug, readTimeMinutes, aiGenerated: false })
    .returning();

  res.status(201).json(post);
});

router.post("/blog/generate", requireAdmin, async (req, res): Promise<void> => {
  const parsed = GenerateBlogPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { topic, keywords = [], publish = false } = parsed.data;

  const UNSPLASH_COVERS: Record<string, string> = {
    marble: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=1200&q=85&auto=format&fit=crop",
    quartz: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&q=85&auto=format&fit=crop",
    tiles: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=85&auto=format&fit=crop",
    sanitaryware: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=85&auto=format&fit=crop",
    cement: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=85&auto=format&fit=crop",
    tmt: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85&auto=format&fit=crop",
    interior: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=85&auto=format&fit=crop",
    renovation: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=85&auto=format&fit=crop",
    stone: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1200&q=85&auto=format&fit=crop",
  };

  const topicLower = topic.toLowerCase();
  let coverImageUrl = UNSPLASH_COVERS.interior;
  for (const [key, url] of Object.entries(UNSPLASH_COVERS)) {
    if (topicLower.includes(key)) { coverImageUrl = url; break; }
  }

  const prompt = `You are a senior content writer for Stone World (AB Stone World Pvt. Ltd.), India's premier premium building materials company established in 2003 in Pitampura, New Delhi.

Write a cinematic, editorial-quality blog article for the Stone World Journal.

Topic: "${topic}"
Keywords to weave in: ${keywords.length > 0 ? keywords.join(", ") : "building materials, luxury, quality"}

Requirements:
- Write 800-1100 words of compelling, expert-level content
- Use proper Markdown formatting: ## for section headings, **bold** for emphasis, *italic* for material names
- Include 4-5 clear sections with descriptive headings
- Open with a vivid, scene-setting paragraph (no generic "In today's world..." opener)
- Include specific, actionable tips or insights for Indian homeowners, architects, and contractors
- Reference specific materials where relevant (marble veining, quartz durability, tile porosity, etc.)
- Use authentic Indian context: climate zones, monsoon considerations, vastu, urban spaces
- End with an inspiring call-to-action mentioning Stone World's 20-year expertise
- Tone: authoritative yet accessible, like an experienced material specialist speaking to a design-conscious audience

Return ONLY a valid JSON object:
{
  "title": "A compelling, specific article title (not generic)",
  "excerpt": "A vivid 2-sentence preview that makes readers want to read on",
  "content": "Full article in Markdown format with ## headings, **bold**, *italic*, and proper paragraph breaks",
  "tags": ["specific-tag1", "specific-tag2", "specific-tag3", "specific-tag4"]
}`;

  let generatedContent: { title: string; excerpt: string; content: string; tags: string[] };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    generatedContent = JSON.parse(raw);
  } catch (err) {
    req.log.error({ err }, "AI generation failed");
    generatedContent = {
      title: `${topic} — A Complete Guide`,
      excerpt: `Everything you need to know about ${topic} for your next project.`,
      content: `## Introduction\n\n${topic} is one of the most important considerations when planning your construction or renovation project. At Stone World, we've been helping homeowners and contractors make the right material choices since 2003.\n\n## Why It Matters\n\nChoosing the right building material makes a significant difference in the longevity, aesthetics, and value of your property. With over two decades of experience, our experts at Stone World have curated a selection that meets both aesthetic and functional requirements.\n\n## Our Recommendation\n\nWhether you're renovating your home or managing a large commercial project, Stone World offers a wide range of options including marble, granite, quartz, tiles, sanitary ware, and more. Our nationwide delivery ensures you get the best materials, wherever you are.\n\n## Conclusion\n\nVisit Stone World today to explore our collection and speak with our experts about the best options for your project.`,
      tags: [topic.toLowerCase(), "building materials", "stone world"],
    };
  }

  const slug =
    generatedContent.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") +
    "-" +
    Date.now();
  const readTimeMinutes = estimateReadTime(generatedContent.content);

  const [post] = await db
    .insert(blogPostsTable)
    .values({
      title: generatedContent.title,
      slug,
      excerpt: generatedContent.excerpt,
      content: generatedContent.content,
      coverImageUrl,
      tags: generatedContent.tags,
      published: publish,
      aiGenerated: true,
      readTimeMinutes,
    })
    .returning();

  res.status(201).json(post);
});

router.get("/blog/by-slug/:slug", async (req, res): Promise<void> => {
  const { slug } = req.params;
  const [post] = await db
    .select()
    .from(blogPostsTable)
    .where(eq(blogPostsTable.slug, slug));
  if (!post || !post.published) {
    res.status(404).json({ error: "Blog post not found" });
    return;
  }
  res.json(post);
});

router.get("/blog/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id));
  if (!post) {
    res.status(404).json({ error: "Blog post not found" });
    return;
  }
  if (!post.published && !isAdminRequest(req)) {
    res.status(404).json({ error: "Blog post not found" });
    return;
  }

  res.json(post);
});

router.put("/blog/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateBlogPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateBlogPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const readTimeMinutes = parsed.data.content ? estimateReadTime(parsed.data.content) : undefined;

  const [updated] = await db
    .update(blogPostsTable)
    .set({ ...parsed.data, ...(readTimeMinutes ? { readTimeMinutes } : {}) })
    .where(eq(blogPostsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(updated);
});

router.delete("/blog/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteBlogPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [deleted] = await db
    .delete(blogPostsTable)
    .where(eq(blogPostsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json({ success: true, message: "Post deleted" });
});

export default router;
