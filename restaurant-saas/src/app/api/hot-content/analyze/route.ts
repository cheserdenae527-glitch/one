import { NextResponse } from "next/server";
import { callLLM } from "@/lib/ai/client";

export async function POST(request: Request) {
  try {
    const item = await request.json();
    if (!item?.title) return NextResponse.json({ error: "缺少标题" }, { status: 400 });
    let p = '分析以下餐饮内容的文案风格钩子类型内容结构语气风格';
    p += '标题：' + (item.title || "");
    p += '内容：' + (item.briefContent || "");
    p += '平台：' + (item.platform || "");
    p += '请以JSON格式输出。';
    const result = await callLLM(p, 2048);
    const cleaned = result.replace(/`json\\s*/g,"").replace(/`\\s*/g,"").trim();
    try { return NextResponse.json({ success: true, analysis: JSON.parse(cleaned) }); }
    catch { return NextResponse.json({ success: true, analysis: { writingStyle: cleaned, hookType: "", structure: [], toneTags: [], promptTemplate: "" } }); }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "分析失败" }, { status: 500 });
  }
}