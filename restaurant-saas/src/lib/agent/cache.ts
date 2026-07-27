import type { DailyAgentSuggestion } from "./types";

// In-memory Map for development; replace with Redis in production
// TODO Phase 6: 换成真实 Redis，SET NX EX 语义需要用 `redis.set(key, "1", {NX:true, EX:30})`
// 替换下面 acquireLock() 的实现即可，其余逻辑不用改。
const cacheStore = new Map<string, DailyAgentSuggestion>();
const lockStore = new Map<string, boolean>();

function cacheKey(merchantId: string, date: string): string {
  return `agent:suggestion:${merchantId}:${date}`;
}

function lockKey(merchantId: string, date: string): string {
  return `agent:lock:${merchantId}:${date}`;
}

/** 原子抢锁模拟。Redis 版本用 SET NX EX 30 替换。 */
function acquireLock(key: string): boolean {
  if (lockStore.get(key)) return false;
  lockStore.set(key, true);
  return true;
}

function releaseLock(key: string): void {
  lockStore.delete(key);
}

async function pollForCache(
  key: string,
  options: { intervalMs: number; timeoutMs: number }
): Promise<DailyAgentSuggestion | null> {
  const start = Date.now();
  while (Date.now() - start < options.timeoutMs) {
    const cached = cacheStore.get(key);
    if (cached) return cached;
    await new Promise(r => setTimeout(r, options.intervalMs));
  }
  return null;
}

/**
 * 修复点：原来这个函数抢到锁之后直接 `return null`（注释写"Phase 2 再接入"），
 * 真正的 pipeline 执行是 pipeline.ts 自己另外调 setDailySuggestion 写入的——
 * 两边完全脱钩，锁没有保护到任何东西。10 个并发请求会各自跑一遍完整 pipeline。
 *
 * 现在改成接收一个 `generate` 回调（即 runAgentPipeline 内部实际产出 suggestion
 * 的逻辑），锁真正包裹这个回调的执行：
 *   - 抢到锁的请求：执行 generate()，写缓存，释放锁
 *   - 没抢到锁的请求：短轮询等待缓存被写入（对应设计文档 8.1 节）
 *   - 轮询超时：返回 null，调用方决定降级（不报错、不阻塞）
 */
export async function getOrGenerateDailySuggestion(
  merchantId: string,
  date: string,
  generate: () => Promise<DailyAgentSuggestion>
): Promise<{ suggestion: DailyAgentSuggestion | null; fromCache: boolean }> {
  const cKey = cacheKey(merchantId, date);
  const lKey = lockKey(merchantId, date);

  // 1. 先查缓存，命中直接返回（多数请求走这条路径）
  const cached = cacheStore.get(cKey);
  if (cached) return { suggestion: cached, fromCache: true };

  // 2. 尝试抢锁
  if (!acquireLock(lKey)) {
    // 没抢到锁：说明另一个请求正在生成，短轮询等待
    const polled = await pollForCache(cKey, { intervalMs: 200, timeoutMs: 15000 });
    return { suggestion: polled, fromCache: polled !== null };
  }

  // 3. 抢到锁：真正执行生成流程，用 try/finally 保证异常时也会释放锁
  try {
    const suggestion = await generate();
    cacheStore.set(cKey, suggestion);
    return { suggestion, fromCache: false };
  } finally {
    releaseLock(lKey);
  }
}

/** 仅查缓存，不触发生成。给不需要生成能力的调用方（比如后台展示）用。 */
export function peekDailySuggestion(merchantId: string, date: string): DailyAgentSuggestion | null {
  return cacheStore.get(cacheKey(merchantId, date)) ?? null;
}

export function clearDailyCache(merchantId: string, date: string): void {
  cacheStore.delete(cacheKey(merchantId, date));
}

export function setDailySuggestion(
  merchantId: string,
  date: string,
  suggestion: DailyAgentSuggestion
): void {
  cacheStore.set(cacheKey(merchantId, date), suggestion);
}

/**
 * 兼容旧接口名，避免其他调用方一次性全改。内部转发到新逻辑，
 * 但注意：这个签名下没有 generate 回调，行为等价于"只查缓存不生成"，
 * 保留仅为了不破坏现有 import。建议尽快切换到 getOrGenerateDailySuggestion。
 */
export async function getDailySuggestion(
  merchantId: string,
  date: string
): Promise<DailyAgentSuggestion | null> {
  return peekDailySuggestion(merchantId, date);
}
