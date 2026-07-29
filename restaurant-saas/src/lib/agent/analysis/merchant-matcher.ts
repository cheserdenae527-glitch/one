import { callLLM } from "@/lib/ai/client";
import type { StoreInfo, BrandPersona } from "@/types";
import type {
  TrendAnalysisResult,
  MerchantMatchedAnalysis,
  MatchDimensionBreakdown,
  MerchantPlatformBindings,
} from "./types";
import {
  PLATFORM_ALIAS,
  CUISINE_GROUPS,
  STAGE_CONTENT_PREFERENCES,
  MATCH_DIMENSION_WEIGHTS,
} from "./types";

// ──────────────────────────────────────────────
// 1. 品类匹配
// ──────────────────────────────────────────────
function matchCuisine(storeCuisine: string, postCuisine: string): { score: number; detail: string } {
  if (!storeCuisine || !postCuisine) {
    return { score: 50, detail: storeCuisine ? "帖子未标注品类" : "店铺未填写品类" };
  }
  const s = storeCuisine.toLowerCase();
  const p = postCuisine.toLowerCase();

  // 精确匹配
  if (s === p) return { score: 100, detail: `品类完全一致（${storeCuisine}）` };
  if (s.includes(p) || p.includes(s)) return { score: 90, detail: `品类包含匹配（${storeCuisine} ↔ ${postCuisine}）` };

  // 同组匹配
  for (const [, items] of Object.entries(CUISINE_GROUPS)) {
    const sInGroup = items.some(i => s.includes(i) || i.includes(s));
    const pInGroup = items.some(i => p.includes(i) || i.includes(p));
    if (sInGroup && pInGroup) {
      return { score: 70, detail: `同品类组（如 ${items[0]} 类）` };
    }
  }

  return { score: 20, detail: `品类差异较大（${storeCuisine} vs ${postCuisine}）` };
}

// ──────────────────────────────────────────────
// 2. 客单价匹配
// ──────────────────────────────────────────────
function matchPrice(storePrice: string | undefined | null, postPriceHint: string): { score: number; detail: string } {
  if (!storePrice) return { score: 50, detail: "店铺未填写客单价" };

  const storeMatch = storePrice.match(/(\d+)/);
  if (!storeMatch) return { score: 50, detail: "店铺客单价格式无法解析" };
  const storeAvg = parseInt(storeMatch[1]);

  const postMatch = postPriceHint.match(/(\d+)/);
  if (!postMatch) return { score: 70, detail: "帖子未提供具体价位，取中性值" };
  const postAvg = parseInt(postMatch[1]);

  const ratio = Math.min(storeAvg, postAvg) / Math.max(storeAvg, postAvg);
  if (ratio >= 0.8) return { score: 100, detail: `客单价接近（店铺${storeAvg} vs 帖子${postAvg}）` };
  if (ratio >= 0.6) return { score: 70, detail: `客单价适中（比率 ${ratio.toFixed(2)}）` };
  if (ratio >= 0.4) return { score: 40, detail: `客单价差距较大（比率 ${ratio.toFixed(2)}）` };
  return { score: 20, detail: `客单价差距悬殊（比率 ${ratio.toFixed(2)}）` };
}

// ──────────────────────────────────────────────
// 3. 地理位置匹配
// ──────────────────────────────────────────────
function matchLocation(
  storeCity: string | undefined | null,
  storeAddress: string | undefined | null,
  postLocation: string | undefined | null,
): { score: number; detail: string } {
  const s = (storeCity || storeAddress || "").toLowerCase();
  if (!s) return { score: 50, detail: "店铺未填写城市/地址信息" };

  const p = (postLocation || "").toLowerCase();
  if (!p) return { score: 70, detail: "帖子未标注地点，无法精确匹配" };

  // 精确城市匹配（提取"XX市"类名称）
  const cityExtract = (text: string): string | null => {
    const match = text.match(/(.+?(?:市|区|县|城))/);
    return match ? match[1] : null;
  };
  const storeCityName = cityExtract(s);
  const postCityName = cityExtract(p);

  if (storeCityName && postCityName) {
    if (storeCityName === postCityName) return { score: 100, detail: `同城市（${storeCityName}）` };
    const provinceExtract = (city: string): string | null => {
      const match = city.match(/(.+?(?:省|自治区|特别行政区))/);
      return match ? match[1] : null;
    };
    const storeProvince = provinceExtract(s);
    const postProvince = provinceExtract(p);
    if (storeProvince && postProvince && storeProvince === postProvince) {
      return { score: 60, detail: `同省份不同城市（${storeCityName} vs ${postCityName}）` };
    }
    return { score: 30, detail: `不同城市（${storeCityName} vs ${postCityName}）` };
  }

  // 帖子可能只说"成都"不带"市"后缀 → 用城市核心名匹配
  const cityCore = (text: string): string | null => {
    const m = text.match(/^(.+?)市$/);
    return m ? m[1] : null;
  };
  const storeCore = cityCore(s.trim());
  if (storeCore && p.includes(storeCore)) {
    return { score: 90, detail: `帖子提及同城市（${storeCore}）` };
  }

  // 近似匹配：地址文本包含关系
  if (s.includes(p) || p.includes(s)) return { score: 80, detail: "地址文本存在包含关系" };

  return { score: 20, detail: "地理位置不相关" };
}

// ──────────────────────────────────────────────
// 4. 人设匹配（LLM）
// ──────────────────────────────────────────────
async function matchPersona(
  storePersona: BrandPersona | undefined | null,
  postTone: string,
  postContent: string,
): Promise<{ score: number; detail: string }> {
  if (!storePersona?.tone) {
    return { score: 50, detail: "商家未设置人设，取中性值" };
  }

  const prompt = `你是一位品牌匹配分析师。比较以下店铺人设和内容语气的契合度（0-100）：

店铺人设定位：${storePersona.position || "未设置"}
语气风格：${storePersona.tone}
内容方向：${storePersona.contentDirections?.join("、") || "未设置"}

目标内容的语气：${postTone}
目标内容摘要：${postContent.substring(0, 300)}

评估维度：
1. 语气契合度（店铺语气 vs 内容语气）：0-100
2. 内容方向契合度（店铺内容方向 vs 内容话题）：0-100

只返回一个 0-100 的综合数字，不要包含其他文字。`;

  try {
    const result = await callLLM(prompt, 100);
    const score = parseInt(result.trim());
    const validScore = isNaN(score) ? 50 : Math.max(0, Math.min(100, score));

    let detail: string;
    if (validScore >= 80) detail = "人设高度契合";
    else if (validScore >= 60) detail = "人设较为契合";
    else if (validScore >= 40) detail = "人设契合度一般";
    else detail = "人设风格差异较大";

    return { score: validScore, detail };
  } catch {
    return { score: 50, detail: "LLM 调用失败，取中性值" };
  }
}

// ──────────────────────────────────────────────
// 5. 平台匹配
// ──────────────────────────────────────────────
function matchPlatform(
  storeInfo: StoreInfo,
  contentPlatform: string,
): { score: number; detail: string } {
  const resolvedPlatform = PLATFORM_ALIAS[contentPlatform] || contentPlatform.toLowerCase();

  const boundPlatforms = buildPlatformBindings(storeInfo);
  const isBound = Object.entries(boundPlatforms)
    .filter(([, v]) => v)
    .some(([k]) => k === resolvedPlatform);

  if (isBound) {
    return { score: 100, detail: `商家已绑定 ${contentPlatform} 账号` };
  }

  // 未绑定但平台相关：检查商家是否有任何绑定
  const anyBound = Object.values(boundPlatforms).some(Boolean);
  if (!anyBound) {
    return { score: 60, detail: "商家暂未绑定任何平台" };
  }

  return { score: 40, detail: `商家未绑定 ${contentPlatform}` };
}

/** 从 StoreInfo 提取平台绑定状态 */
function buildPlatformBindings(storeInfo: StoreInfo): MerchantPlatformBindings {
  return {
    dianping: Boolean(storeInfo.dianpingUrl),
    xiaohongshu: Boolean(storeInfo.xiaohongshuUrl),
    douyin: Boolean(storeInfo.douyinUrl),
  };
}

// ──────────────────────────────────────────────
// 6. 账号阶段匹配
// ──────────────────────────────────────────────
function matchStage(
  accountStage: string,
  analysis: TrendAnalysisResult,
): { score: number; detail: string } {
  const stage = accountStage || "new";
  const preferredAngles = STAGE_CONTENT_PREFERENCES[stage] || STAGE_CONTENT_PREFERENCES.new;

  // 检查帖子角度是否匹配当前阶段偏好
  const postAngle = analysis.topic.angle.toLowerCase();
  const isPreferable = preferredAngles.some(a => postAngle.includes(a) || a.includes(postAngle));

  if (isPreferable) {
    return {
      score: 100,
      detail: `内容角度适合${stage === "new" ? "新建" : stage === "growing" ? "成长" : "成熟"}期商家`,
    };
  }

  // 阶段不偏好但也不冲突：中性分
  return {
    score: 60,
    detail: `内容角度与${stage === "new" ? "新建" : stage === "growing" ? "成长" : "成熟"}期商家偏好不完全匹配`,
  };
}

// ──────────────────────────────────────────────
// 主匹配函数
// ──────────────────────────────────────────────

/**
 * 将一条已分析的热门帖子内容匹配到商家信息，输出 6 维匹配结果。
 *
 * 与 matchTrendToMerchant 的区别：
 * - matchTrendToMerchant：原版函数，保持签名兼容
 * - matchContentToMerchant：完整版，含 breakdown 明细
 * - rankTrendsForMerchant：批量版，对多条内容排序
 */
export async function matchContentToMerchant(
  analysis: TrendAnalysisResult,
  storeInfo: StoreInfo,
  persona?: BrandPersona | null,
): Promise<MerchantMatchedAnalysis> {
  // 计算各维度
  const cuisineResult = matchCuisine(storeInfo.cuisineType || "", analysis.topic.primaryCategory);
  const priceResult = matchPrice(storeInfo.priceRange, analysis.toneAndKeywords.keywords.join("、"));
  const locationResult = matchLocation(
    storeInfo.city,
    storeInfo.address,
    // 当前 TrendAnalysisResult 没有独立 location 字段，从标题/关键词里尝试提取
    [analysis.postInfo.title, ...analysis.toneAndKeywords.keywords].join(" "),
  );
  const personaResult = await matchPersona(persona, analysis.toneAndKeywords.tone, analysis.toneAndKeywords.tone);
  const platformResult = matchPlatform(storeInfo, analysis.postInfo.platform);
  const stageResult = matchStage(storeInfo.accountStage, analysis);

  // 汇总加权得分
  const breakdown: MatchDimensionBreakdown = {
    cuisine: { score: cuisineResult.score, weight: MATCH_DIMENSION_WEIGHTS.cuisine, detail: cuisineResult.detail },
    price: { score: priceResult.score, weight: MATCH_DIMENSION_WEIGHTS.price, detail: priceResult.detail },
    location: { score: locationResult.score, weight: MATCH_DIMENSION_WEIGHTS.location, detail: locationResult.detail },
    persona: { score: personaResult.score, weight: MATCH_DIMENSION_WEIGHTS.persona, detail: personaResult.detail },
    platform: { score: platformResult.score, weight: MATCH_DIMENSION_WEIGHTS.platform, detail: platformResult.detail },
    stage: { score: stageResult.score, weight: MATCH_DIMENSION_WEIGHTS.stage, detail: stageResult.detail },
  };

  const overallScore = Math.round(
    cuisineResult.score * MATCH_DIMENSION_WEIGHTS.cuisine +
    priceResult.score * MATCH_DIMENSION_WEIGHTS.price +
    locationResult.score * MATCH_DIMENSION_WEIGHTS.location +
    personaResult.score * MATCH_DIMENSION_WEIGHTS.persona +
    platformResult.score * MATCH_DIMENSION_WEIGHTS.platform +
    stageResult.score * MATCH_DIMENSION_WEIGHTS.stage,
  );

  // 生成可读解释
  const matchReasons: string[] = [];
  const warnings: string[] = [];

  if (cuisineResult.score >= 70) matchReasons.push(`品类匹配（${cuisineResult.score}分）`);
  if (priceResult.score >= 70) matchReasons.push("客单价接近");
  if (locationResult.score >= 70) matchReasons.push("同城/同区域");
  if (personaResult.score >= 70) matchReasons.push("人设契合");
  if (platformResult.score >= 70) matchReasons.push("平台匹配");

  if (cuisineResult.score < 40) warnings.push("品类差异大，需调整切入角度");
  if (priceResult.score < 40) warnings.push("客单价差距大，注意价位表达");
  if (locationResult.score < 40) warnings.push("异地内容，建议本地化改造");
  if (platformResult.score < 40) warnings.push(`商家未布局 ${analysis.postInfo.platform}`);

  // 推荐平台
  const boundPlatforms = buildPlatformBindings(storeInfo);
  const activePlatforms = Object.entries(boundPlatforms)
    .filter(([, v]) => v)
    .map(([k]) => k);

  let suggestedPlatform: "dianping" | "xiaohongshu" | "douyin" | undefined;
  let platformReason = "";
  if (activePlatforms.length > 0) {
    // 推荐绑定且与内容平台最匹配的平台
    const contentPlatformKey = PLATFORM_ALIAS[analysis.postInfo.platform] || analysis.postInfo.platform.toLowerCase();
    if (boundPlatforms[contentPlatformKey as keyof MerchantPlatformBindings]) {
      suggestedPlatform = contentPlatformKey as "dianping" | "xiaohongshu" | "douyin";
      platformReason = `商家已绑定该内容所在平台（${analysis.postInfo.platform}）`;
    } else {
      // 取第一个绑定的平台
      suggestedPlatform = activePlatforms[0] as "dianping" | "xiaohongshu" | "douyin";
      platformReason = `虽然内容来自 ${analysis.postInfo.platform}，但商家未绑定该平台`;
    }
  }

  // 生成适应建议
  const adaptations: Array<{
    element: string;
    original: string;
    adapted: string;
    why: string;
  }> = [];

  adaptations.push({
    element: "切入角度",
    original: analysis.topic.angle,
    adapted: analysis.topic.replayable
      ? `用${storeInfo.name || "本店"}的特色替换，保留${analysis.topic.angle}结构`
      : `参考${analysis.topic.angle}的框架，按店铺特色调整`,
    why: analysis.topic.replayHint || "根据品类和阶段调整",
  });

  if (cuisineResult.score < 70) {
    adaptations.push({
      element: "品类表达",
      original: analysis.topic.primaryCategory,
      adapted: `${storeInfo.cuisineType || "本店品类"}角度切入`,
      why: "品类不同，需替换核心品类关键词",
    });
  }

  if (locationResult.score < 70) {
    adaptations.push({
      element: "地理位置",
      original: "原文地点",
      adapted: `${storeInfo.city || storeInfo.address?.slice(0, 10) || "本地"}相关背景`,
      why: "异地内容需要本地化改造才能有效",
    });
  }

  // 判断优先级
  let actionPriority: "high" | "medium" | "low";
  let suggestedAction: string;

  if (overallScore >= 70) {
    actionPriority = "high";
    suggestedAction = `强烈推荐参考。${matchReasons.join("，")}。建议直接使用其框架生成类似内容。`;
  } else if (overallScore >= 45) {
    actionPriority = "medium";
    suggestedAction = `可参考。匹配度中等，建议参考结构思路，但内容和角度需要适当调整（${warnings.slice(0, 2).join("；")}）。`;
  } else {
    actionPriority = "low";
    suggestedAction = "匹配度较低，建议仅参考其叙事结构和互动技巧，不直接模仿内容方向。";
  }

  return {
    relevanceToYou: {
      score: overallScore,
      breakdown,
      matchReason: matchReasons.length > 0
        ? matchReasons.join("；")
        : "未发现强匹配维度，建议参考结构而非内容",
      mismatchWarning: warnings.length > 0 ? warnings.join("；") : undefined,
    },
    howToAdapt: adaptations,
    actionPriority,
    suggestedAction,
    ...(suggestedPlatform ? {
      platformSpecificity: {
        suggestedPlatform,
        reason: platformReason,
      },
    } : {}),
  };
}

// ──────────────────────────────────────────────
// 批量匹配：对多条内容按商家匹配度排序
// ──────────────────────────────────────────────

export interface RankedTrendItem {
  analysis: TrendAnalysisResult;
  match: MerchantMatchedAnalysis;
}

/**
 * 对多条热门内容按与商家的匹配度排序（高→低），
 * 用于"哪些热门内容适合我"的场景。
 */
export async function rankTrendsForMerchant(
  analyses: TrendAnalysisResult[],
  storeInfo: StoreInfo,
  persona?: BrandPersona | null,
): Promise<RankedTrendItem[]> {
  const results = await Promise.all(
    analyses.map(async (analysis) => {
      const match = await matchContentToMerchant(analysis, storeInfo, persona);
      return { analysis, match };
    }),
  );

  // 按匹配分降序排列
  results.sort((a, b) => b.match.relevanceToYou.score - a.match.relevanceToYou.score);
  return results;
}

// ──────────────────────────────────────────────
// 原版兼容函数
// ──────────────────────────────────────────────

/**
 * @deprecated 请使用 matchContentToMerchant（它包含完整的 breakdown 明细）
 */
export async function matchTrendToMerchant(
  analysis: TrendAnalysisResult,
  storeInfo: StoreInfo,
  persona?: BrandPersona | null,
): Promise<MerchantMatchedAnalysis> {
  return matchContentToMerchant(analysis, storeInfo, persona);
}

