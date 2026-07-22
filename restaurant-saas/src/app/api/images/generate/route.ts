import { NextResponse } from "next/server";

const API_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/images/generations";
const MODEL = "doubao-seedream-5-0-260128";

export async function POST(request: Request) {
  const { preset, variant, platform, text, count } = await request.json();
  const apiKey = process.env.VOLC_API_KEY;
  const maxImages = Math.min(Math.max(parseInt(count) || 2, 1), 8);

  if (!apiKey) {
    return NextResponse.json({ images: placeholders(preset, variant, platform, text, maxImages) });
  }

  try {
    const prompt = buildPrompt(preset, variant, platform, text);
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        sequential_image_generation: "auto",
        sequential_image_generation_options: { max_images: maxImages },
        response_format: "url",
        size: "2K",
        stream: false,
        watermark: true,
      }),
    });
    const data = await res.json();
    return NextResponse.json({ images: extractImages(data, maxImages) });
  } catch {
    return NextResponse.json({ images: placeholders(preset, variant, platform, text, maxImages) });
  }
}

function extractImages(data: any, maxImages: number): string[] {
  const urls: string[] = [];
  for (const key of ["data", "images"]) {
    if (data?.[key]) {
      for (const item of data[key]) {
        if (item.url) urls.push(item.url);
        if (urls.length >= maxImages) break;
      }
    }
  }
  return urls.length > 0 ? urls : placeholders("", "", "", "", maxImages);
}

function placeholders(p: string, v: string, pf: string, t: string, n: number): string[] {
  const text = (p ? p + "-" + v : "sample") + (t ? " " + t : "");
  return Array.from({ length: n }, (_, i) =>
    "https://placehold.co/400x400/e2e8f0/64748b?text=" + encodeURIComponent(text + " " + (i + 1))
  );
}

function buildPrompt(preset: string, variant: string, platform: string, text: string): string {
  const tpl: Record<string, string> = {
    dish: "餐厅菜品展示照片，突出食材质感和摆盘精致度，专业美食摄影",
    poster: "餐厅活动宣传海报设计，视觉冲击力强，吸引顾客注意",
    cover: "社交媒体封面图设计，简洁美观有食欲，适合做头像或封面",
    menu: "菜单推荐菜品展示图，精致美食摄影风格，让人有点单欲望",
    event: "节日促销活动视觉设计，喜庆氛围感，突出优惠信息",
  };
  let prompt = tpl[preset] || tpl.dish;
  prompt += "，" + variant + "风格";
  if (text) prompt += "，图上显示文字：" + text;
  return prompt;
}
