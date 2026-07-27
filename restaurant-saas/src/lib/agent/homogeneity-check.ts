import type { GeneratedContentRecord } from "./types";
import homogeneityTool from "./tools/homogeneity";
import { safeParseLLMJsonOr } from "./json-utils";

export interface HomogeneityResult {
  severity: "none" | "mild" | "severe";
  score: number;
}

/**
 * 对应设计文档 7.2 节 Step 2 的 checkHomogeneity(merchantId)。
 *
 * 之前 pipeline.ts 里是硬编码 { severity: "none", score: 0 }，
 * 导致 priority-rules.ts 里的同质化规则和 pipeline.ts 里的熔断
 * (shouldMeltdown) 永远不会命中。这里改成基于近期内容真实调用
 * homogeneity 工具。
 *
 * 注意：homogeneityTool.execute 内部已经处理了 <3 篇内容时返回 "none"
 * 的冷启动情况（对应文档 4.4 节），这里不需要重复判断。
 */

/**
 * GeneratedContentRecord 目前没有 title 字段（不想为此阻塞接线先去改
 * content_history 表 schema），所以用 contentType + hookType + structure
 * + tone 拼一个可比较的"内容指纹"代替标题喂给 LLM 判断同质化。
 *
 * 这是一个明确的临时方案：拼出来的字符串能反映"这几篇是不是同一个套路"，
 * 但不如真实标题直观、也丢失了具体话题信息（比如"抄底价"和"周末探店"这种
 * 主题差异，如果 hookType/structure 一样会被拼成同一个指纹）。
 *
 * TODO: content_history 表补上 title 字段后，把下面这个函数换成直接读
 * `c.title`，checkHomogeneity() 的调用方不需要跟着改。
 */
function buildContentFingerprint(c: GeneratedContentRecord): string | undefined {
  const parts = [c.contentType, c.hookType, c.structure, c.tone].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : undefined;
}

export async function checkHomogeneity(
  merchantId: string,
  recentContent: GeneratedContentRecord[],
  context: { merchantId: string; storeInfo: any }
): Promise<HomogeneityResult> {
  const recentTitles = recentContent
    .slice(-10)
    .map(buildContentFingerprint)
    .filter((t): t is string => Boolean(t));

  if (recentTitles.length < 3) {
    return { severity: "none", score: 0 };
  }

  try {
    const output = await homogeneityTool.execute({ recentTitles }, context as any);
    return { severity: output.severity, score: output.score };
  } catch (err) {
    // LLM 调用失败或解析失败时，不阻塞主链路——降级为 "none"，
    // 但要记录日志，不能悄悄吞掉（后续接 observability.ts）。
    console.error(`[checkHomogeneity] merchant=${merchantId} 调用失败:`, err);
    return { severity: "none", score: 0 };
  }
}

/**
 * 供 homogeneity 工具内部使用的安全 JSON 解析包装（如果你想直接在
 * tools/homogeneity.ts 里替换 JSON.parse(result)，用这个）：
 *
 *   const result = await callLLM(prompt, 512);
 *   return safeParseLLMJsonOr<HomogeneityOutput>(
 *     result,
 *     { severity: "none", score: 0, suggestions: [] },
 *     (err) => console.error("[homogeneityTool] parse failed", err)
 *   );
 */
