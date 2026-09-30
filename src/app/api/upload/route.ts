import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

async function hasExpectedSignature(file: File, type: string) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
  if (type === "image/webp") return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  if (type === "image/avif") return new TextDecoder().decode(bytes.slice(4, 12)).includes("ftyp") && /avif|avis/.test(new TextDecoder().decode(bytes.slice(8, 16)));
  return false;
}

export async function POST(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN is not configured" }, { status: 503 });
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 11 * 1024 * 1024) return NextResponse.json({ error: "Files must be 10 MB or smaller" }, { status: 413 });
  const form = await request.formData();
  const file = form.get("file"); const kind = String(form.get("kind") ?? "");
  if (!["avatar", "article"].includes(kind)) return NextResponse.json({ error: "Unsupported upload type" }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "Select a file to upload" }, { status: 400 });
  const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!imageTypes.includes(file.type)) return NextResponse.json({ error: "Choose a JPEG, PNG, WebP, or AVIF image" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Files must be 10 MB or smaller" }, { status: 413 });
  if (!(await hasExpectedSignature(file, file.type))) return NextResponse.json({ error: "The file content does not match its declared type" }, { status: 400 });
  try {
    const blob = await put(`${kind}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`, file, { access: "public", addRandomSuffix: true, contentType: file.type, cacheControlMaxAge: 60 * 60 * 24 * 365 });
    return NextResponse.json({ url: blob.url });
  } catch (error) { console.error("Upload failed", error); return NextResponse.json({ error: "Upload failed" }, { status: 500 }); }
}