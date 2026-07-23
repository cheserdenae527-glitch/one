// 可观测性工具函数

export interface PipelineLogEntry {
  merchantId: string;
  date: string;
  step2DurationMs?: number;
  step25Result?: string;
  step3DurationMs?: number;
  llmTokens?: number;
  success: boolean;
  errorMessage?: string;
}

export interface WeightScoreLogEntry {
  merchantId: string;
  candidateIndex: number;
  rawScores: Record<string, number>;
  normalizedScores: Record<string, number>;
  weightedScores: Record<string, number>;
  finalScore: number;
}

// In-memory log stores (for development; replace with DB writes in production)
const pipelineLogs: PipelineLogEntry[] = [];
const weightScoreLogs: WeightScoreLogEntry[] = [];

export function recordPipelineExecution(entry: PipelineLogEntry): void {
  pipelineLogs.push({ ...entry, date: entry.date || new Date().toISOString().split("T")[0] });
  // TODO Phase 6: Write to agent_pipeline_log table
}

export function recordWeightScore(entry: WeightScoreLogEntry): void {
  weightScoreLogs.push(entry);
  // TODO Phase 6: Write to weight_score_log table
}

export function getRecentPipelineLogs(count = 10): PipelineLogEntry[] {
  return pipelineLogs.slice(-count);
}

export function getRecentWeightScores(count = 10): WeightScoreLogEntry[] {
  return weightScoreLogs.slice(-count);
}

export function getPipelineStats(): { total: number; successRate: number; avgDurationMs: number } {
  if (pipelineLogs.length === 0) return { total: 0, successRate: 0, avgDurationMs: 0 };
  const successful = pipelineLogs.filter(l => l.success).length;
  const totalDuration = pipelineLogs.reduce((sum, l) => sum + (l.step2DurationMs || 0) + (l.step3DurationMs || 0), 0);
  return {
    total: pipelineLogs.length,
    successRate: successful / pipelineLogs.length,
    avgDurationMs: totalDuration / pipelineLogs.length,
  };
}
