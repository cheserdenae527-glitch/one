import { describe, it, expect } from "vitest";
import { getDailySuggestion, setDailySuggestion, clearDailyCache } from "../cache";
import type { DailyAgentSuggestion } from "../types";

describe("Daily suggestion cache", () => {
  const makeSuggestion = (merchantId: string, date: string): DailyAgentSuggestion => ({
    merchantId,
    date,
    suggestion: {
      type: "content",
      title: "Test",
      description: "Test description",
      actionLabel: "Generate",
      actionType: "generate",
      confidence: 80,
    },
    generatedAt: "2026-07-23T08:00:00Z",
    weightSnapshot: { hotMatch: 85, merchantMatch: 90, diversity: 70, history: 50, timeliness: 100, homogeneity: 20 },
    pipelineTrace: [],
  });

  it("should return null for uncached merchant", async () => {
    clearDailyCache("new-merchant", "2026-07-23");
    const result = await getDailySuggestion("new-merchant", "2026-07-23");
    expect(result).toBeNull();
  });

  it("should return cached suggestion on second call", async () => {
    const sug = makeSuggestion("test-merchant", "2026-07-23");
    setDailySuggestion("test-merchant", "2026-07-23", sug);

    const result = await getDailySuggestion("test-merchant", "2026-07-23");
    expect(result).toEqual(sug);
  });

  it("should return different results for different dates", async () => {
    const today = makeSuggestion("merchant", "2026-07-23");
    const tomorrow = makeSuggestion("merchant", "2026-07-24");
    setDailySuggestion("merchant", "2026-07-23", today);
    setDailySuggestion("merchant", "2026-07-24", tomorrow);

    expect(await getDailySuggestion("merchant", "2026-07-23")).toEqual(today);
    expect(await getDailySuggestion("merchant", "2026-07-24")).toEqual(tomorrow);
  });

  it("should clear cache entry", async () => {
    const sug = makeSuggestion("clear-merchant", "2026-07-23");
    setDailySuggestion("clear-merchant", "2026-07-23", sug);
    clearDailyCache("clear-merchant", "2026-07-23");

    const result = await getDailySuggestion("clear-merchant", "2026-07-23");
    expect(result).toBeNull();
  });
});
