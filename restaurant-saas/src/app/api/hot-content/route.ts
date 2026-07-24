import { NextResponse } from "next/server";
import { fetchAllHotContent } from "@/lib/ai/hot-content-engine";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") || "all";
  const result = await fetchAllHotContent();
  let items = result.items;
  if (platform !== "all") items = items.filter(i => i.platform === platform);
  return NextResponse.json({ ...result, items });
}

export async function POST(request: Request) {
  try {
    const { title, platform, url, likesCount, cuisineType, briefContent } = await request.json();
    if (!title || !platform || !url) return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    const { addUserContent } = await import("@/lib/ai/hot-content-engine");
    addUserContent({
      id: "new_" + Date.now(), title, platform,
      url, likesCount: likesCount || 0, publishTime: new Date().toISOString().slice(0,10), contentType: "text", cuisineType: cuisineType || "",
      briefContent: briefContent || "", hotScore: 0.5,
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}