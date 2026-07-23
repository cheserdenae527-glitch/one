import { callLLM } from "@/lib/ai/client";
import type { AgentTool, AgentContext } from "../types";

interface WeeklyPlanInput {
  preferences?: string;
}

interface WeeklyPlanOutput {
  weekPlan: Array<{
    day: string;
    platform: string;
    contentType: string;
    topic: string;
    description: string;
  }>;
}

const planningTool: AgentTool<WeeklyPlanInput, WeeklyPlanOutput> = {
  name: "create_weekly_plan",
  description: "生成一周内容排期，包含每天的主题、平台、内容类型",
  parameters: {
    type: "object",
    properties: {
      preferences: { type: "string", description: "内容偏好说明" },
    },
  },
  execute: async (input, context) => {
    const prompt = `你是一位餐饮内容运营专家。为以下商家生成一周内容排期：

店铺：${context.storeInfo.name || "餐饮店"}
品类：${context.storeInfo.cuisineType || "餐饮"}
${context.persona ? `人设：${context.persona.tone}` : ""}
偏好：${input.preferences || "常规运营"}

输出 JSON 数组，7 天每天一条：
[
  {
    "day": "周一",
    "platform": "小红书/大众点评/抖音",
    "contentType": "文案类型",
    "topic": "内容主题",
    "description": "内容简介"
  }
]

只返回 JSON 数组。`;

    const result = await callLLM(prompt, 1024);
    return { weekPlan: JSON.parse(result) };
  },
};

export default planningTool;
