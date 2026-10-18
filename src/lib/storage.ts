import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PhotoStorage } from "@/lib/types";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function extensionFor(mediaType: string): string {
  return EXTENSIONS[mediaType] ?? "bin";
}

export function uploadDir(): string {
  return path.join(process.cwd(), "data", "uploads");
}

export function safeFileId(id: string): string | null {
  if (!/^[a-zA-Z0-9.-]+$/.test(id) || id.includes("..")) return null;
  return id;
}

export async function storePhoto(bytes: Buffer, mediaType: string): Promise<{ url: string; storage: PhotoStorage; id: string }> {
  const id = `${crypto.randomUUID()}.${extensionFor(mediaType)}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`walks/${id}`, bytes, {
      access: "public",
      contentType: mediaType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return { url: blob.url, storage: "blob", id };
  }
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, id), bytes);
  return { url: `/api/files/${id}`, storage: "local", id };
}

export async function readLocalPhoto(id: string): Promise<{ bytes: Buffer; mediaType: string } | null> {
  const safe = safeFileId(id);
  if (!safe) return null;
  try {
    const bytes = await readFile(path.join(uploadDir(), safe));
    const ext = safe.split(".").pop();
    const mediaType = Object.entries(EXTENSIONS).find(([, value]) => value === ext)?.[0] ?? "application/octet-stream";
    return { bytes, mediaType };
  } catch {
    return null;
  }
}
