import Link from "next/link";
import { Suspense } from "react";
import Image from "next/image";
import { ArrowDownRight, ArrowUpRight, CodeXml, Network, Mail } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { SectionTitle } from "@/components/section-title";
import { getArticles, getSettings } from "@/lib/data";

async function LatestArticles({ articlesPromise }: { articlesPromise: ReturnType<typeof getArticles> }) {
  const articles = await articlesPromise;
  return <section className="content-section"><div className="section-top"><SectionTitle>Latest articles</SectionTitle><Link className="text-link" href="/articles">all articles <span>↗</span></Link></div><div className="article-grid">{articles.slice(0, 3).map((article) => <ArticleCard article={article} key={article.id} />)}</div></section>;
}

function ContentSkeleton() {
  return <section className="content-section" aria-hidden="true"><div className="section-top"><span className="skeleton skeleton-title" /></div><div className="article-grid">{Array.from({ length: 3 }, (_, index) => <div className="skeleton-card" key={index}><span className="skeleton skeleton-line" /><span className="skeleton skeleton-line wide" /><span className="skeleton skeleton-line" /></div>)}</div></section>;
}

export default async function Home() {
  const settingsPromise = getSettings();
  const articlesPromise = getArticles();
  const settings = await settingsPromise;
  return <div className="home-page">
    <section className="hero"><div className="hero-copy">{settings.avatarUrl && <Image className="hero-avatar" src={settings.avatarUrl} alt={`${settings.ownerName} profile`} width={72} height={72} sizes="72px" quality={80} priority />}<p className="eyebrow">hello, world — i&apos;m {settings.ownerName}</p><h1>{settings.headline}</h1><p className="hero-description">{settings.bio}</p><div className="hero-actions"><Link className="button button-primary" href="/articles">read the articles <ArrowUpRight size={16} /></Link><Link className="button button-quiet" href="/qa">ask a question <ArrowDownRight size={16} /></Link></div><div className="social-links">{settings.github && <a href={settings.github} aria-label="GitHub" target="_blank" rel="noreferrer"><CodeXml size={17} /></a>}{settings.linkedin && <a href={settings.linkedin} aria-label="LinkedIn" target="_blank" rel="noreferrer"><Network size={17} /></a>}{settings.x && <a href={settings.x} aria-label="X" target="_blank" rel="noreferrer">𝕏</a>}{settings.email && <a href={`mailto:${settings.email}`} aria-label="Email"><Mail size={17} /></a>}{(settings.github || settings.linkedin || settings.x || settings.email) && <span className="social-divider" />}<span>based on earth · working everywhere</span></div></div><div className="hero-terminal"><div className="terminal-header"><div className="terminal-dots"><i /><i /><i /></div><span>~/about-me</span><span>•••</span></div><div className="terminal-content"><p><span className="terminal-prompt">➜</span> <span className="terminal-path">~</span> whoami</p><p className="terminal-output">{settings.ownerName.toLowerCase().replaceAll(" ", "_")}</p><p><span className="terminal-prompt">➜</span> <span className="terminal-path">~</span> cat ./about.txt</p><p className="terminal-output">{settings.headline}</p><p><span className="terminal-prompt">➜</span> <span className="terminal-path">~</span> <span className="cursor">_</span></p></div><div className="terminal-bottom"><span>UTF-8</span><span>main* &nbsp; Ln 08, Col 12</span></div></div><div className="hero-grid-mark" aria-hidden="true" /></section>
    <Suspense fallback={<ContentSkeleton />}><LatestArticles articlesPromise={articlesPromise} /></Suspense>
    {settings.email && <section className="contact-panel"><div><p className="eyebrow">next step</p><h2>Have a good problem?<br /><span>Let&apos;s talk about it.</span></h2></div><a className="button button-primary" href={`mailto:${settings.email}`}>send me a note <ArrowUpRight size={16} /></a></section>}
  </div>;
}