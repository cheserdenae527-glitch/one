/**
 * ============================================================
 * 商家归类系统 — 类型定义
 *
 * 基于餐饮自媒体定位体系（见定位文档），对注册完成后的商家
 * 做战略归类，输出内容策略、人设定位、栏目体系、30天规划。
 * ============================================================
 */

import type { BrandPersona } from "@/types";

// ── 战略类型枚举 ─────────────────────────────

export type ContentStrategyType =
  | "scene_experience"       // 场景体验型：火锅/烧烤/西餐，社交聚餐场景
  | "value_for_money"        // 性价比引流型：快餐/小吃，打工人生意
  | "boss_ip"                // 老板IP型：老板个人故事驱动
  | "chef_expertise"         // 专业主厨型：手艺人、匠心路线
  | "lifestyle"              // 生活方式型：咖啡/甜品/烘焙，美学路线
  | "local_buzz"             // 本地口碑型：街坊生意，真实口碑
  | "emotional_comfort"      // 情绪治愈型：温暖小店，治愈系
  | "cuisine_expert";        // 品类专家型：垂直品类深度内容

export const STRATEGY_LABELS: Record<ContentStrategyType, string> = {
  scene_experience: "场景体验型",
  value_for_money: "性价比引流型",
  boss_ip: "老板IP型",
  chef_expertise: "专业主厨型",
  lifestyle: "生活方式型",
  local_buzz: "本地口碑型",
  emotional_comfort: "情绪治愈型",
  cuisine_expert: "品类专家型",
};

// ── 内容栏目 ──────────────────────────────────

export interface ContentPillar {
  name: string;
  purpose: string;
  ratio: number;          // 占比 0-1
  format_suggestions: string[];
  examples: string[];
}

// ── 平台建议 ──────────────────────────────────

export interface PlatformSuggestion {
  platform: "dianping" | "xiaohongshu" | "douyin";
  priority: number;       // 1=最高
  reason: string;
  content_focus: string;
}

// ── 分类结果 ──────────────────────────────────

export interface MerchantClassification {
  /** 主战略类型 */
  primaryType: ContentStrategyType;
  /** 次选战略类型（备选） */
  secondaryType?: ContentStrategyType;

  /** 一句话账号定位（"我是___，帮助___，通过___，解决___"） */
  oneLinePositioning: string;

  /** 战略说明 */
  description: string;

  /** 推荐人设方案 */
  recommendedPersona: BrandPersona;

  /** 内容栏目体系（4象限） */
  contentPillars: ContentPillar[];

  /** 平台优先级 */
  platformPriority: PlatformSuggestion[];

  /** 差异化策略 */
  differentiationStrategy: string;

  /** 首月（30天）选题方向 */
  initialTopics: string[];
  /** 抖音人群标签 */
  audienceTags?: AudienceTagResult;

  /** 是否系统自动分配 */
  isAutoAssigned?: boolean;

  /** 是否高置信度推荐（>=40分） */
  isHighConfidence?: boolean;

  /** 系统原始推荐类型（商家改选后仍保留） */
  recommendedType?: ContentStrategyType;
}

// ── 分类权重明细 ─────────────────────────────

export interface ClassificationDetail {
  type: ContentStrategyType;
  label: string;
  score: number;
  matchedReasons: string[];
}

// ── 分类输入 ──────────────────────────────────

export interface ClassificationInput {
  cuisineType: string;
  priceRange: string;
  targetCustomers?: string;
  hasDianping: boolean;
  hasXiaohongshu: boolean;
  hasDouyin: boolean;
  accountStage: "new" | "growing" | "mature";
  city?: string;
}

// ── 品类分组（复用 analysis/types 的品类分组）─

/** 各战略类型偏好的品类 */
export const STRATEGY_CUISINE_PREFERENCES: Record<ContentStrategyType, string[]> = {
  scene_experience: ["火锅", "烧烤", "西餐", "日料", "川菜"],
  value_for_money: ["快餐", "小吃", "面食", "米线", "简餐"],
  boss_ip: [], // 全品类
  chef_expertise: ["日料", "西餐", "粤菜", "烘焙"],
  lifestyle: ["咖啡", "甜品", "烘焙", "茶饮"],
  local_buzz: [], // 全品类
  emotional_comfort: ["甜品", "咖啡", "小吃", "面食"],
  cuisine_expert: ["火锅", "川菜", "粤菜", "烧烤", "日料"],
};

/** 各战略类型偏好的客单价段 */
export const STRATEGY_PRICE_PREFERENCES: Record<ContentStrategyType, string[]> = {
  scene_experience: ["80-120", "120-200", "200以上"],
  value_for_money: ["50以下", "50-80"],
  boss_ip: [], // 全价位
  chef_expertise: ["120-200", "200以上"],
  lifestyle: ["50-80", "80-120"],
  local_buzz: ["50以下", "50-80", "80-120"],
  emotional_comfort: ["50以下", "50-80"],
  cuisine_expert: ["80-120", "120-200"],
};


// ── 抖音人群标签 ──────────────────────────────

export type DouyinAudienceTag =
  | "genz"
  | "elegant_mom"
  | "rising_white_collar"
  | "urban_blue_collar"
  | "town_youth"
  | "senior_middle_class"
  | "urban_silver"
  | "town_elderly";

export const AUDIENCE_LABELS: Record<DouyinAudienceTag, string> = {
  genz: "GenZ / 都市Z世代",
  elegant_mom: "精致妈妈",
  rising_white_collar: "新锐白领",
  urban_blue_collar: "都市蓝领",
  town_youth: "小镇青年",
  senior_middle_class: "资深中产",
  urban_silver: "都市银发",
  town_elderly: "小镇中老年",
};

export const STRATEGY_AUDIENCE_TAGS: Record<ContentStrategyType, DouyinAudienceTag[]> = {
  scene_experience:    ["genz", "rising_white_collar"],
  value_for_money:     ["urban_blue_collar", "genz"],
  boss_ip:             ["town_youth", "senior_middle_class"],
  chef_expertise:      ["senior_middle_class", "rising_white_collar"],
  lifestyle:           ["elegant_mom", "rising_white_collar", "genz"],
  local_buzz:          ["town_youth", "urban_blue_collar", "town_elderly"],
  emotional_comfort:   ["genz", "rising_white_collar"],
  cuisine_expert:      ["senior_middle_class", "rising_white_collar"],
};

export const AUDIENCE_KEYWORD_TAGS: Array<{ keywords: string[]; tag: DouyinAudienceTag }> = [
  { keywords: ["上班族", "打工人", "白领"], tag: "urban_blue_collar" },
  { keywords: ["学生", "校园"], tag: "genz" },
  { keywords: ["宝妈", "亲子", "带娃"], tag: "elegant_mom" },
  { keywords: ["独自用餐", "一人食", "单身"], tag: "genz" },
  { keywords: ["中老年", "长辈", "银发"], tag: "urban_silver" },
  { keywords: ["小镇", "县城", "返乡"], tag: "town_youth" },
];

export interface AudienceTagResult {
  fromStrategyType: DouyinAudienceTag[];
  fromKeywords: DouyinAudienceTag[];
  merged: DouyinAudienceTag[];
}

// ── 定价区间权威映射表 ──────────────────────────

export const PRICE_TIERS = {
  budget:     ["50以下"],
  mid_low:    ["50-80"],
  mid:        ["80-120", "120-200"],
  high:       ["200以上"],
  scene_experience_acceptable:  ["80-120", "120-200", "200以上"],
  scene_experience_light:       ["50-80"],
  value_for_money_low:          ["50以下"],
  value_for_money_mid:          ["50-80"],
  chef_expertise_high:          ["200以上"],
  chef_expertise_mid:           ["120-200"],
  lifestyle_acceptable:         ["50-80", "80-120"],
  local_buzz_acceptable:        ["50以下", "50-80", "80-120"],
  cuisine_expert_acceptable:    ["80-120", "120-200", "200以上"],
} as const;

export type PriceTierKey = keyof typeof PRICE_TIERS;

export function priceIn(priceRange: string, tier: PriceTierKey): boolean {
  return (PRICE_TIERS[tier] as readonly string[] | undefined)?.includes(priceRange) ?? false;
}

export const CUISINE_CATEGORIES: Record<string, string[]> = {
  social:    ["火锅", "烧烤", "烤肉", "串串", "麻辣烫", "打边炉", "焖锅"],
  fast:      ["快餐", "小吃", "米线", "面食", "简餐", "粉"],
  refined:   ["日料", "西餐", "粤菜", "牛排", "法餐", "omakase"],
  lifestyle: ["咖啡", "甜品", "茶饮", "奶茶", "烘焙", "面包", "冰淇淋"],
  comfort:   ["甜品", "咖啡", "小吃", "面食", "米线", "烘焙"],
};

export function inCategory(cuisine: string, category: string): boolean {
  const items = CUISINE_CATEGORIES[category];
  if (!items) return false;
  return items.some((c) => cuisine.includes(c) || c.includes(cuisine));
}

// ── 平台账号配置 ──────────────────────────────

export interface PlatformAccountConfig {
  platform: "dianping" | "xiaohongshu" | "douyin";
  accountName: string;
  accountUrl: string;
  followers?: number;
  isBound: boolean;
  contentFocus?: string;
  publishFrequency?: string;
  tonePreference?: string;
  platformStage?: "new" | "growing" | "mature";
  isCustomized: boolean;
}

export const PLATFORM_NAMES: Record<string, string> = {
  dianping: "大众点评",
  xiaohongshu: "小红书",
  douyin: "抖音",
};

export const STORAGE_KEYS = {
  STORE_INFO: "merchant_store_info",
  PLATFORM_ACCOUNTS: "merchant_platform_accounts",
  CLASSIFICATION_CACHE: "ops_classification_cache",
  SELECTED_STRATEGY: "merchant_selected_strategy",
} as const;
