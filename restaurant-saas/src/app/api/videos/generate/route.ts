import { NextResponse } from "next/server";

const API_KEY = process.env.VOLC_API_KEY;

export async function POST(request: Request) {
  const { template, platform, script } = await request.json();

  if (!API_KEY) {
    return NextResponse.json({
      videos: ["https://placehold.co/400x600/e2e8f0/64748b?text=\u89C6\u9891\u751F\u6210\u793A\u4F8B"],
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
      videos: ["https://placehold.co/400x600/e2e8f0/64748b?text=\u89C6\u9891\u6A21\u62DF"],
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
    dish: "\u83DC\u54C1\u5C55\u793A\uFF0C\u7F8E\u98DF\u7279\u5199\u6444\u5F71\u98CE\u683C\uFF0C\u7A81\u51FA\u98DF\u6750\u8D28\u611F",
    kitchen: "\u540E\u53A8\u7EAA\u5B9E\uFF0C\u5E08\u5085\u5236\u4F5C\u8FC7\u7A0B\u5C55\u793A\uFF0C\u771F\u5B9E\u4E14\u4E13\u4E1A",
    explore: "\u63A2\u5E97\u6253\u5361\uFF0C\u5E97\u94FA\u73AF\u5883\u4F53\u9A8C\uFF0C\u5E26\u89C2\u4F17\u6C89\u6D78\u5F0F\u4F53\u9A8C",
    event: "\u6D3B\u52A8\u9884\u544A\uFF0C\u8282\u65E5\u4FC3\u9500\u4FE1\u606F\u5C55\u793A\uFF0C\u559C\u5E86\u6C1B\u56F4",
    newdish: "\u65B0\u54C1\u53D1\u5E03\uFF0C\u65B0\u54C1\u63A8\u8350\u4ECB\u7ECD\uFF0C\u6FC0\u53D1\u987E\u5BA2\u8D2D\u4E70\u6B32",
  };
  let prompt = tpl[template] || tpl.dish;
  prompt += "\uFF0C\u9002\u5408" + platform;
  if (script) prompt += "\uFF0C\u914D\u97F3\u5185\u5BB9\uFF1A" + script.substring(0, 200);
  return prompt;
}
