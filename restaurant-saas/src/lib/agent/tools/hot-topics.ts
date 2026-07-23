import type { AgentTool } from "../types";

export interface HotTopicsInput {
  platform?: string;
  cuisineType?: string;
}

export interface HotTopicsOutput {
  topics: Array<{ keyword: string; heatLevel: number; relevance: string }>;
  seasonalAlerts: Array<{ season: string; suggestion: string }>;
}

const hotTopicsTool: AgentTool<HotTopicsInput, HotTopicsOutput> = {
  name: "analyze_hot_topics",
  description: "分析当前话题趋势，评估与商家的关系",
  parameters: {
    type: "object",
    properties: {
      platform: { type: "string" },
      cuisineType: { type: "string" },
    },
    required: [],
  },
  execute: async (_input, _context) => {
    return { topics: [], seasonalAlerts: [] };
  },
};

export default hotTopicsTool;
