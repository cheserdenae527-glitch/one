import { describe, it, expect, vi } from "vitest";

// Mock callLLM before importing the module
vi.mock("@/lib/ai/client", () => ({
  callLLM: vi.fn().mockResolvedValue("75"),
}));

import {
  matchTrendToMerchant,
  matchContentToMerchant,
  rankTrendsForMerchant,
} from "../analysis/merchant-matcher";

import {
  MATCH_DIMENSION_WEIGHTS,
  CUISINE_GROUPS,
  STAGE_CONTENT_PREFERENCES,
} from "../analysis/types";

import type { TrendAnalysisResult } from "../analysis/types";
import type { StoreInfo } from "@/types";

// ── Mock Data ──────────────────────────────────

const baseMockAnalysis: TrendAnalysisResult = {
  postInfo: {
    title: "成都火锅哪家强？本地人实测3家不踩雷",
    platform: "小红书",
    likes: 1500,
    saves: 600,
    comments: 120,
    publishTime: "2026-07-27",
  },
  topic: {
    primaryCategory: "火锅",
    angle: "横评对比",
    replayable: true,
    replayHint: "换城市和菜系",
  },
  hook: { type: "问题式", text: "成都火锅哪家强？", effectiveness: "高" },
  structure: { pattern: "问题→对比→总结", bodyLength: 800, paragraphCount: 10, imageTextRatio: "图文并茂" },
  toneAndKeywords: { tone: "本地人实测·真实分享", keywords: ["火锅", "成都"], keywordStrategy: "长尾词覆盖" },
  engagementTriggers: { likesWhy: "真实感强", savesWhy: "收藏做攻略", shareWhy: "社交货币" },
  comments: {
    totalCommentCount: 80,
    topWords: ["地址", "人均", "锅底"],
    sentimentDistribution: { "正面": "85%", "中性": "12%", "负面": "3%" },
    realUserSignals: ["多人提到去过", "本地人认证"],
    controversyPoints: [],
  },
  whyItWorks: {
    summary: "问题钩子+本地人视角+对比结构",
    replicabilityScore: 9,
    replicableElements: ["钩子", "结构"],
    riskFactors: [],
  },
};

const mockStore: StoreInfo = {
  id: "s1",
  name: "老成都火锅",
  cuisineType: "重庆老火锅",
  priceRange: "人均80",
  address: "成都建设路",
  city: "成都市",
  dianpingUrl: "https://www.dianping.com/shop/123",
  xiaohongshuUrl: "https://www.xiaohongshu.com/user/456",
  douyinUrl: "",
  accountStage: "growing",
};

// ── Helper Tests ───────────────────────────────

describe("merchant-matcher", () => {
  it("should export all functions", () => {
    expect(matchTrendToMerchant).toBeDefined();
    expect(matchContentToMerchant).toBeDefined();
    expect(rankTrendsForMerchant).toBeDefined();
  });

  it("MATCH_DIMENSION_WEIGHTS sums to 1", () => {
    const sum = Object.values(MATCH_DIMENSION_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - 1)).toBeLessThan(0.01);
  });

  // ── matchContentToMerchant ──────────────────

  describe("matchContentToMerchant", () => {
    it("returns a promise with correct shape", async () => {
      const result = await matchContentToMerchant(baseMockAnalysis, mockStore, null);
      expect(result).toHaveProperty("relevanceToYou");
      expect(result.relevanceToYou).toHaveProperty("score");
      expect(result.relevanceToYou).toHaveProperty("breakdown");
      expect(result.relevanceToYou).toHaveProperty("matchReason");
      expect(result).toHaveProperty("howToAdapt");
      expect(result).toHaveProperty("actionPriority");
      expect(result).toHaveProperty("suggestedAction");
    });

    it("returns dimension breakdown with all 6 dimensions", async () => {
      const result = await matchContentToMerchant(baseMockAnalysis, mockStore, null);
      const breakdown = result.relevanceToYou.breakdown;
      expect(breakdown).toHaveProperty("cuisine");
      expect(breakdown).toHaveProperty("price");
      expect(breakdown).toHaveProperty("location");
      expect(breakdown).toHaveProperty("persona");
      expect(breakdown).toHaveProperty("platform");
      expect(breakdown).toHaveProperty("stage");

      // Each dimension has score, weight, detail
      for (const key of Object.keys(breakdown) as Array<keyof typeof breakdown>) {
        expect(breakdown[key]).toHaveProperty("score");
        expect(breakdown[key]).toHaveProperty("weight");
        expect(breakdown[key]).toHaveProperty("detail");
        expect(typeof breakdown[key].score).toBe("number");
        expect(typeof breakdown[key].detail).toBe("string");
      }
    });

    it("scores high for same-cuisine + same-city content", async () => {
      const result = await matchContentToMerchant(baseMockAnalysis, mockStore, null);
      // Cuisine (火锅 vs 重庆老火锅) should be ≥ 70, Location (成都) should be ≥ 70
      expect(result.relevanceToYou.breakdown.cuisine.score).toBeGreaterThanOrEqual(70);
      expect(result.relevanceToYou.breakdown.location.score).toBeGreaterThanOrEqual(70);
      // Overall should be at least medium
      expect(["high", "medium"]).toContain(result.actionPriority);
    });

    it("scores lower for different cuisine", async () => {
      const diffStore: StoreInfo = { ...mockStore, cuisineType: "日料" };
      const result = await matchContentToMerchant(baseMockAnalysis, diffStore, null);
      const originalResult = await matchContentToMerchant(baseMockAnalysis, mockStore, null);
      expect(result.relevanceToYou.score).toBeLessThanOrEqual(originalResult.relevanceToYou.score);
    });

    it("scores lower for different city", async () => {
      const farStore: StoreInfo = { ...mockStore, city: "上海市", address: "上海南京路" };
      const result = await matchContentToMerchant(baseMockAnalysis, farStore, null);
      expect(result.relevanceToYou.breakdown.location.score).toBeLessThanOrEqual(50);
    });

    it("handles no persona gracefully", async () => {
      const result = await matchContentToMerchant(baseMockAnalysis, mockStore, null);
      expect(result.relevanceToYou.breakdown.persona.score).toBeGreaterThanOrEqual(0);
      expect(result.relevanceToYou.breakdown.persona.score).toBeLessThanOrEqual(100);
    });

    it("prefers bound platforms", async () => {
      const dianpingAnalysis = { ...baseMockAnalysis, postInfo: { ...baseMockAnalysis.postInfo, platform: "大众点评" } };
      const xiaohongshuAnalysis = { ...baseMockAnalysis, postInfo: { ...baseMockAnalysis.postInfo, platform: "小红书" } };
      const douyinAnalysis = { ...baseMockAnalysis, postInfo: { ...baseMockAnalysis.postInfo, platform: "抖音" } };

      const dianpingResult = await matchContentToMerchant(dianpingAnalysis, mockStore, null);
      const xiaohongshuResult = await matchContentToMerchant(xiaohongshuAnalysis, mockStore, null);
      const douyinResult = await matchContentToMerchant(douyinAnalysis, mockStore, null);

      // 小红书和大众点评已绑定 → 高分；抖音未绑定 → 低分
      expect(xiaohongshuResult.relevanceToYou.breakdown.platform.score).toBe(100);
      expect(dianpingResult.relevanceToYou.breakdown.platform.score).toBe(100);
      expect(douyinResult.relevanceToYou.breakdown.platform.score).toBeLessThan(100);
    });

    it("returns platformSpecificity when platform bound", async () => {
      const result = await matchContentToMerchant(baseMockAnalysis, mockStore, null);
      expect(result.platformSpecificity).toBeDefined();
      // 小红书绑定 → 建议小红书
      expect(result.platformSpecificity?.suggestedPlatform).toBe("xiaohongshu");
    });

    it("generates adaptation suggestions", async () => {
      const result = await matchContentToMerchant(baseMockAnalysis, mockStore, null);
      expect(result.howToAdapt.length).toBeGreaterThanOrEqual(1);
      // First adaptation should always be about angle
      expect(result.howToAdapt[0].element).toBe("切入角度");
    });

    it("prefers stage-aligned content angles", async () => {
      const growingStore: StoreInfo = { ...mockStore, accountStage: "growing" };
      const matureStore: StoreInfo = { ...mockStore, accountStage: "mature" };

      const growingResult = await matchContentToMerchant(baseMockAnalysis, growingStore, null);
      const matureResult = await matchContentToMerchant(baseMockAnalysis, matureStore, null);

      // "横评对比" 是 growing 期的偏好，growing 期得分应高于 mature 期
      expect(growingResult.relevanceToYou.breakdown.stage.score)
        .toBeGreaterThanOrEqual(matureResult.relevanceToYou.breakdown.stage.score);
    });

    it("handles new_account_stage", async () => {
      const newStore: StoreInfo = { ...mockStore, accountStage: "new" };
      const result = await matchContentToMerchant(baseMockAnalysis, newStore, null);
      expect(result.relevanceToYou.breakdown.stage.score).toBeGreaterThanOrEqual(0);
    });
  });

  // ── matchTrendToMerchant (backward compat) ──

  describe("matchTrendToMerchant (backward compat)", () => {
    it("returns same shape as matchContentToMerchant", async () => {
      const result = await matchTrendToMerchant(baseMockAnalysis, mockStore);
      expect(result).toHaveProperty("relevanceToYou");
      expect(result.relevanceToYou).toHaveProperty("score");
      expect(result.relevanceToYou).toHaveProperty("breakdown");
    });
  });

  // ── rankTrendsForMerchant ────────────────────

  describe("rankTrendsForMerchant", () => {
    it("ranks multiple analyses by match score", async () => {
      const similarAnalysis: TrendAnalysisResult = { ...baseMockAnalysis };
      const diffAnalysis: TrendAnalysisResult = {
        ...baseMockAnalysis,
        topic: { ...baseMockAnalysis.topic, primaryCategory: "烘焙" },
        toneAndKeywords: { ...baseMockAnalysis.toneAndKeywords, tone: "甜品探店" },
      };
      const farAnalysis: TrendAnalysisResult = {
        ...baseMockAnalysis,
        postInfo: { ...baseMockAnalysis.postInfo, platform: "抖音" },
        topic: { ...baseMockAnalysis.topic, primaryCategory: "西餐" },
      };

      const ranked = await rankTrendsForMerchant(
        [farAnalysis, diffAnalysis, similarAnalysis],
        mockStore,
        null,
      );

      expect(ranked).toHaveLength(3);
      // Should be in descending order of score
      expect(ranked[0].match.relevanceToYou.score)
        .toBeGreaterThanOrEqual(ranked[1].match.relevanceToYou.score);
      expect(ranked[1].match.relevanceToYou.score)
        .toBeGreaterThanOrEqual(ranked[2].match.relevanceToYou.score);
    });

    it("returns correct item structure", async () => {
      const ranked = await rankTrendsForMerchant([baseMockAnalysis], mockStore, null);
      expect(ranked[0]).toHaveProperty("analysis");
      expect(ranked[0]).toHaveProperty("match");
      expect(ranked[0].analysis.postInfo.title).toBe(baseMockAnalysis.postInfo.title);
    });

    it("handles empty input", async () => {
      const ranked = await rankTrendsForMerchant([], mockStore, null);
      expect(ranked).toHaveLength(0);
    });
  });
});
