import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

const MAX_BYTES = 50 * 1024 * 1024; // 50MB
const ALLOWED_PREFIXES = ["image/", "video/"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (!ALLOWED_PREFIXES.some(p => file.type.startsWith(p))) {
      return NextResponse.json({ error: "only image/video files are accepted" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `file exceeds ${MAX_BYTES / 1024 / 1024}MB limit` }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || (file.type.startsWith("video/") ? ".mp4" : ".jpg");
    const safeName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, safeName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const type = file.type.startsWith("video/") ? "video" : "image";
    return NextResponse.json({
      url: `/uploads/${safeName}`,
      type,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}
