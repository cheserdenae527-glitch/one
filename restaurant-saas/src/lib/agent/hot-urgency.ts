import type { TrendingTopicRecord } from "./types";

export interface HotUrgencyResult {
  hasUrgent: boolean;
  expiresInHours: number;
  topic?: TrendingTopicRecord;
}

/**
 * 对应设计文档 7.2 节 Step 2 的 getTrendUrgency(merchantId)。
 *
 * 之前 pipeline.ts 硬编码 { hasUrgent: false, expiresInHours: 48 }，
 * priority-rules.ts 里"热点即将过期"规则永远不可能命中。
 *
 * TODO: TrendingTopicRecord 目前没有 expiresAt / fetchedAt 字段，
 * 需要在 fetchTrendingContent（Phase 5）里补上采集时间，这里的窗口期
 * 按文档 3.1 节"热点只作为趋势参考"的口径，先用一个保守的默认衰减
 * （采集后 48 小时内视为有效，具体阈值由业务侧最终拍板，同 4.1 节的
 * 时效性衰减函数保持一致：100 × 0.7^天数，超过 7 天记 0）。
 */
export function getTrendUrgency(
  trendingTopics: TrendingTopicRecord[],
  now: Date = new Date()
): HotUrgencyResult {
  if (!trendingTopics || trendingTopics.length === 0) {
    return { hasUrgent: false, expiresInHours: 48 };
  }

  // 用互动量(likesCount)排序，取最热的一条作为候选紧急话题
  const sorted = [...trendingTopics].sort((a, b) => b.likesCount - a.likesCount);
  const top = sorted[0];

  const fetchedAt = (top as any).fetchedAt as string | undefined;
  if (!fetchedAt) {
    // 没有采集时间戳，无法判断时效，保守返回不紧急
    return { hasUrgent: false, expiresInHours: 48 };
  }

  const hoursElapsed = (now.getTime() - new Date(fetchedAt).getTime()) / (1000 * 60 * 60);
  const expiresInHours = Math.max(0, 24 - hoursElapsed); // 24小时窗口期，可按业务调整

  return {
    hasUrgent: expiresInHours > 0 && expiresInHours < 24,
    expiresInHours: Math.round(expiresInHours),
    topic: top,
  };
}
