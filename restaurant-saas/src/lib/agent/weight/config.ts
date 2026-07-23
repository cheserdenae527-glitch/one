/**
 * Weight Configuration — 权重系统核心
 *
 * 设计规格书 4.1-4.5 节
 * - 归一化、冷启动、得分计算、同质化熔断
 */

// 权重维度定义
export interface WeightDimensions {
  hotMatch: number;        // 热点匹配度 (默认 0.294)
  merchantMatch: number;   // 商家匹配度 (默认 0.353)
  diversity: number;       // 多样性加分 (默认 0.176)
  history: number;         // 历史表现分 (默认 0.118)
  timeliness: number;      // 时效性加分 (默认 0.059)
  homogeneity: number;     // 同质化惩罚 (默认 -0.176，单独外挂)
}

export const DEFAULT_WEIGHTS: WeightDimensions = {
  hotMatch: 0.294,
  merchantMatch: 0.353,
  diversity: 0.176,
  history: 0.118,
  timeliness: 0.059,
  homogeneity: -0.176,
};

// 维度缺失时的冷启动权重重分配
export function coldStartAdjustment(
  weights: WeightDimensions,
  missingDimensions: (keyof WeightDimensions)[]
): WeightDimensions {
  if (missingDimensions.length === 0) return { ...weights };

  // penalty (homogeneity) is always included even during cold start
  const isPenalty = (k: keyof WeightDimensions): boolean => k === "homogeneity";

  const totalPositive = (Object.keys(weights) as (keyof WeightDimensions)[])
    .filter(k => !isPenalty(k))
    .reduce((sum, k) => sum + Math.abs(weights[k]), 0);

  const remainingPositive = (Object.keys(weights) as (keyof WeightDimensions)[])
    .filter(k => !isPenalty(k) && !missingDimensions.includes(k))
    .reduce((sum, k) => sum + Math.abs(weights[k]), 0);

  const adjusted = { ...weights };
  for (const k of missingDimensions) {
    adjusted[k] = 0; // remove
  }
  // Redistribute remaining positive weights proportionally
  for (const k of Object.keys(adjusted) as (keyof WeightDimensions)[]) {
    if (!missingDimensions.includes(k) && !isPenalty(k)) {
      adjusted[k] = Math.abs(weights[k]) / remainingPositive * totalPositive;
    }
  }

  return adjusted;
}

// 子分归一化（确保 0-100）
export function normalizeScore(raw: number, min: number, max: number): number {
  if (max <= min) return 50;
  return Math.max(0, Math.min(100, ((raw - min) / (max - min)) * 100));
}

// 计算最终得分
export function calculateFinalScore(
  dimensionScores: Record<string, number>,
  weights: WeightDimensions
): number {
  const raw =
    (dimensionScores.hotMatch || 0) * weights.hotMatch +
    (dimensionScores.merchantMatch || 0) * weights.merchantMatch +
    (dimensionScores.diversity || 0) * weights.diversity +
    (dimensionScores.history || 0) * weights.history +
    (dimensionScores.timeliness || 0) * weights.timeliness -
    (dimensionScores.homogeneity || 0) * Math.abs(weights.homogeneity);

  return Math.max(0, Math.min(100, Math.round(raw)));
}

// 判断是否需要同质化熔断
export function shouldMeltdown(homogeneityRaw: number, threshold = 0.80): boolean {
  return homogeneityRaw >= threshold;
}
