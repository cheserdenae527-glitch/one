/**
 * compliance.ts — 合规审查层（第九章）
 * 所有即将对外发布的内容必须经过合规审查才能标记为"发布"状态。
 */

// ── 9.1 广告法违禁词库 ──────────────────────────────────────────

const FORBIDDEN_WORDS: string[] = [
  // 极限词
  "最", "第一", "国家级", "唯一", "极致", "顶级", "绝对", "首选",
  "首个", "独家", "冠军", "之王", "王牌", "王牌产品", "销量第一",
  "全网第一", "第一品牌", "NO.1", "top1", "TOP1",
  // 食品健康宣称
  "纯天然", "无添加", "养生", "排毒", "绝对新鲜", "治愈", "药膳",
  "疗效", "根治", "安全无毒", "零添加", "零防腐", "零激素",
  "保健", "防癌", "抗癌", "减肥", "瘦身", "增肌",
  // 虚假促销
  "限时抢购", "最后一天", "亏本", "跳楼价", "吐血价",
  "随时涨价", "马上涨价",
  // 误导性宣称
  "100%", "百分百", "永不", "永久", "终身",
];

const FORBIDDEN_PATTERNS: RegExp[] = [
  /最[好妙棒佳优新全热]/,
  /第[一二三四五]品牌/,
  /无[添防腐激药]/,
  /纯天[然色]/,
  /[根治治愈][疗愈]?/,
  /零[添防腐激药添色]/,
];

export interface ViolationResult {
  hasViolation: boolean;
  violations: { word: string; position: number }[];
  suggestions: string[];
}

export function checkForbiddenWords(content: string): ViolationResult {
  const violations: { word: string; position: number }[] = [];

  for (const word of FORBIDDEN_WORDS) {
    const idx = content.indexOf(word);
    if (idx >= 0) {
      violations.push({ word, position: idx });
    }
  }

  for (const pattern of FORBIDDEN_PATTERNS) {
    const match = content.match(pattern);
    if (match && match.index !== undefined) {
      violations.push({ word: match[0], position: match.index });
    }
  }

  // Sort by position
  violations.sort((a, b) => a.position - b.position);

  // Dedup by word
  const seen = new Set<string>();
  const uniqueViolations = violations.filter((v) => {
    if (seen.has(v.word)) return false;
    seen.add(v.word);
    return true;
  });

  const suggestionMap: Record<string, string> = {
    "最": "建议替换为「非常」「很」「格外」",
    "第一": "建议替换为「领先」「前列」「优秀」",
    "唯一": "建议替换为「特色」「特别」",
    "极致": "建议替换为「讲究」「用心」",
    "纯天然": "可能违反《广告法》食品宣称规定，建议删除或替换为具体食材描述",
    "无添加": "如无法提供检测证明，建议替换为具体配方描述",
    "养生": "食品不得宣称养生功效，建议删除",
    "排毒": "食品不得宣称排毒功能，建议删除",
    "治愈": "食品不得宣称疗效，建议删除",
    "100%": "如无法提供检测证明，建议删除或替换为具体数据",
    "百分百": "同「100%」，建议删除",
  };

  const suggestions = uniqueViolations
    .map((v) => suggestionMap[v.word] || `「${v.word}」属于疑似违规用词，建议替换或删除`)
    .filter((s, i, arr) => arr.indexOf(s) === i); // dedup suggestions

  return {
    hasViolation: uniqueViolations.length > 0,
    violations: uniqueViolations,
    suggestions,
  };
}

// ── 9.2 AIGC 内容标识 ──────────────────────────────────────────

export const AIGC_DISCLAIMER = "\n\n---\n*本文由 AI 辅助生成，仅供参考*";
export const AIGC_DISCLAIMER_SHORT = "（AI 辅助生成）";

export const AIGC_DISCLAIMER_PLATFORMS: Set<string> = new Set([
  "dianping", "xiaohongshu", "douyin",
]);

export function shouldAddAIGCDisclaimer(platform: string): boolean {
  return AIGC_DISCLAIMER_PLATFORMS.has(platform);
}

export function applyAIGCDisclaimer(content: string, platform: string): string {
  if (!shouldAddAIGCDisclaimer(platform)) return content;
  if (content.includes("AI 辅助生成")) return content;
  return content + AIGC_DISCLAIMER;
}

export function containsAIGCDisclaimer(content: string): boolean {
  return content.includes("AI 辅助生成");
}

// ── 9.3 审核强度分级 ──────────────────────────────────────────

export type ReviewLevel = "auto" | "suggest_review" | "force_review";

export interface ReviewResult {
  level: ReviewLevel;
  title: string;
  message: string;
  violations?: ViolationResult;
  hasAIGCDisclaimer: boolean;
  passed: boolean;
}

export interface ReviewConfig {
  contentType: "good_reply" | "medium_reply" | "bad_reply" | "store_profile" | "social_post";
}

const REVIEW_CONFIGS: Record<string, { level: ReviewLevel; label: string }> = {
  good_reply: { level: "auto", label: "好评回复（4-5星）" },
  medium_reply: { level: "suggest_review", label: "中评回复（3星）" },
  bad_reply: { level: "force_review", label: "差评回复（1-2星）" },
  store_profile: { level: "auto", label: "店铺简介/套餐文案" },
  social_post: { level: "auto", label: "小红书/抖音文案" },
};

export function getReviewLevel(contentType: string): ReviewLevel {
  return REVIEW_CONFIGS[contentType]?.level || "suggest_review";
}

export function runComplianceCheck(
  content: string,
  contentType: string,
  platform: string,
): ReviewResult {
  // 1. Forbidden word check
  const violations = checkForbiddenWords(content);

  // 2. AIGC disclaimer check
  const hasDisclaimer = containsAIGCDisclaimer(content);
  const needsDisclaimer = shouldAddAIGCDisclaimer(platform);

  // 3. Determine review level
  const reviewLevel = getReviewLevel(contentType);

  // Auto-passes: no violations + has disclaimer (if needed) + auto level
  let passed = true;
  const errors: string[] = [];

  if (violations.hasViolation) {
    passed = false;
    errors.push("含违规用词，需修改");
  }

  if (needsDisclaimer && !hasDisclaimer) {
    passed = false;
    errors.push("缺少 AIGC 标识");
  }

  if (reviewLevel === "force_review") {
    passed = false;
    errors.push("差评回复需人工审核");
  }

  const config = REVIEW_CONFIGS[contentType];
  return {
    level: reviewLevel,
    title: config?.label || contentType,
    message: errors.length > 0 ? "需要处理后方可发布：" + errors.join("；") : "审核通过",
    violations: violations.hasViolation ? violations : undefined,
    hasAIGCDisclaimer: hasDisclaimer,
    passed,
  };
}
