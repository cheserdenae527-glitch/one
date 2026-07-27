import { buildAgentContext } from "./context-builder";
import { evaluatePriorityRules } from "./priority-rules";
import { getOrGenerateDailySuggestion, peekDailySuggestion } from "./cache";
import { calculateFinalScore, DEFAULT_WEIGHTS, shouldMeltdown } from "./weight/config";
import { checkHomogeneity } from "./homogeneity-check";
import { getTrendUrgency } from "./hot-urgency";
import type {
  PipelineContext, DailyAgentSuggestion, TraceEntry, Suggestion,
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

  // 修复点：原来是 cache.ts 和这里各跑一套逻辑，锁没有保护到生成过程。
  // 现在把"生成一条建议"的全部逻辑作为回调传给 getOrGenerateDailySuggestion，
  // 锁真正包住下面这段——并发请求只有一个会真正执行 generateSuggestion()，
  // 其余请求走轮询等待缓存。
  const { suggestion, fromCache } = await getOrGenerateDailySuggestion(
    merchantId,
    date,
    () => generateSuggestion(merchantId, date)
  );

  if (!suggestion) {
    // 抢锁+轮询都失败（对应设计文档 8.1 节"兜底"）：返回降级建议，不报错
    return {
      suggestion: peekDailySuggestion(merchantId, date) ?? buildFallbackSuggestion(merchantId, date),
      fromCache: false,
      stage: "empty",
    };
  }

  const stage: PipelineResult["stage"] =
    suggestion.suggestion.type === "account_setup" ||
    suggestion.suggestion.type === "homogeneity_warning" ||
    (suggestion.pipelineTrace.find(t => t.step === "priority_rules")?.result === "matched")
      ? "rule_matched"
      : "llm_fallback";

  return { suggestion, fromCache, stage };
}

/**
 * 实际生成一条建议的完整流程（对应设计文档 7.3 节 Step 2 ~ Step 3）。
 * 这个函数只会在抢到锁的那个请求里被调用一次。
 */
async function generateSuggestion(merchantId: string, date: string): Promise<DailyAgentSuggestion> {
  const traces: TraceEntry[] = [];

  // Step 2: 构建上下文
  const t1 = Date.now();
  const context = await buildAgentContext(merchantId);
  traces.push({ step: "build_context", durationMs: Date.now() - t1, result: "ok" });

  // Step 2 续: 同质化扫描 + 热点时效判断
  // 修复点：这两项之前是硬编码 { severity: "none" } / { hasUrgent: false }，
  // 导致 priority-rules.ts 里对应的规则和下面的熔断永远不会命中。
  const t1b = Date.now();
  const homogeneity = await checkHomogeneity(merchantId, context.recentContent ?? [], context);
  const hotUrgency = getTrendUrgency(context.trendingTopics ?? []);
  traces.push({ step: "homogeneity_and_urgency", durationMs: Date.now() - t1b, result: homogeneity.severity });

  const pipelineCtx: PipelineContext = {
    stage: context.storeInfo.accountStage || "new",
    history: {
      accepted: 0,
      total: 0,
      lastSuggestionDate: null,
    },
    homogeneity,
    hotUrgency,
    weightResult: { candidates: [], selectedIndex: -1 },
  };

  // Step 2.5: 确定性优先级规则，命中即停
  const t25 = Date.now();
  const ruleResult = evaluatePriorityRules(pipelineCtx);
  traces.push({ step: "priority_rules", durationMs: Date.now() - t25, result: ruleResult.matched ? "matched" : "no_match" });

  if (ruleResult.matched) {
    return {
      merchantId,
      date,
      suggestion: ruleResult.suggestion,
      generatedAt: new Date().toISOString(),
      weightSnapshot: {
        hotMatch: 0, merchantMatch: 0, diversity: 0, history: 0,
        timeliness: 0, homogeneity: Math.round(homogeneity.score),
      },
      pipelineTrace: traces,
    };
  }

  // Step 3: 权重打分 + 生成候选建议
  const t3 = Date.now();
  const dimensionScores = {
    hotMatch: context.trendingTopics?.length ? Math.min(context.trendingTopics.length * 20, 100) : 50,
    merchantMatch: context.storeInfo.cuisineType ? 70 : 50,
    diversity: context.recentContent?.length ? Math.min(context.recentContent.length * 10, 100) : 100,
    history: 50,
    timeliness: hotUrgency.hasUrgent ? 100 : 50,
    homogeneity: homogeneity.score / 100, // shouldMeltdown 按 4.5 节吃 0-1 浮点
  };

  const finalScore = calculateFinalScore(dimensionScores, DEFAULT_WEIGHTS);
  const meltdown = shouldMeltdown(dimensionScores.homogeneity);
  traces.push({ step: "weight_scoring", durationMs: Date.now() - t3, result: meltdown ? "meltdown" : "ok" });

  const smartSuggestion = buildSmartSuggestion(context, finalScore, meltdown, homogeneity);

  return {
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
      homogeneity: Math.round(homogeneity.score),
    },
    pipelineTrace: traces,
  };
}

function buildSmartSuggestion(
  context: Awaited<ReturnType<typeof buildAgentContext>>,
  finalScore: number,
  meltdown: boolean,
  homogeneity: { severity: string; score: number }
): Suggestion {
  if (meltdown) {
    return {
      type: "homogeneity_warning",
      title: "内容风格趋同",
      description: `同质化评分 ${Math.round(homogeneity.score)}，建议换一个切入角度或内容类型`,
      actionLabel: "换角度",
      actionType: "generate",
      confidence: 90,
    };
  }
  if (context.trendingTopics && context.trendingTopics.length > 0) {
    return {
      type: "hot_topic",
      title: `热点话题：${context.trendingTopics[0].title}`,
      description: `当前有 ${context.trendingTopics.length} 个热点话题适合你`,
      actionLabel: "查看热点",
      actionType: "generate",
      confidence: Math.round(finalScore),
    };
  }
  return {
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

/** 轮询超时后的兜底建议，保证前端永远拿到可展示的内容而不是报错。 */
function buildFallbackSuggestion(merchantId: string, date: string): DailyAgentSuggestion {
  return {
    merchantId,
    date,
    suggestion: {
      type: "content",
      title: "今日内容建议",
      description: "系统繁忙，建议先生成一篇常规内容，稍后刷新可能看到更精准的建议",
      actionLabel: "生成内容",
      actionType: "generate",
      confidence: 30,
    },
    generatedAt: new Date().toISOString(),
    weightSnapshot: { hotMatch: 0, merchantMatch: 0, diversity: 0, history: 0, timeliness: 0, homogeneity: 0 },
    pipelineTrace: [{ step: "fallback", durationMs: 0, result: "poll_timeout" }],
  };
}
