import type { StoreInfo, BrandPersona, HotContent, Template } from "@/types";
import { callLLM } from "./client";

export async function generateContent(params: {
  storeInfo: Partial<StoreInfo>;
  persona?: BrandPersona;
  contentType: string;
  platform: string;
  referenceContent?: Partial<HotContent>;
  template?: Template;
  tone?: string;
  length: "short" | "medium" | "long";
}) {
  let prompt = `店铺：${params.storeInfo.name}\n菜系：${params.storeInfo.cuisineType}\n`;
  if (params.persona) {
    prompt += `人设：${params.persona.position}\n语气：${params.persona.tone}\n`;
  }
  prompt += `类型：${params.contentType}\n平台：${params.platform}\n`;

  if (params.referenceContent?.title) {
    prompt += `参考标题：${params.referenceContent.title}\n`;
  }
  if (params.template) {
    prompt += `模板结构：${params.template.description}\n`;
  }

  prompt += `请生成${params.length === "short" ? "短" : params.length === "medium" ? "中" : "长"}文案。`;

  return callLLM(prompt);
}
