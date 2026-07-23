import { callLLM } from "@/lib/ai/client";
import type { TrendAnalysisResult } from "./types";

export async function analyzeTrendingPost(params: {
  title: string;
  body: string;
  platform?: string;
  likes?: number;
  saves?: number;
  comments?: number;
}): Promise<TrendAnalysisResult> {
  const prompt = `你是一位内容分析专家。分析以下餐饮热门内容：

平台：${params.platform || "未知"}
标题：${params.title}
正文：${params.body.substring(0, 2000)}
互动数据：点赞 ${params.likes || 0}，收藏 ${params.saves || 0}，评论 ${params.comments || 0}

请从以下 8 个维度分析，输出 JSON：
{
  "postInfo": { "title": "", "platform": "", "likes": 0, "saves": 0, "comments": 0, "publishTime": "" },
  "topic": { "primaryCategory": "品类", "angle": "切入角度", "replayable": true, "replayHint": "复刻建议" },
  "hook": { "type": "钩子类型", "text": "钩子原文", "effectiveness": "有效性分析" },
  "structure": { "pattern": "叙事结构", "bodyLength": 0, "paragraphCount": 0, "imageTextRatio": "图文比" },
  "toneAndKeywords": { "tone": "语气风格", "keywords": [], "keywordStrategy": "关键词策略" },
  "engagementTriggers": { "likesWhy": "", "savesWhy": "", "shareWhy": "" },
  "comments": { "totalCommentCount": 0, "topWords": [], "sentimentDistribution": {}, "realUserSignals": [], "controversyPoints": [] },
  "whyItWorks": { "summary": "", "replicabilityScore": 0, "replicableElements": [], "riskFactors": [] }
}

只返回 JSON，不要包含其他文字。`;

  const result = await callLLM(prompt, 2048);
  return JSON.parse(result) as TrendAnalysisResult;
}
