import { describe, it, expect } from "vitest";
// 导入待测试的类型
import type {
  AgentTool, AgentContext, GeneratedContentRecord,
  TrendingTopicRecord, FeedbackPreference, Suggestion,
  DailyAgentSuggestion, PipelineContext, WeightResult,
  WeightedCandidate, WeightSnapshot, TraceEntry
} from "../types";

describe("AgentTool interface", () => {
  it("should validate tool structure", () => {
    const tool: AgentTool<string, string> = {
      name: "test_tool",
      description: "A test tool",
      parameters: { type: "object", properties: {} },
      execute: async (input, ctx) => input,
    };
    expect(tool.name).toBe("test_tool");
    expect(typeof tool.execute).toBe("function");
  });
});

describe("AgentContext", () => {
  it("should accept partial data for cold start", () => {
    // trendingTopics 和 recentContent 是可选的 → 冷启动场景
    const ctx: AgentContext = {
      merchantId: "test-id",
      storeInfo: { id: "s1", name: "测试店", accountStage: "new" },
    };
    expect(ctx.merchantId).toBe("test-id");
    expect(ctx.storeInfo.accountStage).toBe("new");
  });

  it("should accept merchant feedback", () => {
    const ctx: AgentContext = {
      merchantId: "test-id",
      storeInfo: { id: "s1", name: "测试店", accountStage: "new" },
      merchantFeedback: [
        { merchantId: "test-id", suppressedType: "对比结构", suppressedAt: "2026-07-23T10:00:00Z" },
      ],
    };
    expect(ctx.merchantFeedback).toHaveLength(1);
    expect(ctx.merchantFeedback![0].suppressedType).toBe("对比结构");
  });
});

describe("Suggestion", () => {
  it("should support all suggestion types", () => {
    const types: Suggestion["type"][] = [
      "content", "reply", "account_setup",
      "homogeneity_warning", "hot_topic",
    ];
    const s: Suggestion = {
      type: "content",
      title: "母亲节促销文案",
      description: "最近母亲节话题在升温",
      actionLabel: "一键生成",
      actionType: "generate",
      confidence: 85,
    };
    expect(types).toContain(s.type);
    expect(s.confidence).toBeGreaterThan(0);
  });
});

describe("DailyAgentSuggestion", () => {
  it("should include weight snapshot and trace", () => {
    const d: DailyAgentSuggestion = {
      merchantId: "m1",
      date: "2026-07-23",
      suggestion: { type: "content", title: "t", description: "d", actionLabel: "g", actionType: "generate", confidence: 80 },
      generatedAt: "2026-07-23T08:00:00Z",
      weightSnapshot: { hotMatch: 85, merchantMatch: 90, diversity: 70, history: 50, timeliness: 100, homogeneity: 20 },
      pipelineTrace: [{ step: "context", durationMs: 10, result: "ok" }],
    };
    expect(d.weightSnapshot.hotMatch).toBe(85);
    expect(d.pipelineTrace).toHaveLength(1);
  });
});
