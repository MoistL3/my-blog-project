import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { getArticleBySlug, getArticles } from "@/lib/data";

export async function generateStaticParams() { return (await getArticles()).map(({ slug }) => ({ slug })); }

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  return <article className="article-detail"><Link className="back-link" href="/articles">← all articles</Link>{article.coverImage && <div className="article-cover"><Image src={article.coverImage} alt={article.title} fill sizes="(max-width: 798px) calc(100vw - 38px), 760px" quality={80} priority /></div>}<header><p className="eyebrow">{article.category?.name ?? "engineering"}</p><h1>{article.title}</h1><p className="article-excerpt">{article.excerpt}</p><div className="detail-meta"><span>{article.publishedAt?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) ?? "Draft"}</span><span>·</span><span>{article.readingTime} min read</span></div><div className="tag-row">{article.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></header><Markdown content={article.content} /><div className="article-end">end of transmission <span>✳</span></div></article>;
}