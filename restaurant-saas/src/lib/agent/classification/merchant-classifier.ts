/**
 * ============================================================
 * 商家归类算法
 *
 * 规则驱动的分类引擎：根据商家注册信息，对 8 种战略类型
 * 逐一评分，选出最优匹配，返回完整分类结果。
 *
 * 特点：纯规则计算，不调用 LLM，速度快、结果可解释。
 * ============================================================
 */

import type { ClassificationInput, ClassificationDetail, ContentStrategyType } from "./types";
import { STRATEGY_LABELS, STRATEGY_CUISINE_PREFERENCES, STRATEGY_PRICE_PREFERENCES } from "./types";
import {
  CUISINE_CATEGORIES, inCategory,
  PRICE_TIERS, priceIn,
  STRATEGY_AUDIENCE_TAGS, AUDIENCE_KEYWORD_TAGS,
} from "./types";
import type { DouyinAudienceTag, AudienceTagResult } from "./types";
import { getStrategyTemplate } from "./strategy-templates";
import type { MerchantClassification } from "./types";

// ── 品类预处理 ───────────────────────────────

/** 品类分组（判定"社交类"、"快餐类"、"精致类"） */

function parsePrice(priceRange: string): number {
  const match = priceRange.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

// ── 各战略类型的评分函数 ─────────────────────

interface ScorerContext {
  city: string;
  cuisineType: string;
  priceRange: string;
  priceValue: number;
  targetCustomers: string;
  hasDianping: boolean;
  hasXiaohongshu: boolean;
  hasDouyin: boolean;
  accountStage: string;
}

const SCORERS: Record<ContentStrategyType, (ctx: ScorerContext) => { score: number; reasons: string[] }> = {

  // 1. 场景体验型
  scene_experience: (ctx) => {
    const reasons: string[] = [];
    let score = 0;

    // 品类匹配：社交类品类 +10~30
    if (inCategory(ctx.cuisineType, "social")) {
      score += 30;
      reasons.push("品类适合社交场景");
    } else if (inCategory(ctx.cuisineType, "refined")) {
      score += 15;
      reasons.push("品类有社交属性");
    }

    // 客单价匹配：中高客单价 +10~20
    if (priceIn(ctx.priceRange, "scene_experience_acceptable")) {
      score += 20;
      reasons.push("客单价适合社交聚餐场景");
    } else if (priceIn(ctx.priceRange, "value_for_money_mid")) {
      score += 10;
    }

    // 平台加分：有小红书 +10（场景内容天然适合种草）
    if (ctx.hasXiaohongshu) {
      score += 10;
      reasons.push("绑定了小红书，适合场景种草");
    }

    return { score, reasons };
  },

  // 2. 性价比引流型
  value_for_money: (ctx) => {
    const reasons: string[] = [];
    let score = 0;

    // 品类匹配：快餐类 +20
    if (inCategory(ctx.cuisineType, "fast")) {
      score += 25;
      reasons.push("品类适合性价比路线");
    }

    // 客单价匹配：低价 +30
    if (priceIn(ctx.priceRange, "value_for_money_low")) {
      score += 30;
      reasons.push("低客单价天然适合性价比定位");
    } else if (priceIn(ctx.priceRange, "value_for_money_mid")) {
      score += 20;
      reasons.push("中等客单价，性价比仍有吸引力");
    }

    // 目标客群：包含"上班族/打工人/学生" +10
    const cust = ctx.targetCustomers.toLowerCase();
    if (cust.includes("上班族") || cust.includes("打工人") || cust.includes("学生")) {
      score += 15;
      reasons.push("目标客群匹配性价比定位");
    }

    // 平台加分：有抖音（同城流量）+ 大众点评 +10
    if (ctx.hasDouyin) score += 5;
    if (ctx.hasDianping) score += 5;

    return { score, reasons };
  },

  // 3. 老板IP型
  boss_ip: (ctx) => {
    const reasons: string[] = [];
    let score = 0;

    // 任何品类都可以，但不是新店期更适合
    if (ctx.accountStage !== "new") {
      score += 20;
      reasons.push("非新店期，有故事可讲");
    } else {
      score += 10;
      reasons.push("新店期也适合讲故事起步");
    }

    // 平台加分：有抖音（口播）+ 小红书 +15
    if (ctx.hasDouyin) {
      score += 10;
      reasons.push("绑定了抖音，适合口播内容");
    }
    if (ctx.hasXiaohongshu) {
      score += 10;
      reasons.push("绑定了小红书，适合图文故事");
    }

    return { score, reasons };
  },

  // 4. 专业主厨型
  chef_expertise: (ctx) => {
    const reasons: string[] = [];
    let score = 0;

    // 品类匹配：精致品类 +30
    if (inCategory(ctx.cuisineType, "refined")) {
      score += 30;
      reasons.push("精致品类适合专业主厨路线");
    }

    // 客单价匹配：高客单价 +20
    if (priceIn(ctx.priceRange, "chef_expertise_high")) {
      score += 25;
      reasons.push("高客单价需要专业度支撑");
    } else if (priceIn(ctx.priceRange, "chef_expertise_mid")) {
      score += 15;
      reasons.push("中高客单价适合专业定位");
    }

    // 平台加分：有小红书（深度图文）+10
    if (ctx.hasXiaohongshu) {
      score += 10;
      reasons.push("小红书适合深度专业内容");
    }

    return { score, reasons };
  },

  // 5. 生活方式型
  lifestyle: (ctx) => {
    const reasons: string[] = [];
    let score = 0;

    // 品类匹配：生活方式品类 +40
    if (inCategory(ctx.cuisineType, "lifestyle")) {
      score += 40;
      reasons.push("品类天然适合生活方式路线");
    }

    // 客单价匹配：中低客单价 +10
    if (priceIn(ctx.priceRange, "lifestyle_acceptable")) {
      score += 10;
      reasons.push("客单价适合日常消费场景");
    }

    // 平台加分：有小红书 +20（生活方式核心平台）
    if (ctx.hasXiaohongshu) {
      score += 20;
      reasons.push("小红书是生活方式内容的最佳平台");
    }

    return { score, reasons };
  },

  // 6. 本地口碑型
  local_buzz: (ctx) => {
    const reasons: string[] = [];
    let score = 0;

    // 品类不限，但非新店期更适合
    if (ctx.accountStage !== "new") {
      score += 15;
      reasons.push("有一定经营历史，有口碑积累");
    }

    // 客单价适用性广：中低客单价 +10
    if (!priceIn(ctx.priceRange, "chef_expertise_high")) {
      score += 10;
      reasons.push("中低客单价适合口碑传播");
    }

    // 平台加分：有大众点评 +20（口碑核心平台）
    if (ctx.hasDianping) {
      score += 20;
      reasons.push("大众点评是本地口碑的核心阵地");
    }
    if (ctx.hasXiaohongshu) {
      score += 5;
      reasons.push("小红书适合种草转化");
    }

    return { score, reasons };
  },

  // 7. 情绪治愈型
  emotional_comfort: (ctx) => {
    const reasons: string[] = [];
    let score = 0;

    // 品类匹配：治愈品类 +30
    if (inCategory(ctx.cuisineType, "comfort")) {
      score += 30;
      reasons.push("品类适合治愈感内容");
    } else if (inCategory(ctx.cuisineType, "social")) {
      score += 10;
      reasons.push("也有温暖故事可讲");
    }

    // 目标客群匹配
    const cust = ctx.targetCustomers.toLowerCase();
    if (cust.includes("治愈") || cust.includes("温暖") || cust.includes("放松") || 
        cust.includes("独自") || cust.includes("一人食") || cust.includes("安静")) {
      score += 20;
      reasons.push("目标客群有情绪需求");
    }

    // 平台加分：小红书优先
    if (ctx.hasXiaohongshu) {
      score += 15;
      reasons.push("小红书适合情绪内容传播");
    }

    return { score, reasons };
  },

  // 8. 品类专家型
  cuisine_expert: (ctx) => {
    const reasons: string[] = [];
    let score = 0;

    // 品类匹配：主流/有深度的品类 +20
    if (inCategory(ctx.cuisineType, "social") || inCategory(ctx.cuisineType, "refined")) {
      score += 20;
      reasons.push("品类有深度内容可做");
    }

    // 客单价匹配：中高客单价 +15
    if (priceIn(ctx.priceRange, "scene_experience_acceptable")) {
      score += 15;
      reasons.push("中高客单价需要专家背书");
    }

    // 账号阶段：成长期/成熟期更适合 +10
    if (ctx.accountStage === "mature") {
      score += 15;
      reasons.push("成熟期适合输出行业观点");
    } else if (ctx.accountStage === "growing") {
      score += 10;
      reasons.push("成长期可以通过专家定位建立差异化");
    }

    // 平台加分
    if (ctx.hasXiaohongshu) score += 5;
    if (ctx.hasDouyin) score += 5;

    return { score, reasons };
  },
};


// ── 人群标签计算 ───────────────────────────────

export function computeAudienceTags(
  primaryType: ContentStrategyType,
  targetCustomers: string,
): AudienceTagResult {
  const fromStrategyType = STRATEGY_AUDIENCE_TAGS[primaryType] || [];
  const fromKeywords: DouyinAudienceTag[] = [];
  const custLower = (targetCustomers || "").toLowerCase();

  for (const { keywords, tag } of AUDIENCE_KEYWORD_TAGS) {
    if (keywords.some((k) => custLower.includes(k)) && !fromKeywords.includes(tag)) {
      fromKeywords.push(tag);
    }
  }

  const merged = fromStrategyType.concat(fromKeywords.filter((t) => !fromStrategyType.includes(t)));
  return { fromStrategyType, fromKeywords, merged };
}

// ── 主分类函数 ───────────────────────────────

/**
 * 对注册完成的商家进行战略归类。
 *
 * @param input - 商家注册信息（来自 StoreForm + 平台绑定状态）
 * @returns 完整的分类结果，包含战略定位、人设、栏目、选题
 */
export function classifyMerchant(input: ClassificationInput): MerchantClassification & { details: ClassificationDetail[] } {
  const priceValue = parsePrice(input.priceRange);

  const ctx: ScorerContext = {
    city: input.city || '本地',
    cuisineType: input.cuisineType || "美食",
    priceRange: input.priceRange || "50-80",
    priceValue,
    targetCustomers: input.targetCustomers || "",
    hasDianping: input.hasDianping,
    hasXiaohongshu: input.hasXiaohongshu,
    hasDouyin: input.hasDouyin,
    accountStage: input.accountStage || "new",
  };

  // 计算所有类型的得分
  const allScores: ClassificationDetail[] = (Object.keys(SCORERS) as ContentStrategyType[]).map((type) => {
    const { score, reasons } = SCORERS[type](ctx);
    return {
      type,
      label: STRATEGY_LABELS[type],
      score,
      matchedReasons: reasons,
    };
  });

  // 按得分降序排列
  allScores.sort((a, b) => b.score - a.score);

  // 取最高分为主类型
  const primary = allScores[0];
  const secondary = allScores[1];

  // 如果最佳得分 < 15，说明匹配度整体偏低，用通用型的本地口碑型兜底
  let primaryType: ContentStrategyType;
  let secondaryType: ContentStrategyType | undefined;

  if (primary.score < 15) {
    primaryType = "local_buzz";
    secondaryType = valueForMoneyCheck(ctx) ? "value_for_money" : "boss_ip";
  } else {
    primaryType = primary.type;
    secondaryType = secondary && secondary.score > 10 ? secondary.type : undefined;
  }

  // 生成完整分类结果
  const classification = getStrategyTemplate(primaryType, ctx.cuisineType, ctx.city);

  const audienceTags = computeAudienceTags(primaryType, ctx.targetCustomers);

  return {
    ...classification,
    primaryType,
    recommendedType: primary.type,
    secondaryType,
    details: allScores,
    audienceTags,
    isAutoAssigned: true,
    isHighConfidence: primary.score >= 40,
  };
}

/** 检查是否适合性价比路线 */
function valueForMoneyCheck(ctx: ScorerContext): boolean {
  return priceIn(ctx.priceRange, ["50以下", "50-80"]) || inCategory(ctx.cuisineType, "fast");
}

// ── 快速单维度查询 ───────────────────────────

/** 获取某商家的所有战略评分明细（用于调试/展示） */
export function getScores(input: ClassificationInput): ClassificationDetail[] {
  const priceValue = parsePrice(input.priceRange);
  const ctx: ScorerContext = {
    city: input.city || '本地',
    cuisineType: input.cuisineType || "美食",
    priceRange: input.priceRange || "50-80",
    priceValue,
    targetCustomers: input.targetCustomers || "",
    hasDianping: input.hasDianping,
    hasXiaohongshu: input.hasXiaohongshu,
    hasDouyin: input.hasDouyin,
    accountStage: input.accountStage || "new",
  };

  const allScores: ClassificationDetail[] = (Object.keys(SCORERS) as ContentStrategyType[]).map((type) => {
    const { score, reasons } = SCORERS[type](ctx);
    return { type, label: STRATEGY_LABELS[type], score, matchedReasons: reasons };
  });

  allScores.sort((a, b) => b.score - a.score);
  return allScores;
}

export function computeAudienceTagsFromInput(input: ClassificationInput): AudienceTagResult {
  const type = classifyMerchant(input);
  return type.audienceTags!;
}



