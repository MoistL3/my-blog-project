"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mockQuestions } from "@/lib/mock-data";
import { requireAdmin } from "@/lib/admin";

const text = (form: FormData, name: string) => String(form.get(name) ?? "").trim();
const optional = (value: string) => value || null;
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const configured = () => Boolean(process.env.DATABASE_URL?.trim());
const isHttpUrl = (value: string) => {
  if (!value) return true;
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; }
  catch { return false; }
};
const isPublicBlobUrl = (value: string) => {
  if (!value) return true;
  try { const url = new URL(value); return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com"); }
  catch { return false; }
};
function revalidateSite(tag: string, paths: string[]) {
  revalidateTag(tag);
  for (const path of new Set(["/", ...paths])) revalidatePath(path);
  revalidatePath("/", "layout");
}

export async function saveSettings(form: FormData) {
  await requireAdmin();
  if (!configured()) redirect("/admin/settings?error=Configure%20DATABASE_URL%20to%20save%20changes");
  const ownerName = text(form, "ownerName");
  const headline = text(form, "headline");
  const bio = text(form, "bio");
  const email = text(form, "email"); const github = text(form, "github"); const linkedin = text(form, "linkedin"); const x = text(form, "x"); const avatarUrl = text(form, "avatarUrl");
  if (!ownerName || !headline || ownerName.length > 120 || headline.length > 240 || bio.length > 10000) redirect("/admin/settings?error=Check%20the%20name%2C%20headline%2C%20and%20bio%20lengths");
  if ((email && !z.string().email().safeParse(email).success) || ![github, linkedin, x].every(isHttpUrl) || !isPublicBlobUrl(avatarUrl)) redirect("/admin/settings?error=Enter%20valid%20contact%20URLs%20and%20an%20uploaded%20profile%20image");
  try {
    await prisma.siteSettings.upsert({ where: { id: "site" }, update: { ownerName, headline, bio, email: optional(email), github: optional(github), linkedin: optional(linkedin), x: optional(x), avatarUrl: optional(avatarUrl) }, create: { id: "site", ownerName, headline, bio, email: optional(email), github: optional(github), linkedin: optional(linkedin), x: optional(x), avatarUrl: optional(avatarUrl) } });
  } catch (error) { console.error("Could not save site settings", error); redirect("/admin/settings?error=Save%20failed%20%E2%80%94%20check%20the%20database%20connection"); }
  revalidateSite("settings", ["/admin"]); redirect("/admin/settings?saved=1");
}

export async function saveArticle(form: FormData) {
  await requireAdmin();
  if (!configured()) redirect("/admin/articles?error=Configure%20DATABASE_URL%20to%20save%20changes");
  const id = text(form, "id"); const title = text(form, "title"); const slug = slugify(text(form, "slug") || title);
  const excerpt = text(form, "excerpt"); const content = text(form, "content"); const categoryId = text(form, "categoryId");
  const coverImage = text(form, "coverImage");
  if (!title || title.length > 240 || !slug || slug.length > 180 || !excerpt || excerpt.length > 1000 || !content || content.length > 200000 || !categoryId || !isPublicBlobUrl(coverImage)) redirect("/admin/articles?error=Complete%20the%20required%20fields%20with%20valid%20values");
  const status: ArticleStatus = text(form, "status") === "PUBLISHED" ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT;
  const tags = text(form, "tags").split(",").map((tag) => tag.trim()).filter(Boolean);
  const readingTime = Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
  let previousSlug: string | undefined;
  try {
    const previous = id ? await prisma.article.findUnique({ where: { id }, select: { slug: true, status: true, publishedAt: true } }) : null;
    if (id && !previous) redirect("/admin/articles?error=Article%20not%20found");
    previousSlug = previous?.slug;
    const publishedAt = status !== ArticleStatus.PUBLISHED ? null : previous?.status === ArticleStatus.PUBLISHED ? previous.publishedAt : new Date();
    const data = { title, slug, excerpt, content, categoryId, tags, readingTime, coverImage: optional(coverImage), status, publishedAt };
    if (id) await prisma.article.update({ where: { id }, data }); else await prisma.article.create({ data });
  }
  catch (error) { console.error("Could not save article", error); redirect("/admin/articles?error=Save%20failed%20(check%20unique%20slug%20and%20category)"); }
  revalidateSite("articles", ["/articles", `/articles/${slug}`, ...(previousSlug ? [`/articles/${previousSlug}`] : [])]); redirect("/admin/articles?saved=1");
}

export async function deleteArticle(form: FormData) {
  await requireAdmin();
  if (!configured()) redirect("/admin/articles?error=Database%20is%20not%20configured");
  const id = text(form, "id");
  let slug: string;
  try { const article = await prisma.article.findUnique({ where: { id }, select: { slug: true } }); if (!article) redirect("/admin/articles?error=Article%20not%20found"); slug = article.slug; await prisma.article.delete({ where: { id } }); } catch (error) { console.error(error); redirect("/admin/articles?error=Delete%20failed"); }
  revalidateSite("articles", ["/articles", `/articles/${slug}`]); redirect("/admin/articles?saved=1");
}

export async function saveCategory(form: FormData) {
  await requireAdmin();
  if (!configured()) redirect("/admin/categories?error=Configure%20DATABASE_URL%20to%20save%20changes");
  const id = text(form, "id"); const name = text(form, "name"); const slug = slugify(text(form, "slug") || name);
  if (!name || !slug) redirect("/admin/categories?error=Name%20is%20required");
  try { if (id) await prisma.category.update({ where: { id }, data: { name, slug, description: optional(text(form, "description")), order: Number(text(form, "order")) || 0 } }); else await prisma.category.create({ data: { name, slug, description: optional(text(form, "description")), order: Number(text(form, "order")) || 0 } }); }
  catch (error) { console.error("Could not save category", error); redirect("/admin/categories?error=Save%20failed%20(check%20unique%20slug)"); }
  revalidateSite("categories", ["/articles"]); revalidateTag("articles"); redirect("/admin/categories?saved=1");
}

export async function deleteCategory(form: FormData) {
  await requireAdmin();
  if (!configured()) redirect("/admin/categories?error=Database%20is%20not%20configured");
  try { await prisma.category.delete({ where: { id: text(form, "id") } }); } catch (error) { console.error(error); redirect("/admin/categories?error=Cannot%20delete%20a%20category%20with%20articles"); }
  revalidateSite("categories", ["/articles"]); revalidateTag("articles"); redirect("/admin/categories?saved=1");
}

export async function answerQuestion(form: FormData) {
  await requireAdmin();
  if (!configured()) redirect("/admin/questions?error=Configure%20DATABASE_URL%20to%20save%20changes");
  const id = text(form, "id"); const answer = text(form, "answer"); const isPublic = form.get("isPublic") === "on";
  try { await prisma.question.update({ where: { id }, data: { answer: optional(answer), status: answer ? "ANSWERED" : "NEW", isPublic: Boolean(answer) && isPublic, answeredAt: answer ? new Date() : null } }); }
  catch (error) { console.error(error); redirect("/admin/questions?error=Could%20not%20save%20answer"); }
  revalidateSite("questions", ["/qa"]); redirect("/admin/questions?saved=1");
}

export async function deleteQuestion(form: FormData) {
  await requireAdmin();
  if (!configured()) redirect("/admin/questions?error=Database%20is%20not%20configured");
  try { await prisma.question.delete({ where: { id: text(form, "id") } }); } catch (error) { console.error(error); redirect("/admin/questions?error=Delete%20failed"); }
  revalidateSite("questions", ["/qa"]); redirect("/admin/questions?saved=1");
}

export async function toggleQuestionHidden(form: FormData) {
  await requireAdmin();
  if (!configured()) redirect("/admin/questions?error=Database%20is%20not%20configured");
  const id = text(form, "id"); const hide = text(form, "hide") === "true";
  try {
    const question = await prisma.question.findUnique({ where: { id }, select: { answer: true, isPublic: true } });
    if (!question) redirect("/admin/questions?error=Question%20not%20found");
    await prisma.question.update({ where: { id }, data: { status: hide ? "HIDDEN" : question.answer ? "ANSWERED" : "NEW", isPublic: question.isPublic } });
  }
  catch (error) { console.error(error); redirect("/admin/questions?error=Could%20not%20update%20question"); }
  revalidateSite("questions", ["/qa"]); redirect("/admin/questions?saved=1");
}

const questionSchema = z.object({ body: z.string().trim().min(4).max(1000) });
let submissions: number[] = [];
export async function submitQuestion(form: FormData) {
  const honeypot = text(form, "website");
  if (honeypot) redirect("/qa?sent=1");
  const parsed = questionSchema.safeParse({ body: text(form, "body") });
  if (!parsed.success) redirect("/qa?error=Please%20enter%20a%20question%20under%201000%20characters");
  const cookieStore = await cookies();
  let anonymousToken = cookieStore.get("qa-rate-token")?.value;
  if (!anonymousToken) {
    anonymousToken = randomBytes(32).toString("hex");
    cookieStore.set("qa-rate-token", anonymousToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  const tokenHash = createHash("sha256").update(anonymousToken).digest("hex");
  if (configured()) {
    try {
      const allowed = await prisma.$transaction(async (tx) => {
        const bucket = await tx.questionRateLimit.findUnique({ where: { tokenHash } });
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (bucket && bucket.windowStart > hourAgo && bucket.count >= 3) return false;
        if (bucket && bucket.windowStart > hourAgo) await tx.questionRateLimit.update({ where: { tokenHash }, data: { count: { increment: 1 } } });
        else await tx.questionRateLimit.upsert({ where: { tokenHash }, update: { windowStart: new Date(), count: 1 }, create: { tokenHash, windowStart: new Date(), count: 1 } });
        await tx.question.create({ data: { body: parsed.data.body } });
        return true;
      }, { isolationLevel: "Serializable" });
      if (!allowed) redirect("/qa?error=Question%20limit%20reached.%20Please%20try%20again%20later.");
    } catch (error) {
      if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) throw error;
      console.error("Question rate limit could not be checked", error);
      redirect("/qa?error=Question%20could%20not%20be%20submitted%20right%20now");
    }
  } else {
    const hourAgo = Date.now() - 60 * 60 * 1000;
    submissions = submissions.filter((time) => time > hourAgo);
    if (submissions.length >= 3) redirect("/qa?error=Question%20limit%20reached.%20Please%20try%20again%20later.");
    submissions.push(Date.now());
  }
  if (!configured()) {
    mockQuestions.unshift({ id: `local-${Date.now()}`, body: parsed.data.body, status: "NEW", isPublic: false, createdAt: new Date() });
  }
  revalidateSite("questions", ["/qa"]); redirect("/qa?sent=1");
}
