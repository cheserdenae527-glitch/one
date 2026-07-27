import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import Ffmpeg from "fluent-ffmpeg";
import { downloadVideo, getLocalVideoInfo } from "@/lib/video/processor";
import { callDoubaoChatWithImages } from "@/lib/ai/media-utils";
import { callDeepSeekWithMessages } from "@/lib/ai/client";
import { buildVideoAnalysisPrompt } from "@/lib/agent/video-analysis-template";
import type { VideoAnalysisInput } from "@/lib/agent/prompts";

function isLocalUploadUrl(url: string): boolean {
  return url.startsWith("/uploads/");
}

function isSafeRemoteUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    const host = parsed.hostname;
    if (["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(host)) return false;
    if (/^(10\.|192\.168\.|169\.254\.)/.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { url, message } = await request.json();
    if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

    const systemPrompt = buildVideoAnalysisPrompt({
      name: "demo-merchant",
      cuisineType: "川菜",
      city: "成都",
      targetCustomers: "年轻人",
    });

    let input: VideoAnalysisInput;
    let tempFilePath: string | null = null;

    if (isLocalUploadUrl(url)) {
      const filePath = path.join(process.cwd(), "public", url);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ response: "上传的视频文件未找到，请重新上传。" }, { status: 200 });
      }
      const stats = fs.statSync(filePath);
      let info = { durationSeconds: 0, width: 0, height: 0, codec: "unknown", fps: 0 };
      try {
        info = await getLocalVideoInfo(filePath);
      } catch (e) {
        console.error("ffprobe failed (fallback to file stats):", e);
      }

      const frameDir = path.join(os.tmpdir(), "vf-" + Date.now());
      fs.mkdirSync(frameDir, { recursive: true });
      const frameCount = Math.min(3, Math.max(1, Math.ceil(info.durationSeconds / 5)));

      try {
        await new Promise<void>((resolve, reject) => {
          Ffmpeg(filePath)
            .screenshots({ count: frameCount, folder: frameDir, filename: "frame-%i.jpg", size: "640x?" })
            .on("end", () => resolve())
            .on("error", reject);
        });
      } catch (e) {
        console.error("ffmpeg screenshot failed:", e);
      }

      const frameDataUris: string[] = [];
      for (let i = 1; i <= frameCount; i++) {
        const fp = path.join(frameDir, "frame-" + i + ".jpg");
        if (fs.existsSync(fp) && fs.statSync(fp).size > 0) {
          const b64 = fs.readFileSync(fp).toString("base64");
          frameDataUris.push("data:image/jpeg;base64," + b64);
        }
      }

      if (frameDataUris.length > 0) {
        const metaLines = [
          "文件: " + path.basename(filePath),
          "时长: " + info.durationSeconds + "秒",
          "分辨率: " + info.width + "x" + info.height,
          "编码: " + info.codec,
          "大小: " + (stats.size / 1024 / 1024).toFixed(1) + "MB",
        ];
        if (message) metaLines.push("用户问题: " + message);

        const visionResult = await callDoubaoChatWithImages(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: "视频信息：\n" + metaLines.join("\n") },
          ],
          frameDataUris,
          4096
        );
        try { fs.rmSync(frameDir, { recursive: true }); } catch {}
        return NextResponse.json({ response: visionResult });
      }

      input = {
        source: "url",
        url,
        durationSeconds: info.durationSeconds,
        keyframeDescriptions: [
          "本地上传文件: " + path.basename(filePath),
          "文件大小: " + (stats.size / 1024 / 1024).toFixed(1) + "MB",
          "时长: " + info.durationSeconds + "秒",
          "分辨率: " + info.width + "x" + info.height,
        ].filter(Boolean),
        sourcePlatform: "本地上传",
        userQuestion: message,
      };
    } else {
      if (!isSafeRemoteUrl(url)) {
        return NextResponse.json({ error: "unsupported or unsafe url" }, { status: 400 });
      }
      const video = await downloadVideo(url);
      const meta = video.metadata;
      tempFilePath = video.filePath;
      input = {
        source: "url",
        url,
        durationSeconds: meta?.duration || 0,
        keyframeDescriptions: meta?.title ? ["标题: " + meta.title, "时长: " + meta.duration + "秒", "发布者: " + (meta.uploader || "未知")] : [],
        sourcePlatform: meta?.uploader ? "抖音" : "直接链接",
        userQuestion: message,
      };
    }

    const result = await callDeepSeekWithMessages([
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(input) + (message ? "\n用户问题：" + message : "") },
    ], 4096);

    if (tempFilePath) {
      try { fs.unlinkSync(tempFilePath); } catch {}
    }
    return NextResponse.json({ response: result });
  } catch (error) {
    console.error("Video analysis error:", error);
    return NextResponse.json({ response: "视频解析失败: " + ((error as Error)?.message || "未知错误") }, { status: 200 });
  }
}
