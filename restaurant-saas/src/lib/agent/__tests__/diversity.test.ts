import { describe, it, expect } from "vitest";
import {
  violatesConstraint, applyL1Degradation, applyL2Degradation,
  selectContentParams, executeDegradationChain,
  HOOK_TYPES, NARRATIVE_STRUCTURES, TONE_STYLES, PACING_STYLES,
} from "../weight/diversity";
import type { ContentParams, ContentMemory } from "../weight/diversity";

describe("Parameter pools", () => {
  it("should have sufficient combinations", () => {
    const total = HOOK_TYPES.length * NARRATIVE_STRUCTURES.length * TONE_STYLES.length * PACING_STYLES.length;
    expect(total).toBeGreaterThanOrEqual(100);
  });
});

describe("violatesConstraint", () => {
  it("should detect duplicate hook type", () => {
    const params: ContentParams = { hookType: "问题式", narrativeStructure: "总分总", toneStyle: "亲切", pacingStyle: "短平快" };
    const memory: ContentMemory = {
      recentParams: [{ hookType: "问题式", narrativeStructure: "逐条对比", toneStyle: "专业", pacingStyle: "图文交错" }],
      maxHistory: 3,
    };
    expect(violatesConstraint(params, memory)).toBe(true);
  });

  it("should allow different hook and structure", () => {
    const params: ContentParams = { hookType: "数字式", narrativeStructure: "清单体", toneStyle: "亲切", pacingStyle: "短平快" };
    const memory: ContentMemory = {
      recentParams: [{ hookType: "问题式", narrativeStructure: "总分总", toneStyle: "专业", pacingStyle: "图文交错" }],
      maxHistory: 3,
    };
    expect(violatesConstraint(params, memory)).toBe(false);
  });
});

describe("executeDegradationChain", () => {
  const baseParams: ContentParams = { hookType: "问题式", narrativeStructure: "故事线", toneStyle: "亲切", pacingStyle: "短平快" };

  it("should return level 0 when no violation", () => {
    const memory: ContentMemory = { recentParams: [{ hookType: "数字式", narrativeStructure: "清单体", toneStyle: "专业", pacingStyle: "图文交错" }], maxHistory: 3 };
    const result = executeDegradationChain(baseParams, memory);
    expect(result.level).toBe(0);
  });

  it("should apply L1 when violation detected", () => {
    const memory: ContentMemory = { recentParams: [baseParams], maxHistory: 3 };
    const result = executeDegradationChain(baseParams, memory);
    expect(result.level).toBeGreaterThanOrEqual(1);
  });

  it("should not exceed level 3", () => {
    const memory: ContentMemory = {
      recentParams: Array(10).fill(baseParams),
      maxHistory: 10,
    };
    const result = executeDegradationChain(baseParams, memory);
    expect(result.level).toBeLessThanOrEqual(3);
  });
});
