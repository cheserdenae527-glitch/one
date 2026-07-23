import { callLLM } from "@/lib/ai/client";
import type { StoreInfo, BrandPersona } from "@/types";
import type { TrendAnalysisResult, MerchantMatchedAnalysis } from "./types";

// 品类匹配（规则计算）
function matchCuisine(storeCuisine: string, postCuisine: string): number {
  if (!storeCuisine || !postCuisine) return 50;
  const s = storeCuisine.toLowerCase();
  const p = postCuisine.toLowerCase();
  if (s === p) return 100;
  // Same broader category (e.g., 火锅→串串)
  const categoryGroups: Record<string, string[]> = {
    "hotpot": ["火锅", "串串", "麻辣烫", "冒菜"],
    "bbq": ["烧烤", "烤肉", "铁板烧"],
    "noodle": ["面食", "粉", "米线"],
    "rice": ["米饭", "快餐", "简餐"],
    "drink": ["奶茶", "咖啡", "饮品"],
    "japanese": ["日料", "寿司", "刺身"],
    "western": ["西餐", "牛排", "意面"],
  };
  for (const [, items] of Object.entries(categoryGroups)) {
    if (items.some(i => s.includes(i) || i.includes(s)) &&
        items.some(i => p.includes(i) || i.includes(p))) {
      return 70;
    }
  }
  return 20;
}

// 客单价匹配（规则计算）
function matchPriceRange(storePrice: string, postPriceHint: string): number {
  if (!storePrice) return 50;
  // Parse store price range (e.g., "80" or "60-100")
  const storeMatch = storePrice.match(/(\d+)/);
  if (!storeMatch) return 50;
  const storeAvg = parseInt(storeMatch[1]);

  // Parse post price hint (e.g., "人均80" or "人均60-100")
  const postMatch = postPriceHint.match(/(\d+)/);
  if (!postMatch) return 70; // No price info in post → neutral
  const postAvg = parseInt(postMatch[1]);

  const ratio = Math.min(storeAvg, postAvg) / Math.max(storeAvg, postAvg);
  if (ratio >= 0.8) return 100;
  if (ratio >= 0.6) return 70;
  if (ratio >= 0.4) return 40;
  return 20;
}

// 人设契合度（LLM 打分，仅当商家已设置人设时）
async function matchPersona(storePersona: BrandPersona | undefined | null, postContent: string): Promise<number> {
  if (!storePersona?.tone) return 50; // 未设置人设 → 中性值
  const prompt = `比较以下店铺人设和内容语气的契合度（0-100）：
店铺人设定位：${storePersona.position}
语气风格：${storePersona.tone}
内容方向：${storePersona.contentDirections?.join("、") || ""}

目标内容的语气：
${postContent.substring(0, 500)}

只返回一个 0-100 的数字，不要包含其他文字。`;
  try {
    const result = await callLLM(prompt, 100);
    const score = parseInt(result.trim());
    return isNaN(score) ? 50 : Math.max(0, Math.min(100, score));
  } catch {
    return 50;
  }
}

// 商圈匹配（规则计算）
function matchDistrict(storeAddress: string, postLocation: string): number {
  if (!storeAddress) return 50;
  const s = storeAddress.toLowerCase();
  const p = (postLocation || "").toLowerCase();
  if (!p) return 70; // No location in post → neutral
  // Simple tiered matching
  if (s.includes(p) || p.includes(s)) return 100; // Same district
  // Extract city level
  const cityRegex = /(.+?(?:市|区|县|城))/;
  const storeCity = s.match(cityRegex)?.[1];
  const postCity = p.match(cityRegex)?.[1];
  if (storeCity && postCity && storeCity === postCity) return 60; // Same city
  if (storeCity && postCity) return 30; // Different city, same province
  return 0; // Different province
}

export async function matchTrendToMerchant(
  analysis: TrendAnalysisResult,
  storeInfo: StoreInfo,
  persona?: BrandPersona | null
): Promise<MerchantMatchedAnalysis> {
  const cuisineScore = matchCuisine(storeInfo.cuisineType || "", analysis.topic.primaryCategory);
  const priceScore = matchPriceRange(storeInfo.priceRange || "", analysis.toneAndKeywords.keywords.join("、"));
  const personaScore = await matchPersona(persona, analysis.toneAndKeywords.tone);
  const districtScore = matchDistrict(storeInfo.address || "", analysis.postInfo.platform);

  // Weighted total
  const overallScore = Math.round(
    cuisineScore * 0.30 + priceScore * 0.20 + personaScore * 0.30 + districtScore * 0.20
  );

  const matchReasons: string[] = [];
  const warnings: string[] = [];
  if (cuisineScore >= 70) matchReasons.push(`品类匹配度高（${cuisineScore}分）`);
  if (priceScore >= 70) matchReasons.push(`客单价区间接近`);
  if (personaScore >= 70) matchReasons.push(`人设风格契合`);
  if (districtScore >= 70) matchReasons.push(`同城/同商圈`);
  if (cuisineScore < 40) warnings.push("品类差异较大，需要调整切入角度");
  if (priceScore < 40) warnings.push("客单价差距大，注意不要照搬价位表达");

  return {
    relevanceToYou: {
      score: overallScore,
      matchReason: matchReasons.length > 0 ? matchReasons.join("；") : "匹配度一般，建议参考结构而非内容",
      mismatchWarning: warnings.join("；") || undefined,
    },
    howToAdapt: [
      {
        element: "切入角度",
        original: analysis.topic.angle,
        adapted: analysis.topic.replayable
          ? `用${storeInfo.name || "本店"}的特色替换，保留${analysis.topic.angle}结构`
          : analysis.topic.angle,
        why: analysis.topic.replayHint || "根据你的品类和人设调整",
      },
    ],
    actionPriority: overallScore >= 70 ? "high" : overallScore >= 40 ? "medium" : "low",
    suggestedAction: overallScore >= 60
      ? "建议参考这篇内容的框架，结合你的店铺特色生成一篇类似内容"
      : "这篇内容的匹配度一般，建议参考其结构思路，但内容和角度需要较大调整",
  };
}
