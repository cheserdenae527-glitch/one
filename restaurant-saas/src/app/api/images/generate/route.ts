import { NextResponse } from "next/server";
const VOLC_API = process.env.VOLC_API_ENDPOINT || "https://ark.cn-beijing.volces.com/api/v3/responses";

export async function POST(request: Request) {
  const { preset, variant, platform, text } = await request.json();
  const apiKey = process.env.VOLC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ images: placeholders(preset, variant, platform, text) });
  }

  try {
    const prompt = buildImagePrompt(preset, variant, platform, text);
    const res = await fetch(VOLC_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.VOLC_MODEL || "doubao-seed-2-0-lite-260428",
        input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      }),
    });
    const data = await res.json();
    return NextResponse.json({ images: extractImages(data) || placeholders(preset, variant, platform, text) });
  } catch {
    return NextResponse.json({ images: placeholders(preset, variant, platform, text) });
  }
}

function placeholders(preset: string, variant: string, platform: string, text: string): string[] {
  return [
    "https://placehold.co/400x400/e2e8f0/64748b?text=" + preset + "-" + variant + "%0A" + platform,
    "https://placehold.co/400x400/fef3c7/92400e?text=" + (text || "generate sample"),
  ];
}

function extractImages(data: any): string[] {
  if (!data?.output?.choices) return [];
  const urls: string[] = [];
  for (const choice of data.output.choices) {
    if (typeof choice.message?.content === "string") {
      const found = choice.message.content.match(/https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|webp)/gi);
      if (found) urls.push(...found);
    }
  }
  return urls;
}

function buildImagePrompt(preset: string, variant: string, platform: string, text: string): string {
  const descs: Record<string, string> = {
    dish: "generate a restaurant dish photo, highlighting food texture and plating",
    poster: "generate a restaurant promotional poster, visually striking",
    cover: "generate a social media cover image, clean and appetizing",
    menu: "generate a menu recommendation dish photo, fine dining style",
    event: "generate a holiday promotional visual, festive atmosphere",
  };
  let p = (descs[preset] || descs.dish) + ", " + variant + " style";
  if (text) p += ", show text on image: " + text;
  return p;
}
