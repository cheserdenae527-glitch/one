/**
 * LLM 返回内容的安全 JSON 解析
 *
 * 修复点：content-analyzer.ts / homogeneity.ts / hot-topics.ts /
 * planning.ts / trending-analyzer.ts 里原来都是裸调用 JSON.parse(result)，
 * 一旦模型没有严格按"只返回JSON"输出（比如带了 ```json 围栏、前后有解释文字），
 * 工具调用会直接抛异常，没有任何兜底。
 */

export class LLMParseError extends Error {
  constructor(message: string, public raw: string, public cause?: unknown) {
    super(message);
    this.name = "LLMParseError";
  }
}

/**
 * 从 LLM 原始输出中提取 JSON 并解析。
 * - 剥离 ```json ... ``` / ``` ... ``` 围栏
 * - 剥离前后可能出现的解释性文字，尝试定位第一个 { 或 [ 到最后一个匹配的 } 或 ]
 * - 解析失败时抛出 LLMParseError（调用方决定降级策略，而不是让异常裸露到上层）
 */
export function safeParseLLMJson<T = unknown>(raw: string): T {
  if (!raw || typeof raw !== "string") {
    throw new LLMParseError("LLM 返回内容为空", raw ?? "");
  }

  let text = raw.trim();

  // 剥离 markdown 代码块围栏
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // 尝试直接解析
  try {
    return JSON.parse(text) as T;
  } catch (firstErr) {
    // 兜底：截取第一个 { 或 [ 到最后一个对应的 } 或 ]，去掉模型可能附带的说明文字
    const objStart = text.indexOf("{");
    const arrStart = text.indexOf("[");
    const starts = [objStart, arrStart].filter(i => i !== -1);
    if (starts.length === 0) {
      throw new LLMParseError(`LLM 输出不包含可解析的 JSON: ${text.slice(0, 200)}`, raw, firstErr);
    }
    const start = Math.min(...starts);
    const isObj = text[start] === "{";
    const end = isObj ? text.lastIndexOf("}") : text.lastIndexOf("]");
    if (end === -1 || end <= start) {
      throw new LLMParseError(`LLM 输出 JSON 结构不完整: ${text.slice(0, 200)}`, raw, firstErr);
    }
    const candidate = text.slice(start, end + 1);
    try {
      return JSON.parse(candidate) as T;
    } catch (secondErr) {
      throw new LLMParseError(`LLM 输出解析失败: ${candidate.slice(0, 200)}`, raw, secondErr);
    }
  }
}

/**
 * 带降级值的解析：解析失败时不抛异常，直接返回 fallback，
 * 并把错误交给调用方记录（不要吞掉日志）。
 */
export function safeParseLLMJsonOr<T>(
  raw: string,
  fallback: T,
  onError?: (err: LLMParseError) => void
): T {
  try {
    return safeParseLLMJson<T>(raw);
  } catch (err) {
    if (onError && err instanceof LLMParseError) onError(err);
    return fallback;
  }
}
