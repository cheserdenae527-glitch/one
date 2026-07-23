import { describe, it, expect } from "vitest";
import {
  evaluatePriorityRules, checkAccountSetupRule,
  checkHomogeneityRule, checkHotUrgencyRule,
} from "../priority-rules";
import type { PipelineContext } from "../types";

const baseCtx: PipelineContext = {
  stage: "growing",
  history: { accepted: 5, total: 10, lastSuggestionDate: "2026-07-22" },
  homogeneity: { severity: "none", score: 0 },
  hotUrgency: { hasUrgent: false, expiresInHours: 48 },
  weightResult: { candidates: [], selectedIndex: -1 },
};

describe("checkAccountSetupRule", () => {
  it("should match for new stage", () => {
    const result = checkAccountSetupRule({ ...baseCtx, stage: "new" });
    expect(result.matched).toBe(true);
    if (result.matched) {
      expect(result.suggestion.type).toBe("account_setup");
    }
  });

  it("should not match for growing stage", () => {
    const result = checkAccountSetupRule({ ...baseCtx, stage: "growing" });
    expect(result.matched).toBe(false);
  });
});

describe("checkHomogeneityRule", () => {
  it("should match for severe homogeneity", () => {
    const result = checkHomogeneityRule({ ...baseCtx, homogeneity: { severity: "severe", score: 85 } });
    expect(result.matched).toBe(true);
    if (result.matched) expect(result.suggestion.type).toBe("homogeneity_warning");
  });

  it("should not match for mild homogeneity", () => {
    const result = checkHomogeneityRule({ ...baseCtx, homogeneity: { severity: "mild", score: 40 } });
    expect(result.matched).toBe(false);
  });
});

describe("checkHotUrgencyRule", () => {
  it("should match for urgent hot topic", () => {
    const result = checkHotUrgencyRule({ ...baseCtx, hotUrgency: { hasUrgent: true, expiresInHours: 12 } });
    expect(result.matched).toBe(true);
    if (result.matched) expect(result.suggestion.type).toBe("hot_topic");
  });

  it("should not match for non-urgent hot topic", () => {
    const result = checkHotUrgencyRule({ ...baseCtx, hotUrgency: { hasUrgent: true, expiresInHours: 36 } });
    expect(result.matched).toBe(false);
  });
});

describe("evaluatePriorityRules", () => {
  it("should return first matching rule", () => {
    // New stage + urgent hot → should match account_setup first
    const ctx: PipelineContext = {
      ...baseCtx,
      stage: "new",
      hotUrgency: { hasUrgent: true, expiresInHours: 6 },
    };
    const result = evaluatePriorityRules(ctx);
    expect(result.matched).toBe(true);
    if (result.matched) expect(result.suggestion.type).toBe("account_setup");
  });

  it("should return no match when no rules trigger", () => {
    const result = evaluatePriorityRules(baseCtx);
    expect(result.matched).toBe(false);
  });
});
