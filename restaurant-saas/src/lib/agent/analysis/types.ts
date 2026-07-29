export interface TrendAnalysisResult {
  postInfo: {
    title: string;
    platform: string;
    likes: number;
    saves: number;
    comments: number;
    publishTime: string;
  };
  topic: {
    primaryCategory: string;
    angle: string;
    replayable: boolean;
    replayHint?: string;
  };
  hook: {
    type: string;
    text: string;
    effectiveness: string;
  };
  structure: {
    pattern: string;
    bodyLength: number;
    paragraphCount: number;
    imageTextRatio: string;
  };
  toneAndKeywords: {
    tone: string;
    keywords: string[];
    keywordStrategy: string;
  };
  engagementTriggers: {
    likesWhy: string;
    savesWhy: string;
    shareWhy: string;
  };
  comments: {
    totalCommentCount: number;
    topWords: string[];
    sentimentDistribution: Record<string, string>;
    realUserSignals: string[];
    controversyPoints: string[];
  };
  whyItWorks: {
    summary: string;
    replicabilityScore: number;
    replicableElements: string[];
    riskFactors: string[];
  };
}

export interface MerchantMatchedAnalysis {
  relevanceToYou: {
   score: number;
    breakdown: MatchDimensionBreakdown;
   matchReason: string;
    mismatchWarning?: string;
  };
  howToAdapt: Array<{
    element: string;
    original: string;
    adapted: string;
    why: string;
  }>;
 actionPriority: "high" | "medium" | "low";
 suggestedAction: string;
  platformSpecificity?: {
    suggestedPlatform: "dianping" | "xiaohongshu" | "douyin";
    reason: string;
  };
}

export interface MatchDimensionBreakdown {
  cuisine: { score: number; weight: number; detail: string };
  price: { score: number; weight: number; detail: string };
  location: { score: number; weight: number; detail: string };
  persona: { score: number; weight: number; detail: string };
  platform: { score: number; weight: number; detail: string };
  stage: { score: number; weight: number; detail: string };
}

export interface MerchantPlatformBindings {
  dianping: boolean;
  xiaohongshu: boolean;
  douyin: boolean;
}

export const PLATFORM_ALIAS: Record<string, string> = {
  "大众点评": "dianping",
  "点评": "dianping",
  "小红书": "xiaohongshu",
  "抖音": "douyin",
  "douyin": "douyin",
  "xiaohongshu": "xiaohongshu",
  "dianping": "dianping",
};

export const CUISINE_GROUPS: Record<string, string[]> = {
  hotpot: ["火锅", "串串", "麻辣烫", "冒菜", "焖锅", "打边炉"],
  bbq: ["烧烤", "烤肉", "铁板烧", "烤鱼", "韩式烤肉"],
  noodle: ["面食", "粉", "米线", "面条", "拉面", "螺蛳粉"],
  rice: ["米饭", "快餐", "简餐", "盖饭", "炒饭", "中式快餐"],
  drink: ["奶茶", "咖啡", "饮品", "茶饮", "果汁", "奶昔"],
  japanese: ["日料", "寿司", "刺身", "日式", "居酒屋"],
  western: ["西餐", "牛排", "意面", "沙拉", "brunch", "轻食"],
  chinese: ["中餐", "川菜", "湘菜", "粤菜", "鲁菜", "江浙菜", "家常菜"],
  dimsum: ["早茶", "点心", "包子", "饺子", "馄饨", "汤包"],
  dessert: ["甜品", "蛋糕", "面包", "烘焙", "冰淇淋", "甜点"],
};

export const STAGE_CONTENT_PREFERENCES: Record<string, string[]> = {
  new: ["引流曝光", "基础介绍", "打卡种草", "促销活动"],
  growing: ["差异化角度", "横评对比", "深度测评", "人设强化"],
  mature: ["复购引导", "口碑沉淀", "会员活动", "品牌故事", "情感共鸣"],
};

export const MATCH_DIMENSION_WEIGHTS = {
  cuisine: 0.30,
  price: 0.15,
  location: 0.15,
  persona: 0.25,
  platform: 0.10,
  stage: 0.05,
};
