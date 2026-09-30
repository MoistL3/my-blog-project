import Image from "next/image";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeReact from "rehype-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

function MarkdownImage({ src, alt = "", title }: { src?: string; alt?: string; title?: string }) {
  if (!src) return null;
  const isBlobImage = /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(src);
  const isLocalImage = src.startsWith("/") && !src.startsWith("//");
  return <Image src={src} alt={alt} title={title} width={1200} height={675} sizes="(max-width: 798px) calc(100vw - 38px), 760px" quality={80} unoptimized={!isBlobImage && !isLocalImage} />;
}

export async function Markdown({ content }: { content: string }) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrettyCode, { theme: "github-dark", keepBackground: false })
    .use(rehypeReact, { Fragment, jsx, jsxs, components: { img: MarkdownImage } })
    .process(content);
  return <div className="markdown-body">{file.result as React.ReactNode}</div>;
}