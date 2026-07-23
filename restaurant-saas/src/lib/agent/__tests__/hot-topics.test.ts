import { describe, it, expect } from "vitest";
import hotTopicsTool from "../tools/hot-topics";

describe("analyze_hot_topics tool", () => {
  it("should export a valid AgentTool", () => {
    expect(hotTopicsTool.name).toBe("analyze_hot_topics");
    expect(hotTopicsTool.description).toBeTruthy();
    expect(hotTopicsTool.execute).toBeDefined();
  });

  it("should have correct parameters schema", () => {
    expect(hotTopicsTool.parameters).toBeDefined();
    const props = (hotTopicsTool.parameters as any).properties;
    expect(props).toHaveProperty("cuisineType");
    expect(props).toHaveProperty("city");
  });

  it("should return a promise when executed", () => {
    const result = hotTopicsTool.execute(
      { cuisineType: "火锅", city: "成都" },
      { merchantId: "test", storeInfo: { id: "s1", name: "测试店", accountStage: "new" } }
    );
    expect(result).toBeInstanceOf(Promise);
    return result.catch(() => { /* API not configured in test */ });
  });
});
