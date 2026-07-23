import { describe, it, expect } from "vitest";
import {
  recordPipelineExecution, recordWeightScore,
  getRecentPipelineLogs, getPipelineStats,
} from "../observability";

describe("observability", () => {
  it("should record pipeline execution", () => {
    recordPipelineExecution({
      merchantId: "m1", date: "2026-07-24",
      success: true, step2DurationMs: 50,
    });
    const logs = getRecentPipelineLogs(5);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[logs.length - 1].merchantId).toBe("m1");
  });

  it("should record weight score", () => {
    recordWeightScore({
      merchantId: "m1", candidateIndex: 0,
      rawScores: {}, normalizedScores: {}, weightedScores: {},
      finalScore: 85,
    });
  });

  it("should return stats", () => {
    recordPipelineExecution({ merchantId: "m2", date: "2026-07-24", success: true });
    recordPipelineExecution({ merchantId: "m3", date: "2026-07-24", success: false });
    const stats = getPipelineStats();
    expect(stats.total).toBeGreaterThanOrEqual(2);
  });
});
