import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/mock-data";

export function ArticleCard({ article }: { article: Article }) {
  return <Link className="article-card" href={`/articles/${article.slug}`}>{article.coverImage && <div className="card-cover"><Image src={article.coverImage} alt={article.title} fill sizes="(max-width: 620px) calc(100vw - 38px), (max-width: 850px) calc((100vw - 64px) / 2), (max-width: 1200px) 33vw, 540px" quality={80} /></div>}<div className="card-meta"><span>{article.category?.name ?? "engineering"}</span><span>{article.readingTime} min read</span></div><h3>{article.title}</h3><p>{article.excerpt}</p><div className="tag-row">{article.tags.slice(0, 3).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div><span className="card-arrow">read article <span>↗</span></span></Link>;
}