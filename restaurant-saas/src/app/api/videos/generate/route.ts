import { NextResponse } from "next/server";

const API_KEY = process.env.VOLC_API_KEY;

export async function POST(request: Request) {
  const { template, platform, script } = await request.json();

  if (!API_KEY) {
    return NextResponse.json({
      videos: ["https://placehold.co/400x600/e2e8f0/64748b?text=视频生成示例"],
      script,
    });
  }

  try {
    const prompt = buildVideoPrompt(template, platform, script);
    const res = await fetch("https://ark.cn-beijing.volces.com/api/v3/videos/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + API_KEY },
      body: JSON.stringify({
        model: process.env.VOLC_VIDEO_MODEL || "doubao-video-1.0",
        prompt,
        size: getVideoSize(platform),
        duration: 15,
        style: template,
        watermark: true,
      }),
    });
    const data = await res.json();
    return NextResponse.json({ videos: data.videos || [{ url: data.url || "" }], script });
  } catch {
    return NextResponse.json({
      videos: ["https://placehold.co/400x600/e2e8f0/64748b?text=视频模拟"],
      script,
    });
  }
}

function getVideoSize(platform: string): string {
  const sizes: Record<string, string> = { douyin: "1080x1920", xiaohongshu: "1080x1440", shipin: "1920x1080" };
  return sizes[platform] || "1080x1920";
}

function buildVideoPrompt(template: string, platform: string, script: string, ): string {
  const tpl: Record<string, string> = {
    dish: "菜品展示，美食特写摄影风格，突出食材质感",
    kitchen: "后厨纪实，师傅制作过程展示，真实且专业",
    explore: "探店打卡，店铺环境体验，带观众沉浸式体验",
    event: "活动预告，节日促销信息展示，喜庆氛围",
    newdish: "新品发布，新品推荐介绍，激发顾客购买欲",
  };
  let prompt = tpl[template] || tpl.dish;
  prompt += "，适合" + platform;
  if (script) prompt += "，配音内容：" + script.substring(0, 200);
  return prompt;
}
