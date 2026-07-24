import { NextResponse } from "next/server";

const API = "https://ark.cn-beijing.volces.com/api/v3/images/generations";
const MODEL = "doubao-seedream-5-0-260128";

export async function POST(request: Request) {
  const { preset, variant, platform, text, count, imageDataUrl, dishDescription, anchorDetails, dishName } = await request.json();
  const apiKey = process.env.VOLC_API_KEY;
  const n = Math.min(Math.max(parseInt(count) || 2, 1), 8);

  if (!apiKey) return NextResponse.json({ images: placeholders(preset, variant, text, n) });

  try {
    const prompt = buildPrompt({ preset, variant, platform, text, dishDescription, anchorDetails, dishName });
    const body: any = { model: MODEL, prompt, n, response_format: "url", size: "2K", watermark: true };

    if (imageDataUrl && imageDataUrl.startsWith("data:")) {
      // For img2img: pass the reference image to Seedream
      body.reference_image = imageDataUrl;
      body.strength = 0.85;
    }

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json({ images: extractImages(data, n) });
  } catch (e: any) {
    return NextResponse.json({ images: placeholders(preset, variant, text, n), error: e?.message || "seedream failed" });
  }
}

function buildPrompt(params: {
  preset: string; variant: string; platform: string; text?: string;
  dishDescription?: string; anchorDetails?: string; dishName?: string;
}): string {
  const { preset, variant, dishDescription, anchorDetails, text } = params;

  const styles: Record<string, string> = {
    dish: "精致美食摄影，突出食材质感和摆盘，柔和光线",
    poster: "活动宣传海报设计，视觉冲击力强",
    cover: "社交媒体封面图，简洁美观有食欲",
    menu: "菜单推荐菜品展示图，精致美食摄影风格",
    event: "节日促销视觉设计，喜庆氛围感",
  };

  if (dishDescription) {
    // Structured prompt with hard constraints
    let p = "【参考图——必须100%保留的菜品】\n" + dishDescription + "\n\n";
    p += "【硬约束——绝对不允许改变的】\n";
    p += "食材种类、形状、颜色完全保持不变\n";
    p += "菜品的核心视觉特征不能改变\n\n";
    if (anchorDetails) p += "【锚点细节——必须完全保留】\n" + anchorDetails + "\n\n";
    p += "【优化方向——只允许改变】\n";
    p += "背景、光线、滤镜、构图\n\n";
    p += styles[preset] || styles.dish;
    p += "，" + variant + "风格";
    if (text) p += "，图上显示文字：" + text;
    return p;
  }

  let p = styles[preset] || styles.dish;
  p += "，" + variant + "风格";
  if (text) p += "，图上显示文字：" + text;
  return p;
}

function extractImages(data: any, n: number): string[] {
  const urls: string[] = [];
  for (const key of ["data", "images"]) {
    if (data?.[key]) {
      for (const item of data[key]) {
        if (item.url) urls.push(item.url);
        if (urls.length >= n) break;
      }
    }
  }
  return urls.length > 0 ? urls : [];
}

function placeholders(p: string, v: string, t: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) =>
    "https://placehold.co/400x400/e2e8f0/64748b?text=" + encodeURIComponent(p + "-" + v + (t ? " " + t : "") + " " + (i + 1))
  );
}
