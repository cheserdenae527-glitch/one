import { callLLM } from "@/lib/ai/client";
import type { AgentTool } from "../types";

export interface AnalyzeInput {
  platform?: string;
  cuisineType?: string;
  contentBody: string;
}

export interface AnalyzeOutput {
  hookType: string;
  narrativeStructure: string;
  tone: string;
  keywords: string[];
  engagementTriggers: string[];
  whyItWorks: string;
}

const trendingAnalyzerTool: AgentTool<AnalyzeInput, AnalyzeOutput> = {
  name: "analyze_trending_content",
  description: "对一条热门帖子做内容拆解分析（主题、钩子、结构、语气、关键词、互动、归因）",
  parameters: {
    type: "object",
    properties: {
      platform: { type: "string" },
      cuisineType: { type: "string" },
      contentBody: { type: "string" },
    },
    required: ["contentBody"],
  },
  execute: async (input, _context) => {
    const header = "你是一位内容分析专家。分析以下" + (input.platform || "餐饮") + "内容：\n";
    const prompt = header + input.contentBody + "\n\n请输出以下 JSON 结构：\n{\n  \"hookType\": \"钩子类型（问题式/数字式/反常识/场景代入/数据式/故事式/对比式）\",\n  \"narrativeStructure\": \"叙事结构（总分总/逐条对比/时间线/因果链/故事线/清单体）\",\n  \"tone\": \"语气风格（亲切/专业/烟火气/测评感/探店感/本地人）\",\n  \"keywords\": [\"关键词1\", \"关键词2\"],\n  \"engagementTriggers\": [\"点赞原因\", \"收藏原因\", \"分享原因\"],\n  \"whyItWorks\": \"这篇为什么火的简短分析\"\n}\n只返回 JSON。";
    const result = await callLLM(prompt, 1024);
    return JSON.parse(result);
  },
};

export default trendingAnalyzerTool;

