import { describe, it, expect } from "vitest";
import { getOrGenerateDailySuggestion, clearDailyCache, peekDailySuggestion } from "../cache";
import type { DailyAgentSuggestion } from "../types";

describe("getOrGenerateDailySuggestion", () => {
  it("should generate and cache on first call", async () => {
    clearDailyCache("g-test-1", "2026-07-27");
    let callCount = 0;
    const result = await getOrGenerateDailySuggestion("g-test-1", "2026-07-27", async () => {
      callCount++;
      return {
        merchantId: "g-test-1",
        date: "2026-07-27",
        suggestion: { type: "content", title: "t", description: "d", actionLabel: "g", actionType: "generate", confidence: 80 },
        generatedAt: new Date().toISOString(),
        weightSnapshot: { hotMatch: 0, merchantMatch: 0, diversity: 0, history: 0, timeliness: 0, homogeneity: 0 },
        pipelineTrace: [],
      } as DailyAgentSuggestion;
    });
    expect(result.suggestion).not.toBeNull();
    expect(result.fromCache).toBe(false);
    expect(callCount).toBe(1);
  });

  it("should return cached on second call", async () => {
    // First call generates and caches
    await getOrGenerateDailySuggestion("g-test-2", "2026-07-27", async () => {
      return {
        merchantId: "g-test-2",
        date: "2026-07-27",
        suggestion: { type: "content", title: "t", description: "d", actionLabel: "g", actionType: "generate", confidence: 80 },
        generatedAt: new Date().toISOString(),
        weightSnapshot: { hotMatch: 0, merchantMatch: 0, diversity: 0, history: 0, timeliness: 0, homogeneity: 0 },
        pipelineTrace: [],
      } as DailyAgentSuggestion;
    });
    // Second call should return from cache
    const result = await getOrGenerateDailySuggestion("g-test-2", "2026-07-27", async () => {
      return {
        merchantId: "g-test-2",
        date: "2026-07-27",
        suggestion: { type: "content", title: "t", description: "d", actionLabel: "g", actionType: "generate", confidence: 80 },
        generatedAt: new Date().toISOString(),
        weightSnapshot: { hotMatch: 0, merchantMatch: 0, diversity: 0, history: 0, timeliness: 0, homogeneity: 0 },
        pipelineTrace: [],
      } as DailyAgentSuggestion;
    });
    expect(result.fromCache).toBe(true);
  });

  it("should only call generate once for concurrent requests", async () => {
    clearDailyCache("g-test-3", "2026-07-27");
    let callCount = 0;
    const generate = async () => {
      callCount++;
      return {
        merchantId: "g-test-3",
        date: "2026-07-27",
        suggestion: { type: "content", title: "t", description: "d", actionLabel: "g", actionType: "generate", confidence: 80 },
        generatedAt: new Date().toISOString(),
        weightSnapshot: { hotMatch: 0, merchantMatch: 0, diversity: 0, history: 0, timeliness: 0, homogeneity: 0 },
        pipelineTrace: [],
      } as DailyAgentSuggestion;
    };
    const results = await Promise.all([
      getOrGenerateDailySuggestion("g-test-3", "2026-07-27", generate),
      getOrGenerateDailySuggestion("g-test-3", "2026-07-27", generate),
      getOrGenerateDailySuggestion("g-test-3", "2026-07-27", generate),
    ]);
    expect(callCount).toBe(1);
    expect(results[0].fromCache).toBe(false);
    expect(results[1].fromCache).toBe(true);
  });
});
