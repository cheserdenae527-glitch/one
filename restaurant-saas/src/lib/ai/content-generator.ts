import { callLLM } from "./client";
import { CONTENT_TYPE_PROMPTS } from "./prompts";

const KEY_MAP: Record<string, string> = {
  dianping: "dianping_profile", xiaohongshu: "xiaohongshu",
  promotion: "promotion", reply: "review_reply", douyin: "douyin_script",
};

const LEN_MAP: Record<string, string> = {
  short: "简洁（200字左右）", medium: "适中（400字左右）", long: "详细（600字以上）",
};

export async function generateContent(params: {
  contentType: string; platform: string; tone?: string;
  length?: "short" | "medium" | "long";
  referenceContent?: { title?: string };
  storeInfo?: { name?: string; cuisineType?: string };
  persona?: { position?: string; tone?: string };
}) {
  const promptKey = KEY_MAP[params.contentType] || params.contentType;
  let prompt = CONTENT_TYPE_PROMPTS[promptKey] || "请生成以下餐饮相关内容：\n";
  prompt += "\n";

  if (params.storeInfo?.name) prompt += `\n店铺名称：${params.storeInfo.name}`;
  if (params.storeInfo?.cuisineType) prompt += `\n菜系：${params.storeInfo.cuisineType}`;
  if (params.platform) prompt += `\n目标平台：${params.platform}`;
  if (params.tone) prompt += `\n语气风格：${params.tone}`;
  prompt += `\n字数要求：${LEN_MAP[params.length || "medium"]}`;

  if (params.referenceContent?.title) prompt += `\n参考主题：${params.referenceContent.title}`;
  if (params.persona?.position) prompt += `\n品牌定位：${params.persona.position}`;

  prompt += `\n\n请直接输出文案，不要包含JSON格式。`;
  return callLLM(prompt);
}
