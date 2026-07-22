import { callLLM } from "./client";
import type { StoreInfo, BrandPersona } from "@/types";

export async function generateReviewReply(params: {
  reviewContent: string;
  rating: number;
  storeInfo: Partial<StoreInfo>;
  persona?: BrandPersona;
}) {
  let prompt = `\u4F60\u662F\u5E97\u957F\u3002\u8BF7\u56DE\u590D\u4EE5\u4E0B\u8BC4\u4EF7\uFF1A

\u8BC4\u4EF7\u5185\u5BB9\uFF1A${params.reviewContent}
\u8BC4\u5206\uFF1A${params.rating}/5
\u5E97\u94FA\uFF1A${params.storeInfo.name}

\u8981\u6C42\uFF1A
1. \u63D0\u5230\u8BC4\u4EF7\u4E2D\u7684\u5177\u4F53\u7EC6\u8282
2. \u4F7F\u7528${params.persona?.tone || "\u81EA\u7136"}\u7684\u8BED\u6C14`;
  if (params.rating <= 2) {
    prompt += `\n3. \u8BDA\u6073\u9053\u6B49\uFF0C\u4E0D\u8981\u7F16\u9020\u5DF2\u6267\u884C\u7684\u6539\u8FDB\u63AA\u65BD\n4. \u5F15\u5BFC\u79C1\u804A\u89E3\u51B3`;
  }
  prompt += `\n\n\u8BF7\u4E0D\u8981\u4F7F\u7528\u6A21\u677F\u5316\u8868\u8FBE\uFF0C\u8BA9\u56DE\u590D\u770B\u8D77\u6765\u50CF\u771F\u4EBA\u5199\u7684\u3002`;

  return callLLM(prompt);
}
