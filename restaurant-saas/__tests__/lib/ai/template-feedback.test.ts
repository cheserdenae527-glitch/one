import { describe, it, expect } from "vitest";
import { updateTemplateWeight, getDeprecatedTemplates } from "@/lib/ai/template-feedback";

describe("updateTemplateWeight", () => {
  it("increases weight on publish", () => {
    const tpl = { weight: 0.5 };
    expect(updateTemplateWeight(tpl, "publish")).toBe(0.8);
  });

  it("decreases weight on regenerate", () => {
    const tpl = { weight: 0.5 };
    expect(updateTemplateWeight(tpl, "regenerate")).toBe(0.4);
  });

  it("clamps weight between 0 and 1", () => {
    const tpl = { weight: 0.95 };
    expect(updateTemplateWeight(tpl, "publish")).toBe(1);
    expect(updateTemplateWeight(tpl, "reject_thrice")).toBe(0);
  });
});

describe("getDeprecatedTemplates", () => {
  it("marks old unused templates as deprecated", () => {
    const old = Date.now() - 40 * 24 * 60 * 60 * 1000;
    const templates = [
      { weight: 0.05, updatedAt: Date.now(), usageCount: 0 },
      { weight: 0.5, updatedAt: old, usageCount: 1 },
      { weight: 0.5, updatedAt: old, usageCount: 0 },
    ];
    expect(getDeprecatedTemplates(templates).length).toBeGreaterThanOrEqual(2);
  });
});
