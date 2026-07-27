import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";
import Ffmpeg from "fluent-ffmpeg";


const execFileAsync = promisify(execFile);
const YTDLP_PATH = path.join(process.cwd(), "bin", "yt-dlp.exe");
const COOKIES_FILE = path.join(process.cwd(), "cookies.txt");

export interface VideoMeta {
  title?: string;
  duration?: number;
  uploader?: string;
  width?: number;
  height?: number;
}

export interface DownloadedVideo {
  filePath: string;
  contentType: string;
  fileSizeBytes: number;
  downloadUrl: string;
  metadata?: VideoMeta;
}

export async function downloadVideo(url: string): Promise<DownloadedVideo> {
  if (/(?:v\.|www\.)douyin\.com|b23\.tv/i.test(url)) {
    return downloadWithYtDlp(url);
  }
  return downloadWithFetch(url);
}

/** Try to find usable cookies for yt-dlp. Priority: cookies.txt > Chrome browser. */
function getCookieArgs(): string[] {
  if (fs.existsSync(COOKIES_FILE)) return ["--cookies", COOKIES_FILE];
  return ["--cookies-from-browser", "chrome"];
}

async function downloadWithYtDlp(url: string): Promise<DownloadedVideo> {
  let cookieArgs: string[] = [];
  try {
    cookieArgs = getCookieArgs();
    const { stdout } = await execFileAsync(
      YTDLP_PATH,
      ["--dump-json", url, "--no-playlist", ...cookieArgs],
      { timeout: 30000 }
    );
    const meta = JSON.parse(stdout);
    const ext = meta.ext || "mp4";
    const outPath = path.join(os.tmpdir(), "yt-" + Date.now() + "." + ext);
    await execFileAsync(
      YTDLP_PATH,
      [url, "-o", outPath, "--no-playlist", "--no-warnings", ...cookieArgs],
      { timeout: 120000 }
    );
    const stat = fs.statSync(outPath);
    return {
      filePath: outPath,
      contentType: "video/" + (ext === "mp4" ? "mp4" : ext),
      fileSizeBytes: stat.size,
      downloadUrl: url,
      metadata: {
        title: meta.title,
        duration: Math.round(meta.duration || 0),
        uploader: meta.uploader || meta.channel,
        width: meta.width,
        height: meta.height,
      },
    };
  } catch (e: any) {
    const msg = (e?.stderr || e?.message || "").toLowerCase();
    if (msg.includes("cookies")) {
      throw new Error(
        "抖音视频需要登录信息才能下载。\n" +
        "方案一：在 Chrome 浏览器登录抖音，再试一次（会自动提取 Cookie）\n" +
        "方案二：将 Cookies 导出为 cookies.txt 放在项目根目录"
      );
    }
    // Last resort: try without cookies (some public videos work)
    if (!cookieArgs.length) throw e;
    try {
      const { stdout } = await execFileAsync(
        YTDLP_PATH,
        ["--dump-json", url, "--no-playlist", "--extractor-args", "douyin:no_cookies"],
        { timeout: 15000 }
      );
      const meta = JSON.parse(stdout);
      const ext = meta.ext || "mp4";
      const outPath = path.join(os.tmpdir(), "yt-" + Date.now() + "." + ext);
      await execFileAsync(
        YTDLP_PATH,
        [url, "-o", outPath, "--no-playlist", "--no-warnings"],
        { timeout: 60000 }
      );
      const stat = fs.statSync(outPath);
      return {
        filePath: outPath,
        contentType: "video/" + (ext === "mp4" ? "mp4" : ext),
        fileSizeBytes: stat.size,
        downloadUrl: url,
        metadata: {
          title: meta.title,
          duration: Math.round(meta.duration || 0),
          uploader: meta.uploader || meta.channel,
          width: meta.width,
          height: meta.height,
        },
      };
    } catch {
      throw e;
    }
  }
}

async function downloadWithFetch(url: string): Promise<DownloadedVideo> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Download failed: HTTP " + resp.status);
  const buffer = Buffer.from(await resp.arrayBuffer());
  const ext = path.extname(new URL(url).pathname) || ".mp4";
  const filePath = path.join(os.tmpdir(), "vd-" + Date.now() + ext);
  fs.writeFileSync(filePath, buffer);
  return {
    filePath: filePath,
    contentType: resp.headers.get("content-type") || "video/mp4",
    fileSizeBytes: buffer.length,
    downloadUrl: url,
  };
}

export interface LocalVideoInfo {
  durationSeconds: number;
  width: number;
  height: number;
  codec: string;
  fps: number;
}

export function getLocalVideoInfo(filePath: string): Promise<LocalVideoInfo> {
  return new Promise((resolve, reject) => {
    Ffmpeg.ffprobe(filePath, (err: any, metadata: any) => {
      if (err) return reject(err);
      const stream = metadata.streams.find((s: any) => s.codec_type === "video");
      resolve({
        durationSeconds: Math.round(metadata.format.duration || 0),
        width: stream?.width || 0,
        height: stream?.height || 0,
        codec: stream?.codec_name || "unknown",
        fps: evalFps(stream?.r_frame_rate),
      });
    });
  });
}

function evalFps(rFrameRate?: string): number {
  if (!rFrameRate) return 0;
  const parts = rFrameRate.split("/");
  if (parts.length !== 2) return 0;
  return Math.round(parseInt(parts[0]) / parseInt(parts[1]));
}
