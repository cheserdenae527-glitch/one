import { describe, it, expect } from "vitest";
import { selectTemplates } from "@/lib/ai/template-matcher";

const mockTemplates = [
  { id: "1", name: "横评对比", description: "", angle: "专业评测", format: "列表体", structure: [], hook: "直白式", tone: ["专业评测"], cuisines: ["火锅", "烧烤"], platforms: ["dianping", "xiaohongshu"], weight: 0.85, status: "active", stages: [], promptTemplate: "", storeWeightOffsets: {}, usageCount: 0, skipCount: 0, createdAt: "2026-07-24" },
  { id: "2", name: "单品深挖", description: "", angle: "单品深挖", format: "列表体", structure: [], hook: "直白式", tone: ["老字号口碑"], cuisines: ["火锅", "川菜"], platforms: ["dianping"], weight: 0.72, status: "active", stages: [], promptTemplate: "", storeWeightOffsets: {}, usageCount: 0, skipCount: 0, createdAt: "2026-07-24" },
  { id: "3", name: "场景引发", description: "", angle: "场景打卡", format: "合集体", structure: [], hook: "悬念式", tone: ["年轻人打卡"], cuisines: ["火锅", "日料"], platforms: ["xiaohongshu", "douyin"], weight: 0.68, status: "active", stages: [], promptTemplate: "", storeWeightOffsets: {}, usageCount: 0, skipCount: 0, createdAt: "2026-07-24" },
  { id: "4", name: "科普教育", description: "", angle: "科普教育", format: "单篇详评", structure: [], hook: "问题式", tone: ["专业评测"], cuisines: ["川菜"], platforms: ["xiaohongshu"], weight: 0.5, status: "active", stages: [], promptTemplate: "", storeWeightOffsets: {}, usageCount: 0, skipCount: 0, createdAt: "2026-07-24" },
  { id: "5", name: "横评对比", description: "", angle: "专业评测", format: "列表体", structure: [], hook: "直白式", tone: [], cuisines: ["火锅"], platforms: ["dianping"], weight: 0.3, status: "inactive", stages: [], promptTemplate: "", storeWeightOffsets: {}, usageCount: 0, skipCount: 0, createdAt: "2026-07-24" },
];

describe("selectTemplates", () => {
  it("returns 3 diverse candidates", () => {
    const result = selectTemplates(
      { cuisine: "火锅", platform: "大众点评", recentAngles: [], stage: "" },
      mockTemplates
    );
    expect(result.candidates.length).toBe(2);
    const angles = result.candidates.map((c: any) => c.name);
    expect(new Set(angles).size).toBe(2);
  });

  it("excludes recently used angles when possible", () => {
    const result = selectTemplates(
      { cuisine: "火锅", platform: "大众点评", recentAngles: ["横评对比"], stage: "" },
      mockTemplates
    );
    expect(result.candidates.every((c: any) => c.name !== "横评对比")).toBe(true);
  });

  it("returns null selected when no templates match", () => {
    const result = selectTemplates(
      { cuisine: "西餐", platform: "抖音", recentAngles: [], stage: "" },
      mockTemplates
    );
    expect(result.selected).toBeNull();
  });
});
