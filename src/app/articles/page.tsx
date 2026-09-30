import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { SectionTitle } from "@/components/section-title";
import { getArticles, getCategories } from "@/lib/data";

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [articles, categories] = await Promise.all([getArticles(), getCategories()]);
  const { category: categorySlug } = await searchParams;
  const filteredArticles = categorySlug ? articles.filter((article) => article.category?.slug === categorySlug) : articles;
  return <div className="page-section"><div className="page-intro"><p className="eyebrow">knowledge base</p><h1>Notes from the build.</h1><p>Field notes on engineering, systems, and the process of making useful things.</p></div><div className="category-pills"><Link className={`category-pill${categorySlug ? "" : " active"}`} href="/articles">all writing <span>{articles.length}</span></Link>{categories.map((category) => <Link className={`category-pill${categorySlug === category.slug ? " active" : ""}`} href={`/articles?category=${encodeURIComponent(category.slug)}`} key={category.id}>{category.name}<span>{articles.filter((article) => article.category?.slug === category.slug).length}</span></Link>)}</div><SectionTitle>{categorySlug ? `Articles in ${categories.find((category) => category.slug === categorySlug)?.name ?? "this category"}` : "Published articles"}</SectionTitle>{filteredArticles.length ? <div className="article-grid article-grid-wide">{filteredArticles.map((article) => <ArticleCard article={article} key={article.id} />)}</div> : <div className="empty-state"><p>{categorySlug ? "No published articles in this category yet." : "No published articles yet."}</p></div>}</div>;
}