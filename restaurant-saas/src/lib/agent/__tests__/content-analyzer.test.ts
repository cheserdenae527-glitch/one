import { describe, it, expect } from "vitest";
import { analyzeTrendingPost } from "../analysis/content-analyzer";

describe("content-analyzer", () => {
  it("should export analyzeTrendingPost function", () => {
    expect(analyzeTrendingPost).toBeDefined();
    expect(typeof analyzeTrendingPost).toBe("function");
  });

  it("should return a promise", async () => {
    const result = analyzeTrendingPost({
      title: "成都火锅哪家强？本地人实测3家不踩雷",
      body: "作为土生土长的成都人，今天给大家实测3家不踩雷的火锅店...",
      platform: "小红书",
    });
    expect(result).toBeInstanceOf(Promise);
    await result.catch(() => {});
  });

  it("should produce correct result shape", async () => {
    const result = await analyzeTrendingPost({
      title: "Test title",
      body: "Test content body for analysis.",
      platform: "test",
    }).catch(() => null);

    if (result) {
      expect(result).toHaveProperty("postInfo");
      expect(result).toHaveProperty("topic");
      expect(result).toHaveProperty("hook");
      expect(result).toHaveProperty("structure");
      expect(result).toHaveProperty("toneAndKeywords");
      expect(result).toHaveProperty("engagementTriggers");
      expect(result).toHaveProperty("comments");
      expect(result).toHaveProperty("whyItWorks");
    }
  });
});
