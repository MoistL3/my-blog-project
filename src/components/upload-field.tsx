"use client";

import { useState } from "react";

export function UploadField({ name, kind, label, initialUrl = "" }: { name: string; kind: "avatar" | "article"; label: string; initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true); setMessage("Uploading…");
    const form = new FormData(); form.append("file", file); form.append("kind", kind);
    try {
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Upload failed");
      setUrl(result.url); setMessage("Upload complete. Save the form to publish it.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Upload failed"); }
    finally { setBusy(false); }
  }
  return <div className="upload-field"><label>{label}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={upload} disabled={busy} /></label><input type="hidden" name={name} value={url} /><small>{message || (url ? `Current file: ${url}` : "No file uploaded")}</small></div>;
}