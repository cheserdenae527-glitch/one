import { NextResponse } from "next/server";
import { fetchAllHotContent } from "@/lib/ai/hot-content-engine";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") || "all";
  const cuisine = searchParams.get("cuisine") || "all";
  const city = searchParams.get("city") || "全国";
  const preferAnalyzed = searchParams.get("preferAnalyzed") !== "false";
  const limit = parseInt(searchParams.get("limit") || "30", 10);

  const result = await fetchAllHotContent({ platform, cuisine, city, preferAnalyzed, limit });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  try {
    const { title, platform, url, likesCount, cuisineType, briefContent, city, storeName, keywords } = await request.json();
    if (!title || !platform || !url) return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    const { addUserLink } = await import("@/lib/ai/hot-content-storage");
    const userId = request.headers.get("x-user-id") || "anonymous";
    const link = addUserLink(userId, url, {
      title,
      platform,
      likesCount: likesCount || 0,
      storeInfo: storeName || "",
      keywords: keywords || [],
    });
    return NextResponse.json({ success: true, link });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
