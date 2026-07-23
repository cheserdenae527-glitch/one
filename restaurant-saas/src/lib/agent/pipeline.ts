import { buildAgentContext } from "./context-builder";
import { evaluatePriorityRules } from "./priority-rules";
import { getDailySuggestion, setDailySuggestion } from "./cache";
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

  // Step 3: LLM fallback — for now return a generic suggestion
  // (will be enhanced in Phase 5 with trending analysis + weight system integration)
  const genericSuggestion: Suggestion = {
    type: "content",
    title: "日常内容建议",
    description: "今天还没有内容计划，要不要生成一篇？",
    actionLabel: "生成内容",
    actionType: "generate",
    confidence: 70,
  };

  const result: DailyAgentSuggestion = {
    merchantId,
    date,
    suggestion: genericSuggestion,
    generatedAt: new Date().toISOString(),
    weightSnapshot: { hotMatch: 0, merchantMatch: 0, diversity: 0, history: 0, timeliness: 0, homogeneity: 0 },
    pipelineTrace: traces,
  };

  setDailySuggestion(merchantId, date, result);
  return { suggestion: result, fromCache: false, stage: "llm_fallback" };
}
