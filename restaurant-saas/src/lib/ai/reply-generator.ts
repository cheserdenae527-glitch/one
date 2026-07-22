import { callLLM } from "./client";
import type { StoreInfo, BrandPersona } from "@/types";

export async function generateReviewReply(params: {
  reviewContent: string;
  rating: number;
  storeInfo: Partial<StoreInfo>;
  persona?: BrandPersona;
}) {
  let prompt = `你是店长。请回复以下评价：

评价内容：${params.reviewContent}
评分：${params.rating}/5
店铺：${params.storeInfo.name}

要求：
1. 提到评价中的具体细节
2. 使用${params.persona?.tone || "自然"}的语气`;
  if (params.rating <= 2) {
    prompt += `\n3. 诚恳道歉，不要编造已执行的改进措施\n4. 引导私聊解决`;
  }
  prompt += `\n\n请不要使用模板化表达，让回复看起来像真人写的。`;

  return callLLM(prompt);
}
