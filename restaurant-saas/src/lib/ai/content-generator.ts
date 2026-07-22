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
  let prompt = `\u5E97\u94FA\uFF1A${params.storeInfo.name}\n\u83DC\u7CFB\uFF1A${params.storeInfo.cuisineType}\n`;
  if (params.persona) {
    prompt += `\u4EBA\u8BBE\uFF1A${params.persona.position}\n\u8BED\u6C14\uFF1A${params.persona.tone}\n`;
  }
  prompt += `\u7C7B\u578B\uFF1A${params.contentType}\n\u5E73\u53F0\uFF1A${params.platform}\n`;

  if (params.referenceContent?.title) {
    prompt += `\u53C2\u8003\u6807\u9898\uFF1A${params.referenceContent.title}\n`;
  }
  if (params.template) {
    prompt += `\u6A21\u677F\u7ED3\u6784\uFF1A${params.template.description}\n`;
  }

  prompt += `\u8BF7\u751F\u6210${params.length === "short" ? "\u77ED" : params.length === "medium" ? "\u4E2D" : "\u957F"}\u6587\u6848\u3002`;

  return callLLM(prompt);
}
