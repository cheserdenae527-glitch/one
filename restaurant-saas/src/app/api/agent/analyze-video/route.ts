import { NextResponse } from "next/server";
import fs from "fs";
import { downloadVideo } from "@/lib/video/processor";
import { buildAgentContext } from "@/lib/agent";
import { callDeepSeekWithMessages } from "@/lib/ai/client";
import type { VideoAnalysisInput } from "@/lib/agent/prompts";

export async function POST(request: Request) {
  try {
    const { url, message } = await request.json();
    if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

    const video = await downloadVideo(url);
    const meta = video.metadata;
    const context = await buildAgentContext("demo-merchant");

    const input: VideoAnalysisInput = {
      source: "url", url,
      durationSeconds: meta?.duration || 0,
      keyframeDescriptions: meta?.title ? [`标题: ${meta.title}`, `时长: ${meta.duration}秒`, `发布者: ${meta.uploader || "未知"}`] : [],
      sourcePlatform: meta?.uploader ? "抖音" : "直接链接",
      userQuestion: message,
    };

    const result = await callDeepSeekWithMessages([
      { role: "system", content: `你是一位视频内容分析师。分析以下视频信息并给出见解。` },
      { role: "user", content: JSON.stringify(input) + (message ? `\n用户问题：${message}` : "") },
    ], 2048);

    try { fs.unlinkSync(video.filePath); } catch {}
    return NextResponse.json({ response: result });
  } catch (error) {
    console.error("Video analysis error:", error);
    return NextResponse.json({ response: "视频解析失败: " + ((error as Error)?.message || "未知错误") }, { status: 200 });
  }
}
