 import { NextResponse } from "next/server";
 
 const SEEDREAM_API = "https://api.volcengine.com/seedream/v1/generate";
 
 export async function POST(request: Request) {
   const { preset, variant, platform, text } = await request.json();
 
   const apiKey = process.env.VOLC_ACCESS_KEY;
   if (!apiKey) {
     return NextResponse.json(
       { images: [`https://placehold.co/400x400/e2e8f0/64748b?text=${preset}-${variant}\n${platform}\n${text || ""}`] }
     );
   }
 
   try {
     const prompt = buildPrompt(preset, variant, platform, text);
     const res = await fetch(SEEDREAM_API, {
       method: "POST",
       headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
       body: JSON.stringify({
         prompt,
         size: getSize(platform),
         n: 2,
         style: variant,
       }),
     });
     const data = await res.json();
     return NextResponse.json({ images: data.images || [] });
   } catch {
     return NextResponse.json(
       { images: [] },
       { status: 500 }
     );
   }
 }
 
 function getSize(platform: string): string {
   const sizes: Record<string, string> = {
     dianping: "1080x1080",
     xiaohongshu: "1080x1440",
     douyin: "1080x1920",
   };
   return sizes[platform] || "1080x1080";
 }
 
 function buildPrompt(preset: string, variant: string, platform: string, text: string): string {
   let p = `餐厅美食摄影，${variant}风格，`;
   const presets: Record<string, string> = {
     dish: "菜品特写展示，突出食材质感和摆盘精致度",
     poster: "店铺活动宣传海报设计，吸引顾客注意",
     cover: "社交媒体封面图设计，简洁美观有食欲",
     menu: "菜单推荐菜品展示图，精致美食摄影",
     event: "节日促销活动视觉设计，喜庆氛围感",
   };
   p += presets[preset] || "";
   if (text) p += `，图上文字：${text}`;
   return p;
 }
