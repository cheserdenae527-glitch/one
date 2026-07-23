import { describe, it, expect } from "vitest";
import { vi } from "vitest";

// Mock context-builder to avoid Next.js cookies() call outside request scope
vi.mock("../context-builder", () => ({
  buildAgentContext: vi.fn().mockResolvedValue({
    merchantId: "test-m1",
    storeInfo: { id: "test-m1", name: "测试餐厅", accountStage: "new" },
    recentContent: [],
    trendingTopics: [],
    merchantFeedback: [],
  }),
}));

import { runAgentPipeline } from "../pipeline";
import { clearDailyCache } from "../cache";
import { getDailySuggestion } from "../cache";

describe("runAgentPipeline", () => {
  it("should return result with correct shape", async () => {
    const result = await runAgentPipeline({ merchantId: "test-m1", date: "2026-07-24" });
    expect(result).toHaveProperty("suggestion");
    expect(result).toHaveProperty("fromCache");
    expect(result).toHaveProperty("stage");
    expect(["rule_matched", "llm_fallback", "empty"]).toContain(result.stage);
  });

  it("should cache suggestion on first call", async () => {
    clearDailyCache("test-m2", "2026-07-24");
    const first = await runAgentPipeline({ merchantId: "test-m2", date: "2026-07-24" });
    const cached = await getDailySuggestion("test-m2", "2026-07-24");
    expect(cached).toBeDefined();
    expect(cached!.suggestion.title).toBe(first.suggestion!.suggestion.title);
  });

  it("should return cached suggestion on second call", async () => {
    const first = await runAgentPipeline({ merchantId: "test-m3", date: "2026-07-24" });
    const second = await runAgentPipeline({ merchantId: "test-m3", date: "2026-07-24" });
    expect(second.fromCache).toBe(true);
  });

  it("should attach pipeline trace", async () => {
    const result = await runAgentPipeline({ merchantId: "test-m4", date: "2026-07-24" });
    expect(result.suggestion!.pipelineTrace.length).toBeGreaterThan(0);
  });
});
