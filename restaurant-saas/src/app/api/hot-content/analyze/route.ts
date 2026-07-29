import { NextResponse } from "next/server";
import { callLLM } from "@/lib/ai/client";
import { updateItemAnalysis } from "@/lib/ai/hot-content-storage";
import { selectTemplates } from "@/lib/ai/template-matcher";
import { SEED_TEMPLATES } from "@/lib/ai/template-seeds";

export async function POST(request: Request) {
  try {
    const item = await request.json();
    if (!item?.title && !item?.url) return NextResponse.json({ error: "缺少标题或链接" }, { status: 400 });
    const p = `分析以下餐饮热门内容的文案结构特征，以JSON格式输出（只输出JSON，不要额外说明）：

标题：${item.title || ""}
内容摘要：${item.briefContent || ""}
平台：${item.platform || ""}

输出字段：
{
  "writingStyle": "文案风格描述",
  "hookType": "钩子类型（问题式/悬念式/直白式/故事式/对比式）",
  "structure": ["内容结构步骤"],
  "toneTags": ["语气标签"],
  "angleName": "切入角度名称（如横评对比/口碑推荐/单品深挖/场景打卡/真实体验/故事叙述/好奇引流/节日营销/优惠引流/情感共鸣）",
  "formatName": "体裁名称（如单篇详评/列表体/合集体/脚本体/口播体/海报体/通知体/测评体/故事体/攻略体/教程体/揭秘体）",
  "visualStyle": "视觉风格描述（选填）",
  "promptTemplate": "可复用的提示词模板"
}`;
    const result = await callLLM(p, 2048);
    const cleaned = result
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    let analysis: any;
    try {
      analysis = JSON.parse(cleaned);
    } catch {
      analysis = {
        writingStyle: cleaned,
        hookType: "",
        structure: [],
        toneTags: [],
        angleName: "",
        formatName: "",
        promptTemplate: "",
      };
    }

    // Persist analysis back to storage if this item has an id
    if (item.id) {
      updateItemAnalysis(item.id, analysis);
    }

    // ── 8.3 模板匹配：将分析结果送入模板引擎 ──
    const matchResult = selectTemplates(
      {
        cuisine: item.cuisineType || "all",
        platform: item.platform || "all",
        stage: item.stage || "growth",
        recentAngles: [],
        personaTone: analysis?.toneTags?.[0],
      },
      SEED_TEMPLATES,
    );

    return NextResponse.json({
      success: true,
      analysis,
      candidates: matchResult.candidates,
      selectedTemplate: matchResult.selected,
      debug: matchResult.debug,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "分析失败" }, { status: 500 });
  }
}
