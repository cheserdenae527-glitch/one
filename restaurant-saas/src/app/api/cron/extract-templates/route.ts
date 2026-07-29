import { NextResponse } from "next/server";
import { getAllHotContent } from "@/lib/ai/hot-content-storage";
import { callLLM } from "@/lib/ai/client";
import { SEED_TEMPLATES } from "@/lib/ai/template-seeds";
import { Template } from "@/lib/ai/template-types";

function generateId(): string {
  return "tpl_" + String(SEED_TEMPLATES.length + Date.now()).slice(0, 15);
}

export async function GET() {
  try {
    const allContents = getAllHotContent();
    // Only process items that already have analysis (from 6.2 preview or prev runs)
    const withAnalysis = allContents.filter((c) => c.analysis);
    // Process items without analysis: analyze a batch (max 5 per run to limit cost)
    const withoutAnalysis = allContents
      .filter((c) => !c.analysis)
      .slice(0, 5);

    let newAnalyzed = 0;
    for (const item of withoutAnalysis) {
      try {
        const p = `分析以下餐饮内容的文案结构特征，以JSON格式输出：
标题：${item.title || ""}
内容：${item.briefContent || ""}
平台：${item.platform || ""}
输出JSON字段：writingStyle, hookType, structure[], toneTags[], angleName, formatName, promptTemplate`;
        const result = await callLLM(p, 1024);
        const cleaned = result.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        const analysis = JSON.parse(cleaned);
        item.analysis = analysis;
        newAnalyzed++;
        // Small delay to avoid rate limits
        await new Promise((r) => setTimeout(r, 200));
      } catch {
        /* skip failed analyses */
      }
    }

    // ── Dedup & cluster into templates (8.2 step 3-4) ──
    const clusters = new Map<string, { items: typeof allContents; analysis: any }>();

    for (const item of withAnalysis) {
      if (!item.analysis) continue;
      const key = item.analysis.angleName || item.analysis.writingStyle || "unknown";
      if (!clusters.has(key)) {
        clusters.set(key, { items: [], analysis: item.analysis });
      }
      clusters.get(key)!.items.push(item);
    }

    // Also cluster newly analyzed items
    for (const item of withoutAnalysis) {
      if (!item.analysis) continue;
      const key = item.analysis.angleName || item.analysis.writingStyle || "unknown";
      if (!clusters.has(key)) {
        clusters.set(key, { items: [], analysis: item.analysis });
      }
      clusters.get(key)!.items.push(item);
    }

    // ── Generate new templates from clusters ──
    const existingNames = new Set(SEED_TEMPLATES.map((t) => t.name));
    let newTemplates = 0;

    for (const [angleName, cluster] of Array.from(clusters.entries())) {
      // Skip if we already have a template with this angle name
      if (existingNames.has(angleName)) continue;
      // Skip clusters with insufficient data
      if (cluster.items.length < 2) continue;

      const bestItem = cluster.items.sort((a, b) => b.hotScore - a.hotScore)[0];
      if (!bestItem?.analysis) continue;

      const a = bestItem.analysis;
      const newTpl: Template = {
        id: generateId(),
        name: angleName,
        description: `从热门榜单提取：${a.writingStyle || ""}`,
        angle: angleName,
        format: a.formatName || "单篇详评",
        structure: a.structure || ["钩子", "主体", "总结"],
        hook: a.hookType || "直白式",
        tone: a.toneTags || ["亲切"],
        cuisines: ["all"],
        platforms: [bestItem.platform],
        stages: ["early", "growth", "mature"],
        promptTemplate: a.promptTemplate || "",
        weight: Math.min(Math.max(bestItem.hotScore / 1000, 0.3), 0.9),
        storeWeightOffsets: {},
        status: "active" as const,
        usageCount: 0,
        skipCount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      // In a real implementation this would persist to DB; here we just report
      newTemplates++;
      existingNames.add(angleName);
    }

    return NextResponse.json({
      processed: allContents.length,
      analyzed: withAnalysis.length,
      newAnalyzed,
      clustersFound: clusters.size,
      newTemplates,
      note: "Templates would be persisted to DB in production; seed templates used for matching",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
