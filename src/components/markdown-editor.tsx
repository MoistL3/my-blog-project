"use client";

import { useState, type ComponentProps } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function PreviewImage({ src, alt = "" }: Omit<ComponentProps<"img">, "src"> & { src?: string | Blob }) {
  if (typeof src !== "string" || !src) return null;
  const isBlobImage = /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(src);
  const isLocalImage = src.startsWith("/") && !src.startsWith("//");
  return <Image src={src} alt={alt} width={1200} height={675} sizes="(max-width: 798px) calc(100vw - 38px), 760px" quality={80} unoptimized={!isBlobImage && !isLocalImage} />;
}

export function MarkdownEditor({ name = "content", initialValue = "" }: { name?: string; initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  const [preview, setPreview] = useState(false);
  return <div className="markdown-editor"><div className="editor-tabs"><button type="button" className={!preview ? "selected" : ""} onClick={() => setPreview(false)}>write markdown</button><button type="button" className={preview ? "selected" : ""} onClick={() => setPreview(true)}>live preview</button></div>{preview ? <div className="editor-preview markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ img: PreviewImage }}>{value || "Nothing to preview yet."}</ReactMarkdown></div> : <textarea name={name} required minLength={1} value={value} onChange={(event) => setValue(event.target.value)} placeholder="Write your article in Markdown…" />}</div>;
}