/**
 * AI Agent 运营引擎 — 公开 API
 *
 * 使用方式: import { runAgentPipeline } from "@/lib/agent"
 */

// Pipeline 编排
export { runAgentPipeline } from "./pipeline";
export type { PipelineOptions, PipelineResult } from "./pipeline";

// AgentContext
export { buildAgentContext } from "./context-builder";

// 日缓存
// 修复点：cache.ts 重构后新增 getOrGenerateDailySuggestion（锁真正包住生成流程）
// 和 peekDailySuggestion（只读缓存），旧的 getDailySuggestion 保留作兼容层。
export {
  getOrGenerateDailySuggestion, peekDailySuggestion,
  getDailySuggestion, setDailySuggestion, clearDailyCache,
} from "./cache";

// 同质化 / 热点时效（新增，供 pipeline.ts 内部使用，也可单独调用做调试）
export { checkHomogeneity } from "./homogeneity-check";
export { getTrendUrgency } from "./hot-urgency";

// 优先级规则
export { evaluatePriorityRules } from "./priority-rules";
export type { RuleMatch } from "./priority-rules";

// 核心类型
export type {
  AgentTool, AgentContext, Suggestion, DailyAgentSuggestion,
  PipelineContext, WeightResult, WeightedCandidate,
  WeightSnapshot, TraceEntry, GeneratedContentRecord,
  TrendingTopicRecord, FeedbackPreference,
} from "./types";

// 工具层
export { createToolRegistry, wrapContentGenerator, wrapPersonaGenerator } from "./tools";

 // 分析引擎
 export { analyzeTrendingPost } from "./analysis/content-analyzer";
 export { matchTrendToMerchant, matchContentToMerchant, rankTrendsForMerchant } from "./analysis/merchant-matcher";
 export type { RankedTrendItem } from "./analysis/merchant-matcher";
 export type {
   TrendAnalysisResult,
   MerchantMatchedAnalysis,
   MatchDimensionBreakdown,
   MerchantPlatformBindings,
 } from "./analysis/types";
 export {
   PLATFORM_ALIAS,
   CUISINE_GROUPS,
   STAGE_CONTENT_PREFERENCES,
   MATCH_DIMENSION_WEIGHTS,
 } from "./analysis/types";

// 权重系统
export {
  DEFAULT_WEIGHTS, coldStartAdjustment,
  normalizeScore, calculateFinalScore, shouldMeltdown,
} from "./weight/config";
export type { WeightDimensions } from "./weight/config";

export {
  selectContentParams, executeDegradationChain,
  violatesConstraint,
} from "./weight/diversity";
export type {
  ContentParams, ContentMemory, DegradationResult,
  HookType, NarrativeStructure, ToneStyle, PacingStyle,
} from "./weight/diversity";

// 可观测性
export { recordPipelineExecution, recordWeightScore, getPipelineStats } from "./observability";
export type { PipelineLogEntry, WeightScoreLogEntry } from "./observability";


// 商家分类系统
export { classifyMerchant, getScores } from "./classification/merchant-classifier";
export { getStrategyTemplate, getAllStrategySummaries } from "./classification/strategy-templates";
export type {
  MerchantClassification,
  ContentStrategyType,
  ContentPillar,
  PlatformSuggestion,
  ClassificationInput,
  ClassificationDetail,
} from "./classification/types";
export {
  STRATEGY_LABELS,
  STRATEGY_CUISINE_PREFERENCES,
  STRATEGY_PRICE_PREFERENCES,
} from "./classification/types";
// JSON 安全解析（供各 LLM 调用点复用）
export { safeParseLLMJson, safeParseLLMJsonOr, LLMParseError } from "./json-utils";

