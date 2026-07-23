import type { AgentTool, AgentContext } from "../types";
import { generateContent } from "@/lib/ai/content-generator";
import { generatePersonaOptions } from "@/lib/ai/persona";

// 懒加载所有工具
const toolModules: (() => Promise<{ default: AgentTool }>)[] = [
  () => import("./trending-analyzer"),
  () => import("./hot-topics"),
  () => import("./planning"),
  () => import("./homogeneity"),
  () => import("./weight-calculator"),
];

export function createToolRegistry() {
  const tools = new Map<string, AgentTool>();

  return {
    async init(): Promise<void> {
      const loaded = await Promise.all(toolModules.map(load => load()));
      for (const mod of loaded) {
        const tool = mod.default;
        tools.set(tool.name, tool);
      }
    },
    getTool(name: string): AgentTool | null {
      return tools.get(name) ?? null;
    },
    listTools(): AgentTool[] {
      return Array.from(tools.values());
    },
  };
}

// 包装已有 generateContent 为 AgentTool
export function wrapContentGenerator(): AgentTool {
  return {
    name: "generate_content",
    description: "生成餐饮内容文案（大众点评/小红书/抖音/促销）",
    parameters: {
      type: "object",
      properties: {
        contentType: { type: "string", "enum": ["dianping", "xiaohongshu", "promotion", "reply", "douyin"] },
        platform: { type: "string" },
        tone: { type: "string" },
        length: { type: "string", "enum": ["short", "medium", "long"] },
      },
      required: ["contentType", "platform"],
    },
    execute: async (input: any, context: AgentContext) => {
      const result = await generateContent({
        contentType: input.contentType,
        platform: input.platform,
        tone: input.tone || context.persona?.tone,
        length: input.length || "medium",
        storeInfo: context.storeInfo,
        persona: context.persona,
      });
      return { content: result };
    },
  };
}

// 包装已有 generatePersonaOptions 为 AgentTool
export function wrapPersonaGenerator(): AgentTool {
  return {
    name: "generate_persona",
    description: "生成品牌人设方案",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    execute: async (_input: any, context: AgentContext) => {
      const options = await generatePersonaOptions({
        name: context.storeInfo.name || "",
        cuisineType: context.storeInfo.cuisineType || "",
        signatureDishes: [],
        targetCustomers: context.storeInfo.targetCustomers || "",
        priceRange: context.storeInfo.priceRange || "",
      });
      return { personaOptions: options };
    },
  };
}
