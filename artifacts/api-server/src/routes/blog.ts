import { Router, type IRouter } from "express";
import { db, blogPostsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import {
  ListBlogPostsQueryParams,
  CreateBlogPostBody,
  GenerateBlogPostBody,
  GetBlogPostParams,
  UpdateBlogPostParams,
  UpdateBlogPostBody,
  DeleteBlogPostParams,
} from "@workspace/api-zod";
import { requireAdmin } from "./admin";
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

  const conditions: any[] = [];
  if (published != null) {
    conditions.push(eq(blogPostsTable.published, published));
  }

  const [countResult] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(blogPostsTable)
    .where(conditions.length > 0 ? conditions[0] : undefined);

  const rows = await db
    .select()
    .from(blogPostsTable)
    .where(conditions.length > 0 ? conditions[0] : undefined)
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

  const prompt = `Write a detailed, engaging blog article for Stone World, a premium building materials company established in 2003. 
Topic: "${topic}"
Keywords to include: ${keywords.length > 0 ? keywords.join(", ") : "none specified"}

The article should:
- Be 600-900 words
- Be informative, helpful, and showcase expertise in building materials (marble, stone, quartz, tiles, sanitary ware, ceramic, cement, TMT bars, etc.)
- Include practical tips or insights for homeowners and contractors
- Have a compelling introduction and a clear structure
- Be professional but accessible
- End with a subtle call-to-action encouraging readers to visit Stone World

Return ONLY a JSON object with this exact structure:
{
  "title": "The article title",
  "excerpt": "A 1-2 sentence summary of the article",
  "content": "The full article content (plain text with paragraph breaks using \\n\\n)",
  "tags": ["tag1", "tag2", "tag3"]
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
      tags: generatedContent.tags,
      published: publish,
      aiGenerated: true,
      readTimeMinutes,
    })
    .returning();

  res.status(201).json(post);
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
