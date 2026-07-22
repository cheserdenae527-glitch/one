import { callLLM } from "./client";
import type { BrandPersona } from "@/types";

interface StoreInfo {
  name: string;
  cuisineType: string;
  signatureDishes: string[];
  targetCustomers: string;
  priceRange: string;
}

export async function generatePersonaOptions(storeInfo: StoreInfo): Promise<BrandPersona[]> {
  const prompt = `\u4F60\u662F\u4E00\u4F4D\u9910\u996E\u54C1\u724C\u7B56\u5212\u4E13\u5BB6\u3002\u6839\u636E\u4EE5\u4E0B\u4FE1\u606F\u751F\u6210\u54C1\u724C\u4EBA\u8BBE\u65B9\u6848\uFF1A
\u5E97\u540D\uFF1A${storeInfo.name}
\u83DC\u7CFB\uFF1A${storeInfo.cuisineType}
\u62DB\u724C\u83DC\uFF1A${storeInfo.signatureDishes.join("\u3001")}
\u76EE\u6807\u5BA2\u7FA4\uFF1A${storeInfo.targetCustomers}
\u5BA2\u5355\u4EF7\uFF1A${storeInfo.priceRange}

\u8F93\u51FA\u683C\u5F0F\uFF08JSON\u6570\u7EC4\uFF09\uFF1A
[{
  "position": "\u5B9A\u4F4D\u53E5",
  "personality": ["\u5173\u952E\u8BCD1", "\u5173\u952E\u8BCD2"],
  "tone": "\u8BED\u6C14\u63CF\u8FF0",
  "contentDirections": ["\u65B9\u54111", "\u65B9\u54112"],
  "examplePosts": ["\u793A\u4F8B\u6587\u68481", "\u793A\u4F8B\u6587\u68482"]
}]`;

  const result = await callLLM(prompt);
  try {
    return JSON.parse(result);
  } catch {
    return [];
  }
}
