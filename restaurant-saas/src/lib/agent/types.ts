import type { StoreInfo, BrandPersona } from "@/types";

export interface AgentTool<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute(input: TInput, context: AgentContext): Promise<TOutput>;
}

export interface AgentContext {
  merchantId: string;
  storeInfo: StoreInfo;
  persona?: BrandPersona;
  recentContent?: GeneratedContentRecord[];
  trendingTopics?: TrendingTopicRecord[];
  merchantFeedback?: FeedbackPreference[];
}

export interface GeneratedContentRecord {
  id: string;
  contentType: string;
  platform: string;
  createdAt: string;
  templateId?: string;
  hookType?: string;
  structure?: string;
  tone?: string;
}

export interface TrendingTopicRecord {
  platform: string;
  title: string;
  hookType?: string;
  structure?: string;
  likesCount: number;
  cuisineType?: string;
  relevanceScore?: number;
}

export interface FeedbackPreference {
  merchantId: string;
  suppressedType: string;
  suppressedAt: string;
}

export interface Suggestion {
  type: "content" | "reply" | "account_setup" | "homogeneity_warning" | "hot_topic";
  title: string;
  description: string;
  actionLabel: string;
  actionType: "generate" | "navigate" | "dismiss";
  payload?: Record<string, unknown>;
  confidence: number;
}

export interface DailyAgentSuggestion {
  merchantId: string;
  date: string;
  suggestion: Suggestion;
  generatedAt: string;
  weightSnapshot: WeightSnapshot;
  pipelineTrace: TraceEntry[];
}

export interface WeightSnapshot {
  hotMatch: number;
  merchantMatch: number;
  diversity: number;
  history: number;
  timeliness: number;
  homogeneity: number;
}

export interface TraceEntry {
  step: string;
  durationMs: number;
  result: string;
}

export interface PipelineContext {
  stage: "new" | "growing" | "mature";
  history: { accepted: number; total: number; lastSuggestionDate: string | null };
  homogeneity: { severity: "none" | "mild" | "severe"; score: number };
  hotUrgency: { hasUrgent: boolean; expiresInHours: number };
  weightResult: WeightResult;
}

export interface WeightResult {
  candidates: WeightedCandidate[];
  selectedIndex: number;
}

export interface WeightedCandidate {
  suggestion: Suggestion;
  score: number;
  dimensionScores: Record<string, number>;
}
