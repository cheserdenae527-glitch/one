import { callLLM } from "@/lib/ai/client";
import type { AgentTool, AgentContext } from "../types";
import { safeParseLLMJsonOr } from "../json-utils";

export interface HomogeneityInput {
  recentTitles?: string[];
}

export interface HomogeneityOutput {
  severity: "none" | "mild" | "severe";
  score: number;
  suggestions: string[];
}

const homogeneityTool: AgentTool<HomogeneityInput, HomogeneityOutput> = {
  name: "check_homogeneity",
  description: "扫描近期内容，检测同质化程度，提示是否需要换角度",
  parameters: {
    type: "object",
    properties: {
      recentTitles: { type: "array", items: { type: "string" } },
    },
    required: [],
  },
  execute: async (input, _context: AgentContext) => {
    if (!input.recentTitles || input.recentTitles.length < 3) {
      return { severity: "none", score: 0, suggestions: ["内容不足3篇，跳过同质化检查"] };
    }
    const prompt = `分析以下近期发布的内容标题，评估同质化程度（0-100，越高越重复）：
${input.recentTitles.map((t, i) => `${i + 1}. ${t}`).join("\n")}

输出 JSON：
{
  "severity": "none/mild/severe",
  "score": 0-100,
  "suggestions": ["建议1", "建议2"]
}

只返回 JSON。`;
    const result = await callLLM(prompt, 512);

    // 修复点：原来是裸 JSON.parse(result)，模型偶尔带围栏或解释文字就会
    // 直接抛异常。改为安全解析 + 降级值，同时把解析失败记下来方便排查。
    return safeParseLLMJsonOr<HomogeneityOutput>(
      result,
      { severity: "none", score: 0, suggestions: ["同质化检测解析失败，本次跳过"] },
      (err) => console.error("[check_homogeneity] LLM 输出解析失败:", err.message)
    );
  },
};

export default homogeneityTool;
