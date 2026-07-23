import { describe, it, expect } from "vitest";
import {
  DEFAULT_WEIGHTS, coldStartAdjustment,
  normalizeScore, calculateFinalScore, shouldMeltdown,
} from "../weight/config";

describe("DEFAULT_WEIGHTS", () => {
  it("should sum positive weights to ~1.0", () => {
    const { homogeneity: _h, ...positive } = DEFAULT_WEIGHTS;
    const sum = Object.values(positive).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 1);
  });

  it("should have homogeneity as negative", () => {
    expect(DEFAULT_WEIGHTS.homogeneity).toBeLessThan(0);
  });
});

describe("coldStartAdjustment", () => {
  it("should return same weights when no missing dimensions", () => {
    const result = coldStartAdjustment(DEFAULT_WEIGHTS, []);
    expect(result.hotMatch).toBe(DEFAULT_WEIGHTS.hotMatch);
  });

  it("should redistribute when history is missing", () => {
    const result = coldStartAdjustment(DEFAULT_WEIGHTS, ["history"]);
    expect(result.history).toBe(0);
    // Remaining positives should sum to 1.0 (excluding penalty)
    const { homogeneity: _h, history: _hist, ...pos } = result;
    const sum = Object.values(pos).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 1);
    // Each remaining weight should be higher than default
    expect(result.hotMatch).toBeGreaterThan(DEFAULT_WEIGHTS.hotMatch);
  });

  it("should handle multiple missing dimensions", () => {
    const result = coldStartAdjustment(DEFAULT_WEIGHTS, ["history", "timeliness"]);
    expect(result.history).toBe(0);
    expect(result.timeliness).toBe(0);
  });
});

describe("normalizeScore", () => {
  it("should map to 0-100 range", () => {
    expect(normalizeScore(50, 0, 100)).toBe(50);
    expect(normalizeScore(0, 0, 100)).toBe(0);
    expect(normalizeScore(100, 0, 100)).toBe(100);
  });

  it("should clamp values", () => {
    expect(normalizeScore(-10, 0, 100)).toBe(0);
    expect(normalizeScore(200, 0, 100)).toBe(100);
  });
});

describe("calculateFinalScore", () => {
  it("should return 100 for perfect scores with no penalty", () => {
    const score = calculateFinalScore(
      { hotMatch: 100, merchantMatch: 100, diversity: 100, history: 100, timeliness: 100, homogeneity: 0 },
      DEFAULT_WEIGHTS
    );
    expect(score).toBe(100);
  });

  it("should deduct for homogeneity penalty", () => {
    const noPenalty = calculateFinalScore(
      { hotMatch: 100, merchantMatch: 100, diversity: 100, history: 100, timeliness: 100, homogeneity: 0 },
      DEFAULT_WEIGHTS
    );
    const withPenalty = calculateFinalScore(
      { hotMatch: 100, merchantMatch: 100, diversity: 100, history: 100, timeliness: 100, homogeneity: 80 },
      DEFAULT_WEIGHTS
    );
    expect(withPenalty).toBeLessThan(noPenalty);
  });

  it("should handle missing dimensions as 0", () => {
    const score = calculateFinalScore(
      { hotMatch: 100, merchantMatch: 100 },
      DEFAULT_WEIGHTS
    );
    expect(score).toBeGreaterThan(0);
  });
});

describe("shouldMeltdown", () => {
  it("should trigger at threshold", () => {
    expect(shouldMeltdown(0.80)).toBe(true);
    expect(shouldMeltdown(0.90)).toBe(true);
    expect(shouldMeltdown(0.79)).toBe(false);
    expect(shouldMeltdown(0.50)).toBe(false);
  });

  it("should use custom threshold", () => {
    expect(shouldMeltdown(0.70, 0.70)).toBe(true);
    expect(shouldMeltdown(0.69, 0.70)).toBe(false);
  });
});
