import { NextResponse } from "next/server";
import { runComplianceCheck, checkForbiddenWords, applyAIGCDisclaimer, containsAIGCDisclaimer } from "@/services/compliance";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, contentType, platform } = body;

    if (!content) {
      return NextResponse.json({ error: "缺少内容" }, { status: 400 });
    }

    const result = runComplianceCheck(
      content,
      contentType || "social_post",
      platform || "xiaohongshu",
    );

    // If the content passed but is missing AIGC disclaimer, auto-apply it
    if (result.passed && !result.hasAIGCDisclaimer) {
      const withDisclaimer = applyAIGCDisclaimer(content, platform || "xiaohongshu");
      result.hasAIGCDisclaimer = true;
      return NextResponse.json({ ...result, contentWithDisclaimer: withDisclaimer });
    }

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "审核失败" }, { status: 500 });
  }
}
