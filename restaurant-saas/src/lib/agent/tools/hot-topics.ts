import { callLLM } from "@/lib/ai/client";
import type { AgentTool, AgentContext } from "../types";

interface HotTopicsInput {
  cuisineType?: string;
  city?: string;
  platform?: string;
}

interface HotTopicsOutput {
  topics: Array<{
    topic: string;
    relevance: string;
    suggestedAction: string;
    deadline: string;
    trendingReason: string;
  }>;
  seasonalAlerts: string[];
}

const hotTopicsTool: AgentTool<HotTopicsInput, HotTopicsOutput> = {
  name: "analyze_hot_topics",
  description: "分析当前话题趋势，评估与商家的关系，返回可执行的热点建议",
  parameters: {
    type: "object",
    properties: {
      cuisineType: { type: "string", description: "商家菜系" },
      city: { type: "string", description: "所在城市" },
      platform: { type: "string", description: "目标平台" },
    },
  },
  execute: async (input, context: AgentContext) => {
    const prompt = `你是一位餐饮趋势分析师。根据以下商家信息分析当前热点话题：

${input.cuisineType || context.storeInfo.cuisineType || "餐饮"}品类
${input.city || context.storeInfo.address || "本地"}市场
${input.platform || "全平台"}平台

请分析当前适合这个商家的热点趋势，输出 JSON：
{
  "topics": [
    {
      "topic": "话题名称",
      "relevance": "与商家的相关度（高/中/低）及原因",
      "suggestedAction": "建议的具体行动",
      "deadline": "建议发布的截止时间",
      "trendingReason": "这个话题为什么热门"
    }
  ],
  "seasonalAlerts": ["季节性提醒1", "季节性提醒2"]
}

只返回 JSON。`;

    const result = await callLLM(prompt, 1024);
    return JSON.parse(result) as HotTopicsOutput;
  },
};

export default hotTopicsTool;
