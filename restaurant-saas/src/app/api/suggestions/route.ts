import { NextResponse } from "next/server";
import { generateSuggestions } from "@/lib/ai/suggestion-engine";

/**
 * GET /api/suggestions
 * 获取今日建议（四类聚合），按优先级排序。
 *
 * Query params:
 *   cuisine, city, stage — 用于内容创作建议的上下文
 *   pendingReviews, pendingCompliance — 待处理事项数量
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const ctx = {
      storeInfo: {
        name: searchParams.get("storeName") || undefined,
        cuisineType: searchParams.get("cuisine") || "火锅",
        city: searchParams.get("city") || undefined,
        dianpingUrl: searchParams.get("dianpingUrl") || undefined,
        xiaohongshuUrl: searchParams.get("xiaohongshuUrl") || undefined,
        douyinUrl: searchParams.get("douyinUrl") || undefined,
        brandAssets: searchParams.get("brandAssetsCount")
          ? new Array(parseInt(searchParams.get("brandAssetsCount")!)).fill({})
          : [],
        stage: searchParams.get("stage") || "early",
        createdAt: searchParams.get("createdAt") || undefined,
      },
      pendingReviewCount: parseInt(searchParams.get("pendingReviews") || "0"),
      pendingComplianceCount: parseInt(searchParams.get("pendingCompliance") || "0"),
    };

    const suggestions = generateSuggestions(ctx);

    return NextResponse.json({
      suggestions,
      total: suggestions.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
