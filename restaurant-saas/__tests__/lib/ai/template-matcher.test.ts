import { describe, it, expect } from "vitest";
import { selectTemplates } from "@/lib/ai/template-matcher";

const mockTemplates = [
  { id: "1", name: "横评对比", description: "", tone: ["专业评测"], cuisines: ["火锅", "烧烤"], platforms: ["大众点评", "小红书"], weight: 0.85, isActive: true },
  { id: "2", name: "单品深挖", description: "", tone: ["老字号口碑"], cuisines: ["火锅", "川菜"], platforms: ["大众点评"], weight: 0.72, isActive: true },
  { id: "3", name: "场景引发", description: "", tone: ["年轻人打卡"], cuisines: ["火锅", "日料"], platforms: ["小红书", "抖音"], weight: 0.68, isActive: true },
  { id: "4", name: "科普教育", description: "", tone: ["专业评测"], cuisines: ["川菜"], platforms: ["小红书"], weight: 0.5, isActive: true },
  { id: "5", name: "横评对比", description: "", tone: [], cuisines: ["火锅"], platforms: ["大众点评"], weight: 0.3, isActive: false },
];

describe("selectTemplates", () => {
  it("returns 3 diverse candidates", () => {
    const result = selectTemplates(
      { cuisine: "火锅", platform: "大众点评", recentAngles: [] },
      mockTemplates
    );
    expect(result.candidates.length).toBe(2);
    const angles = result.candidates.map((c: any) => c.name);
    expect(new Set(angles).size).toBe(2);
  });

  it("excludes recently used angles when possible", () => {
    const result = selectTemplates(
      { cuisine: "火锅", platform: "大众点评", recentAngles: ["横评对比"] },
      mockTemplates
    );
    expect(result.candidates.every((c: any) => c.name !== "横评对比")).toBe(true);
  });

  it("returns null selected when no templates match", () => {
    const result = selectTemplates(
      { cuisine: "西餐", platform: "抖音", recentAngles: [] },
      mockTemplates
    );
    expect(result.selected).toBeNull();
  });
});

