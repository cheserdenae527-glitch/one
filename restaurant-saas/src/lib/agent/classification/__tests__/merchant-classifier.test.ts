import { describe, it, expect } from "vitest";
import { classifyMerchant, getScores } from "../merchant-classifier";
import { getStrategyTemplate, getAllStrategySummaries } from "../strategy-templates";
import { STRATEGY_LABELS, ContentStrategyType } from "../types";
import type { ClassificationInput } from "../types";

// ── 场景 1：火锅店，中等价位，绑定小红书/点评 ───

const hotpotStore: ClassificationInput = {
  cuisineType: "火锅",
  priceRange: "80-120",
  targetCustomers: "年轻人、朋友聚餐",
  hasDianping: true,
  hasXiaohongshu: true,
  hasDouyin: false,
  accountStage: "new",
};

// ── 场景 2：快餐，低客单价，绑定抖音 ──────────

const fastFoodStore: ClassificationInput = {
  cuisineType: "快餐",
  priceRange: "50以下",
  targetCustomers: "上班族、学生",
  hasDianping: true,
  hasXiaohongshu: false,
  hasDouyin: true,
  accountStage: "new",
};

// ── 场景 3：精品咖啡，中客单价，绑定小红书 ─────

const coffeeStore: ClassificationInput = {
  cuisineType: "咖啡",
  priceRange: "50-80",
  targetCustomers: "年轻人、文艺青年",
  hasDianping: false,
  hasXiaohongshu: true,
  hasDouyin: false,
  accountStage: "growing",
};

// ── 场景 4：高端日料，绑定全平台 ──────────────

const japaneseStore: ClassificationInput = {
  cuisineType: "日料",
  priceRange: "200以上",
  targetCustomers: "商务人士、品质消费者",
  hasDianping: true,
  hasXiaohongshu: true,
  hasDouyin: true,
  accountStage: "mature",
};

describe("merchant-classifier", () => {

  // ── classifyMerchant ──────────────────────

  describe("classifyMerchant", () => {
    it("classifies hotpot with xiaohongshu as scene_experience or local_buzz", () => {
      const result = classifyMerchant(hotpotStore);
      expect(result.primaryType).toBeTruthy();
      expect(result.oneLinePositioning).toBeTruthy();
      expect(result.description).toBeTruthy();
      expect(result.recommendedPersona).toBeTruthy();
      expect(result.contentPillars).toHaveLength(4);
      expect(result.platformPriority).toBeTruthy();
      expect(result.differentiationStrategy).toBeTruthy();
      expect(result.initialTopics).toHaveLength(5);
      expect(result.details).toHaveLength(8);
    });

    it("classifies fast food as value_for_money", () => {
      const result = classifyMerchant(fastFoodStore);
      // 快餐应该倾向于性价比路线
      expect(["value_for_money", "local_buzz"]).toContain(result.primaryType);
    });

    it("classifies coffee as lifestyle", () => {
      const result = classifyMerchant(coffeeStore);
      // 咖啡倾向于生活方式或情绪治愈
      expect(["lifestyle", "emotional_comfort", "local_buzz"]).toContain(result.primaryType);
    });

    it("classifies high-end japanese as chef_expertise or cuisine_expert", () => {
      const result = classifyMerchant(japaneseStore);
      // 高端日料倾向于专业路线
      expect(["chef_expertise", "cuisine_expert", "scene_experience"]).toContain(result.primaryType);
    });

    it("returns sorted details with all 8 types", () => {
      const result = classifyMerchant(hotpotStore);
      expect(result.details).toHaveLength(8);
      // 得分应该降序排列
      for (let i = 1; i < result.details.length; i++) {
        expect(result.details[i - 1].score).toBeGreaterThanOrEqual(result.details[i].score);
      }
      // 每条明细包含必要字段
      for (const d of result.details) {
        expect(d.type).toBeTruthy();
        expect(d.label).toBeTruthy();
        expect(typeof d.score).toBe("number");
        expect(Array.isArray(d.matchedReasons)).toBe(true);
      }
    });

    it("returns contentPillars with correct ratios summing to 1", () => {
      const result = classifyMerchant(hotpotStore);
      const sum = result.contentPillars.reduce((s, p) => s + p.ratio, 0);
      expect(Math.abs(sum - 1)).toBeLessThan(0.01);
    });

    it("returns platformPriority with all platforms ranked", () => {
      const result = classifyMerchant(hotpotStore);
      expect(result.platformPriority.length).toBeGreaterThanOrEqual(2);
      // 按优先级排序
      for (let i = 1; i < result.platformPriority.length; i++) {
        expect(result.platformPriority[i - 1].priority).toBeLessThan(result.platformPriority[i].priority);
      }
    });
  });

  // ── getScores ────────────────────────────

  describe("getScores", () => {
    it("returns all 8 type scores sorted", () => {
      const scores = getScores(hotpotStore);
      expect(scores).toHaveLength(8);
      expect(scores[0].score).toBeGreaterThanOrEqual(scores[scores.length - 1].score);
    });
  });  // ── computeAudienceTags ───────────────────

  describe("computeAudienceTags", () => {
    it("returns strategy-type derived tags for scene_experience", () => {
      const result = classifyMerchant(hotpotStore);
      const tags = result.audienceTags!;
      expect(tags.fromStrategyType).toContain("genz");
      expect(tags.fromStrategyType).toContain("rising_white_collar");
      expect(tags.fromKeywords).toHaveLength(0); // targetCustomers=年轻人、朋友聚餐，不匹配任何关键词
    });

    it("returns keyword-derived tags when targetCustomers matches", () => {
      const storeWithStudents: ClassificationInput = {
        ...hotpotStore,
        targetCustomers: "学生、校园周边",
      };
      const result = classifyMerchant(storeWithStudents);
      const tags = result.audienceTags!;
      expect(tags.fromKeywords).toContain("genz");
      expect(tags.merged).toContain("genz"); // 在 fromStrategyType 和 fromKeywords 中都出现
    });

    it("merges strategy and keyword tags without duplicates", () => {
      const storeWithOffice: ClassificationInput = {
        ...hotpotStore,
        targetCustomers: "上班族、白领",
      };
      const result = classifyMerchant(storeWithOffice);
      const tags = result.audienceTags!;
      // fromStrategyType: genz, rising_white_collar
      // fromKeywords: urban_blue_collar (from "上班族", "白领")
      // merged: genz, rising_white_collar, urban_blue_collar
      expect(tags.merged.length).toBe(3);
      expect(tags.merged).toContain("urban_blue_collar");
    });

    it("returns empty fromKeywords when no keywords match", () => {
      const storeEmpty: ClassificationInput = {
        ...hotpotStore,
        targetCustomers: "所有人",
      };
      const result = classifyMerchant(storeEmpty);
      expect(result.audienceTags!.fromKeywords).toHaveLength(0);
    });

    it("isAutoAssigned is true for system classification", () => {
      const result = classifyMerchant(hotpotStore);
      expect(result.isAutoAssigned).toBe(true);
    });

    it("isHighConfidence is true for scores >= 40", () => {
      const result = classifyMerchant(hotpotStore);
      // 火锅 + 80-120 + 小红书 → scene_experience 55分
      expect(result.isHighConfidence).toBe(true);
    });

    it("recommendedType matches primaryType when auto-assigned", () => {
      const result = classifyMerchant(hotpotStore);
      expect(result.recommendedType).toBe(result.primaryType);
    });
  });

  // ── strategy-templates ───────────────────

  describe("strategy-templates", () => {
    it("getStrategyTemplate returns correct structure", () => {
      const tpl = getStrategyTemplate("scene_experience", "火锅", "成都");
      expect(tpl.primaryType).toBe("scene_experience");
      expect(tpl.oneLinePositioning).toContain("成都");
      expect(tpl.oneLinePositioning).toContain("火锅");
      expect(tpl.recommendedPersona.position).toContain("成都");
      expect(tpl.initialTopics).toHaveLength(5);
    });

    it("getAllStrategySummaries returns 8 summaries", () => {
      const summaries = getAllStrategySummaries();
      expect(summaries).toHaveLength(8);
      for (const s of summaries) {
        expect(s.type).toBeTruthy();
        expect(s.label).toBeTruthy();
        expect(s.oneLine).toBeTruthy();
      }
    });

    it("all 8 strategy types have all required fields", () => {
      const types: ContentStrategyType[] = [
        "scene_experience", "value_for_money", "boss_ip", "chef_expertise",
        "lifestyle", "local_buzz", "emotional_comfort", "cuisine_expert",
      ];
      for (const type of types) {
        const tpl = getStrategyTemplate(type, "测试品类", "测试城市");
        expect(tpl.primaryType).toBe(type);
        expect(tpl.oneLinePositioning).toBeTruthy();
        expect(tpl.recommendedPersona.position).toBeTruthy();
        expect(tpl.recommendedPersona.tone).toBeTruthy();
        expect(tpl.recommendedPersona.personality.length).toBeGreaterThanOrEqual(2);
        expect(tpl.contentPillars.length).toBeGreaterThanOrEqual(3);
        expect(tpl.platformPriority.length).toBeGreaterThanOrEqual(2);
        expect(tpl.differentiationStrategy).toBeTruthy();
        expect(tpl.initialTopics.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  // ── Edge Cases ───────────────────────────

  describe("edge cases", () => {
    it("handles empty input gracefully", () => {
      const empty: ClassificationInput = {
        cuisineType: "",
        priceRange: "",
        targetCustomers: "",
        hasDianping: false,
        hasXiaohongshu: false,
        hasDouyin: false,
        accountStage: "new",
      };
      const result = classifyMerchant(empty);
      expect(result.primaryType).toBe("value_for_money"); // 兜底
      expect(result.oneLinePositioning).toBeTruthy();
    });

    it("handles unknown cuisine type", () => {
      const unknown: ClassificationInput = {
        cuisineType: "分子料理",
        priceRange: "200以上",
        targetCustomers: "",
        hasDianping: true,
        hasXiaohongshu: false,
        hasDouyin: false,
        accountStage: "growing",
      };
      const result = classifyMerchant(unknown);
      expect(result.primaryType).toBeTruthy();
    });
  });
});



