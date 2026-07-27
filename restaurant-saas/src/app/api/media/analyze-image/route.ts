import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { callDoubaoChatWithImages } from "@/lib/ai/media-utils";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
};

function fileToDataUri(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_MAP[ext] || "image/jpeg";
  const b64 = fs.readFileSync(filePath).toString("base64");
  return "data:" + mime + ";base64," + b64;
}

export async function POST(request: Request) {
  try {
    const { url, message } = await request.json();
    if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

    let imageArg: string;

    if (url.startsWith("/")) {
      // Local upload — Doubao cannot reach localhost, so we inline as data URI
      const filePath = path.join(process.cwd(), "public", url);
      const dataUri = fileToDataUri(filePath);
      if (!dataUri) {
        return NextResponse.json({ response: "图片文件未找到，请重新上传。" }, { status: 200 });
      }
      imageArg = dataUri;
    } else {
      // Remote URL — use directly (must be publicly accessible)
      imageArg = url;
    }

    const result = await callDoubaoChatWithImages(
      [
        { role: "system", content: "你是一位电商内容分析师，请分析图片内容并给出运营建议。" },
        { role: "user", content: message || "请分析这张图片。" },
      ],
      [imageArg],
      2048
    );

    return NextResponse.json({ response: result });
  } catch (error) {
    console.error("Image analysis error:", error);
    return NextResponse.json({ response: "图片解析失败: " + ((error as Error)?.message || "未知错误") }, { status: 200 });
  }
}
