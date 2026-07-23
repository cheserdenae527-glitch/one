import { describe, it, expect } from "vitest";
import { matchTrendToMerchant } from "../analysis/merchant-matcher";
import type { TrendAnalysisResult } from "../analysis/types";
import type { StoreInfo } from "@/types";

const mockAnalysis: TrendAnalysisResult = {
  postInfo: { title: "Test", platform: "小红书", likes: 100, saves: 50, comments: 20, publishTime: "2026-07-23" },
  topic: { primaryCategory: "火锅", angle: "横评对比", replayable: true, replayHint: "换城市和菜系" },
  hook: { type: "问题式", text: "成都火锅哪家强？", effectiveness: "高" },
  structure: { pattern: "问题→对比→总结", bodyLength: 400, paragraphCount: 8, imageTextRatio: "图文并茂" },
  toneAndKeywords: { tone: "本地人实测", keywords: ["火锅", "成都"], keywordStrategy: "长尾词覆盖" },
  engagementTriggers: { likesWhy: "真实性强", savesWhy: "收藏参考", shareWhy: "社交货币" },
  comments: { totalCommentCount: 50, topWords: ["地址", "人均"], sentimentDistribution: { "正面": "80%" }, realUserSignals: ["多人提到去过"], controversyPoints: [] },
  whyItWorks: { summary: "问题钩子+对比结构", replicabilityScore: 8, replicableElements: ["钩子", "结构"], riskFactors: [] },
};

const mockStore: StoreInfo = {
  id: "s1", name: "老成都火锅",
  cuisineType: "重庆老火锅",
  priceRange: "人均80",
  address: "成都建设路",
  accountStage: "growing",
};

describe("merchant-matcher", () => {
  it("should export matchTrendToMerchant function", () => {
    expect(matchTrendToMerchant).toBeDefined();
    expect(typeof matchTrendToMerchant).toBe("function");
  });

  it("should return a promise", () => {
    const result = matchTrendToMerchant(mockAnalysis, mockStore);
    expect(result).toBeInstanceOf(Promise);
  });

  it("should match high for same cuisine + district", async () => {
    const result = await matchTrendToMerchant(mockAnalysis, mockStore);
    expect(result.relevanceToYou.score).toBeGreaterThanOrEqual(50);
    expect(result.relevanceToYou.matchReason).toBeTruthy();
    expect(result.howToAdapt).toHaveLength(1);
    expect(["high", "medium", "low"]).toContain(result.actionPriority);
  });

  it("should match lower for different cuisine", async () => {
    const diffStore: StoreInfo = { ...mockStore, cuisineType: "日料" };
    const result = await matchTrendToMerchant(mockAnalysis, diffStore);
    const result2 = await matchTrendToMerchant(mockAnalysis, mockStore);
    // Different cuisine should score lower
    expect(result.relevanceToYou.score).toBeLessThanOrEqual(result2.relevanceToYou.score);
  });

  it("should use neutral persona score when no persona set", async () => {
    const result = await matchTrendToMerchant(mockAnalysis, mockStore, null);
    expect(result.relevanceToYou.score).toBeGreaterThanOrEqual(0);
  });
});
