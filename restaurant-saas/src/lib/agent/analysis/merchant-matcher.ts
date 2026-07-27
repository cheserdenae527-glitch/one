import { callLLM } from "@/lib/ai/client";
import type { StoreInfo, BrandPersona } from "@/types";
import type { TrendAnalysisResult, MerchantMatchedAnalysis } from "./types";

// 品类匹配（规则计算）
function matchCuisine(storeCuisine: string, postCuisine: string): number {
  if (!storeCuisine || !postCuisine) return 50;
  const s = storeCuisine.toLowerCase();
  const p = postCuisine.toLowerCase();
  if (s === p) return 100;
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
  const storeMatch = storePrice.match(/(\d+)/);
  if (!storeMatch) return 50;
  const storeAvg = parseInt(storeMatch[1]);

  const postMatch = postPriceHint.match(/(\d+)/);
  if (!postMatch) return 70;
  const postAvg = parseInt(postMatch[1]);

  const ratio = Math.min(storeAvg, postAvg) / Math.max(storeAvg, postAvg);
  if (ratio >= 0.8) return 100;
  if (ratio >= 0.6) return 70;
  if (ratio >= 0.4) return 40;
  return 20;
}

// 人设契合度（LLM 打分，仅当商家已设置人设时）
async function matchPersona(storePersona: BrandPersona | undefined | null, postContent: string): Promise<number> {
  if (!storePersona?.tone) return 50;
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
  if (!p) return 70; // 帖子没提地点 → 中性值
  if (s.includes(p) || p.includes(s)) return 100;
  const cityRegex = /(.+?(?:市|区|县|城))/;
  const storeCity = s.match(cityRegex)?.[1];
  const postCity = p.match(cityRegex)?.[1];
  if (storeCity && postCity && storeCity === postCity) return 60;
  if (storeCity && postCity) return 30;
  return 0;
}

export async function matchTrendToMerchant(
  analysis: TrendAnalysisResult,
  storeInfo: StoreInfo,
  persona?: BrandPersona | null
): Promise<MerchantMatchedAnalysis> {
  const cuisineScore = matchCuisine(storeInfo.cuisineType || "", analysis.topic.primaryCategory);
  const priceScore = matchPriceRange(storeInfo.priceRange || "", analysis.toneAndKeywords.keywords.join("、"));
  const personaScore = await matchPersona(persona, analysis.toneAndKeywords.tone);

  // 修复点：原来传的是 analysis.postInfo.platform（"小红书"这种平台名），
  // 商圈匹配函数期望的是地理位置文本，两者语义完全不同，算出来的分数没有意义。
  // TrendAnalysisResult 目前没有单独的 location 字段，暂时从帖子正文/标题里
  // 也提取不到可靠地址，所以这里先用中性值兜底，而不是继续传错误的参数。
  // TODO: 需要在 content-analyzer.ts 的 8 维分析里新增一个 location 字段
  // （比如从帖子标题/正文里提取"XX市XX区"），分析引擎升级后把下面这行换成
  // matchDistrict(storeInfo.address || "", analysis.postInfo.location || "")
  const districtScore = 70; // 中性值，明确标注这是临时兜底，不是"同城"的真实判断

  const overallScore = Math.round(
    cuisineScore * 0.30 + priceScore * 0.20 + personaScore * 0.30 + districtScore * 0.20
  );

  const matchReasons: string[] = [];
  const warnings: string[] = [];
  if (cuisineScore >= 70) matchReasons.push(`品类匹配度高（${cuisineScore}分）`);
  if (priceScore >= 70) matchReasons.push(`客单价区间接近`);
  if (personaScore >= 70) matchReasons.push(`人设风格契合`);
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
