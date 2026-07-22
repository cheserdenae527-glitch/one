import { NextResponse } from "next/server";
import { analyzeDishImage } from "@/lib/ai/doubao";

export async function POST(request: Request) {
  try {
    const { imageDataUrl, anchorImages, platform } = await request.json();
    if (!imageDataUrl) {
      return NextResponse.json({ error: "请提供图片" }, { status: 400 });
    }
    const result = await analyzeDishImage(imageDataUrl, anchorImages, platform);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "分析失败" }, { status: 500 });
  }
}
