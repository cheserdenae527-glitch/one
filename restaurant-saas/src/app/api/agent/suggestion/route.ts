import { NextResponse } from "next/server";
import { runAgentPipeline } from "@/lib/agent";

/**
 * GET /api/agent/suggestion
 *
 * 获取 Agent 每日运营建议。
 * 在开发/演示模式下使用固定 merchantId "demo-merchant"，
 * 生产环境应从 session 中获取真实 merchantId。
 *
 * 返回: { suggestion: DailyAgentSuggestion | null, fromCache: boolean, stage: string }
 */
export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];
    // Demo mode: use fixed merchant ID
    // Production: extract from auth session
    const merchantId = "demo-merchant";

    const result = await runAgentPipeline({ merchantId, date: today });

    return NextResponse.json({
      suggestion: result.suggestion,
      fromCache: result.fromCache,
      stage: result.stage,
    });
  } catch (error) {
    console.error("Agent pipeline error:", error);
    // Graceful degradation — return null suggestion
    return NextResponse.json({
      suggestion: null,
      fromCache: false,
      stage: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
