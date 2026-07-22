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
  const prompt = `你是一位餐饮品牌策划专家。根据以下信息生成品牌人设方案：
店名：${storeInfo.name}
菜系：${storeInfo.cuisineType}
招牌菜：${storeInfo.signatureDishes.join("、")}
目标客群：${storeInfo.targetCustomers}
客单价：${storeInfo.priceRange}

输出格式（JSON数组）：
[{
  "position": "定位句",
  "personality": ["关键词1", "关键词2"],
  "tone": "语气描述",
  "contentDirections": ["方向1", "方向2"],
  "examplePosts": ["示例文案1", "示例文案2"]
}]`;

  const result = await callLLM(prompt);
  try {
    return JSON.parse(result);
  } catch {
    return [];
  }
}
