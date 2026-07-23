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
export { getDailySuggestion, setDailySuggestion, clearDailyCache } from "./cache";

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
export { matchTrendToMerchant } from "./analysis/merchant-matcher";
export type { TrendAnalysisResult, MerchantMatchedAnalysis } from "./analysis/types";

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
