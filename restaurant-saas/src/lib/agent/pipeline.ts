import { buildAgentContext } from "./context-builder";
import { evaluatePriorityRules } from "./priority-rules";
import { getDailySuggestion, setDailySuggestion } from "./cache";
import { calculateFinalScore, DEFAULT_WEIGHTS, shouldMeltdown } from "./weight/config";
import type {
  PipelineContext, DailyAgentSuggestion, WeightSnapshot,
  TraceEntry, Suggestion,
} from "./types";

export interface PipelineOptions {
  merchantId: string;
  date: string;
}

export interface PipelineResult {
  suggestion: DailyAgentSuggestion | null;
  fromCache: boolean;
  stage: "rule_matched" | "llm_fallback" | "empty";
}

export async function runAgentPipeline(options: PipelineOptions): Promise<PipelineResult> {
  const { merchantId, date } = options;
  const traces: TraceEntry[] = [];

  // Step 1: Check cache first
  const cached = await getDailySuggestion(merchantId, date);
  if (cached) {
    return { suggestion: cached, fromCache: true, stage: "rule_matched" };
  }

  // Step 2: Build context
  const t1 = Date.now();
  const context = await buildAgentContext(merchantId);
  traces.push({ step: "build_context", durationMs: Date.now() - t1, result: "ok" });

  // Build PipelineContext from AgentContext
  const pipelineCtx: PipelineContext = {
    stage: context.storeInfo.accountStage || "new",
    history: {
      accepted: 0,
      total: 0,
      lastSuggestionDate: null,
    },
    homogeneity: { severity: "none", score: 0 },
    hotUrgency: { hasUrgent: false, expiresInHours: 48 },
    weightResult: { candidates: [], selectedIndex: -1 },
  };

  // Step 2.5: Check deterministic priority rules
  const t25 = Date.now();
  const ruleResult = evaluatePriorityRules(pipelineCtx);
  traces.push({ step: "priority_rules", durationMs: Date.now() - t25, result: ruleResult.matched ? "matched" : "no_match" });

  if (ruleResult.matched) {
    const suggestion: DailyAgentSuggestion = {
      merchantId,
      date,
      suggestion: ruleResult.suggestion,
      generatedAt: new Date().toISOString(),
      weightSnapshot: { hotMatch: 0, merchantMatch: 0, diversity: 0, history: 0, timeliness: 0, homogeneity: 0 },
      pipelineTrace: traces,
    };
    setDailySuggestion(merchantId, date, suggestion);
    return { suggestion, fromCache: false, stage: "rule_matched" };
  }

  // Step 3: 使用权重系统生成智能建议
  const dimensionScores = {
    hotMatch: context.trendingTopics?.length ? Math.min(context.trendingTopics.length * 20, 100) : 50,
    merchantMatch: context.storeInfo.cuisineType ? 70 : 50,
    diversity: context.recentContent?.length ? Math.min(context.recentContent.length * 10, 100) : 100,
    history: 50,
    timeliness: 50,
    homogeneity: 0,
  };

  const finalScore = calculateFinalScore(dimensionScores, DEFAULT_WEIGHTS);
  const meltdown = shouldMeltdown(dimensionScores.homogeneity);

  let smartSuggestion: Suggestion;

  if (meltdown) {
    smartSuggestion = {
      type: "homogeneity_warning",
      title: "内容风格趋同",
      description: `同质化评分较高，建议换一个切入角度或内容类型`,
      actionLabel: "换角度",
      actionType: "generate",
      confidence: 90,
    };
  } else if (context.trendingTopics && context.trendingTopics.length > 0) {
    smartSuggestion = {
      type: "hot_topic",
      title: `热点话题：${context.trendingTopics[0].title}`,
      description: `当前有 ${context.trendingTopics.length} 个热点话题适合你`,
      actionLabel: "查看热点",
      actionType: "generate",
      confidence: Math.round(finalScore),
    };
  } else {
    smartSuggestion = {
      type: "content",
      title: context.storeInfo.cuisineType
        ? `${context.storeInfo.cuisineType}内容推荐`
        : "今日内容建议",
      description: `匹配度 ${finalScore} 分，建议生成一篇适合你店铺的内容`,
      actionLabel: "生成内容",
      actionType: "generate",
      confidence: Math.round(finalScore),
    };
  }

  const result: DailyAgentSuggestion = {
    merchantId,
    date,
    suggestion: smartSuggestion,
    generatedAt: new Date().toISOString(),
    weightSnapshot: {
      hotMatch: Math.round(dimensionScores.hotMatch),
      merchantMatch: Math.round(dimensionScores.merchantMatch),
      diversity: Math.round(dimensionScores.diversity),
      history: Math.round(dimensionScores.history),
      timeliness: Math.round(dimensionScores.timeliness),
      homogeneity: Math.round(dimensionScores.homogeneity),
    },
    pipelineTrace: traces,
  };

  setDailySuggestion(merchantId, date, result);
  return { suggestion: result, fromCache: false, stage: "llm_fallback" };
}
