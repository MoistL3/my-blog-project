import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { mockArticles, mockCategories, mockQuestions, mockSettings, type Settings } from "@/lib/mock-data";

const databaseReady = Boolean(process.env.DATABASE_URL?.trim());
const emptySettings: Settings = { id: "site", ownerName: "Your Name", headline: "Building thoughtful software for the web.", bio: "" };

function restoreDate(value: Date | string | null | undefined): Date | null | undefined {
  if (value == null) return value;
  return value instanceof Date ? value : new Date(value);
}

const cachedSettings = unstable_cache(async () => {
  return (await prisma.siteSettings.findUnique({ where: { id: "site" } })) ?? emptySettings;
}, ["site-settings-v1"], { revalidate: 3600, tags: ["settings"] });

const cachedCategories = unstable_cache(async () => {
  return prisma.category.findMany({ orderBy: { order: "asc" } });
}, ["categories-v1"], { revalidate: 3600, tags: ["categories"] });

const cachedPublishedArticles = unstable_cache(async () => {
  return prisma.article.findMany({ where: { status: "PUBLISHED" }, include: { category: true }, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }] });
}, ["published-articles-v1"], { revalidate: 600, tags: ["articles"] });

const cachedPublicQuestions = unstable_cache(async () => {
  return prisma.question.findMany({ where: { status: "ANSWERED", isPublic: true }, orderBy: { createdAt: "desc" } });
}, ["public-questions-v1"], { revalidate: 300, tags: ["questions"] });

export async function getSettings() {
  if (!databaseReady) return mockSettings;
  return cachedSettings();
}

export async function getCategories() {
  if (!databaseReady) return mockCategories;
  return cachedCategories();
}

export async function getArticles(includeDrafts = false) {
  if (!databaseReady) return includeDrafts ? mockArticles : mockArticles.filter((article) => article.status === "PUBLISHED");
  if (!includeDrafts) {
    const articles = await cachedPublishedArticles();
    return articles.map((article) => ({ ...article, publishedAt: restoreDate(article.publishedAt), createdAt: restoreDate(article.createdAt)!, updatedAt: restoreDate(article.updatedAt)! }));
  }
  return prisma.article.findMany({ include: { category: true }, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }] });
}

export async function getArticleBySlug(slug: string) {
  if (!databaseReady) return mockArticles.find((article) => article.slug === slug && article.status === "PUBLISHED") ?? null;
  const article = await unstable_cache(async () => {
    return prisma.article.findFirst({ where: { slug, status: "PUBLISHED" }, include: { category: true } });
  }, ["published-article-by-slug-v1", slug], { revalidate: 600, tags: ["articles"] })();
  if (!article) return null;
  return { ...article, publishedAt: restoreDate(article.publishedAt), createdAt: restoreDate(article.createdAt)!, updatedAt: restoreDate(article.updatedAt)! };
}

export async function getQuestions(publicOnly = true) {
  if (!databaseReady) return publicOnly ? mockQuestions.filter((question) => question.status === "ANSWERED" && question.isPublic) : mockQuestions;
  if (publicOnly) return cachedPublicQuestions();
  return prisma.question.findMany({ orderBy: { createdAt: "desc" } });
}