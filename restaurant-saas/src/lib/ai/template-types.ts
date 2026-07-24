export interface Template {
  id: string;
  name: string;
  description: string;
  angle: string;
  format: string;
  structure: string[];
  hook: string;
  tone: string[];
  cuisines: string[];
  platforms: string[];
  stages: string[];
  promptTemplate: string;
  weight: number;
  storeWeightOffsets: Record<string, number>;
  status: string;
  usageCount: number;
  skipCount: number;
  createdAt: string;
}

export interface MatchInput {
  cuisine: string;
  platform: string;
  stage: string;
  personaTone?: string;
  recentAngles: string[];
  storeId?: string;
}

export interface FeedbackInput {
  templateId: string;
  action: "used" | "saved" | "shared" | "regenerated" | "skipped";
  storeId?: string;
}

export interface MatchResult {
  candidates: Template[];
  selected: Template | null;
  debug: {
    layer1Count: number;
    layer2Count: number;
    layer3Count: number;
    finalCount: number;
  };
}

export const TEMPLATE_WEIGHTS = {
  used: 0.1,
  saved: 0.3,
  shared: 0.3,
  regenerated: -0.2,
  skipped: -0.5,
};

export const ALL_PLATFORMS = ["dianping", "xiaohongshu", "douyin", "wechat"];
export const ALL_STAGES = ["early", "growth", "mature"];
export const WEIGHT_MIN = 0.05;
export const WEIGHT_MAX = 1.0;
export const WEIGHT_DORMANT_THRESHOLD = 0.1;
export const SKIP_OBSERVING_THRESHOLD = 20;
export const DORMANT_DAYS = 30;
export const CANDIDATE_COUNT = 3;
