
import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  title: z.string().trim().min(3).max(240),
  slug: z.string().trim().max(180).optional(),
  excerpt: z.string().trim().min(10).max(1000),
  content: z.string().min(50).max(200000),
  categorySlug: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

const digest = (value: string) => createHash("sha256").update(value).digest();
const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function isAuthorized(request: Request) {
  const expected = process.env.N8N_API_KEY?.trim();
  if (!expected || expected.length < 32) return false;
  const provided = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  return timingSafeEqual(digest(provided), digest(expected));
}

// Gemini often wraps output in ```markdown fences and repeats the title as an H1.
function cleanMarkdown(input: string) {
  let md = input.trim();
  const fenced = md.match(/^```(?:markdown|md)\s*\n([\s\S]*?)\n```$/i);
  if (fenced) md = fenced[1].trim();
  return md.replace(/^#\s+.+\n+/, "").trim(); // the article page already renders <h1>{title}</h1>
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL?.trim()) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: z.flattenError(parsed.error) }, { status: 422 });

  const { title, excerpt, categorySlug, tags, status } = parsed.data;
  const content = cleanMarkdown(parsed.data.content);
  const slug = slugify(parsed.data.slug || title);
  if (!slug) return NextResponse.json({ error: "Provide an English (a-z, 0-9) slug" }, { status: 422 });

  const category = await prisma.category.findUnique({ where: { slug: categorySlug }, select: { id: true } });
  if (!category) return NextResponse.json({ error: `Unknown categorySlug: ${categorySlug}` }, { status: 422 });

  const readingTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

  try {
    const article = await prisma.article.create({
      data: { title, slug, excerpt, content, categoryId: category.id, tags, readingTime, status, publishedAt: status === "PUBLISHED" ? new Date() : null },
      select: { id: true, slug: true, status: true },
    });
    if (article.status === "PUBLISHED") {
      revalidateTag("articles");
      revalidatePath("/");
      revalidatePath("/articles");
      revalidatePath(`/articles/${article.slug}`);
    }
    return NextResponse.json({ ok: true, ...article }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    console.error("Ingest failed", error);
    return NextResponse.json({ error: "Could not save article" }, { status: 500 });
  }
}