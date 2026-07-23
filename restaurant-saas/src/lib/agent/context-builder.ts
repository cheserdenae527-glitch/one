import { getStoreInfo } from "@/lib/supabase-server";
import type { AgentContext, GeneratedContentRecord, FeedbackPreference, TrendingTopicRecord } from "./types";

export async function buildAgentContext(merchantId: string): Promise<AgentContext> {
  const storeInfo = await getStoreInfo(merchantId);

  const recentContent: GeneratedContentRecord[] = [];
  // TODO Phase 2: Load from content_history table

  const trendingTopics: TrendingTopicRecord[] = [];
  // TODO Phase 5: Load from fetchTrendingContent

  const merchantFeedback: FeedbackPreference[] = [];
  // TODO Phase 3: Load from merchant_feedback table

  return {
    merchantId,
    storeInfo: storeInfo || { id: merchantId, name: "", accountStage: "new" },
    persona: storeInfo?.brandPersona,
    recentContent,
    trendingTopics,
    merchantFeedback,
  };
}
