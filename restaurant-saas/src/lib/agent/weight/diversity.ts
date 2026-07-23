/**
 * Diversity Scheduling — 内容参数多样性调度 + 降级链
 *
 * 设计规格书 4.5 节
 * - 参数池定义（钩子类型/叙事结构/语气/节奏）
 * - 滑动窗口约束检查
 * - L1/L2/L3 降级链
 */

export const HOOK_TYPES = ["问题式", "数字式", "反常识", "场景代入", "数据式", "故事式", "对比式"] as const;
export const NARRATIVE_STRUCTURES = ["总分总", "逐条对比", "时间线", "因果链", "故事线", "清单体"] as const;
export const TONE_STYLES = ["亲切", "专业", "烟火气", "测评感", "探店感", "本地人"] as const;
export const PACING_STYLES = ["短平快", "图文交错", "慢叙述", "步骤式"] as const;

export type HookType = typeof HOOK_TYPES[number];
export type NarrativeStructure = typeof NARRATIVE_STRUCTURES[number];
export type ToneStyle = typeof TONE_STYLES[number];
export type PacingStyle = typeof PACING_STYLES[number];

export interface ContentParams {
  hookType: HookType;
  narrativeStructure: NarrativeStructure;
  toneStyle: ToneStyle;
  pacingStyle: PacingStyle;
}

export interface ContentMemory {
  recentParams: ContentParams[];
  maxHistory: number;
}

/**
 * 检查当前参数是否违反滑动窗口约束。
 * 与近 N 篇任一篇的 hookType 或 narrativeStructure 重复即视作违规。
 */
export function violatesConstraint(params: ContentParams, memory: ContentMemory): boolean {
  const recent = memory.recentParams.slice(-memory.maxHistory);
  return recent.some(r =>
    r.hookType === params.hookType || r.narrativeStructure === params.narrativeStructure
  );
}

/**
 * L1 降级：放宽滑动窗口大小（至少保留 1）。
 */
export function applyL1Degradation(
  params: ContentParams,
  memory: ContentMemory
): { params: ContentParams; memory: ContentMemory } {
  const newMemory = { ...memory, maxHistory: Math.max(1, memory.maxHistory - 1) };
  return { params, memory: newMemory };
}

/**
 * L2 降级：强制替换语气风格 + 段落节奏，保持钩子和叙事结构不变。
 */
export function applyL2Degradation(params: ContentParams): ContentParams {
  const otherTones = TONE_STYLES.filter(t => t !== params.toneStyle);
  const otherPacings = PACING_STYLES.filter(p => p !== params.pacingStyle);
  return {
    ...params,
    toneStyle: otherTones[Math.floor(Math.random() * otherTones.length)] || params.toneStyle,
    pacingStyle: otherPacings[Math.floor(Math.random() * otherPacings.length)] || params.pacingStyle,
  };
}

/**
 * 主函数：从参数池中选取最优组合。
 * 支持 forcedParams 用于热点等外部强制绑定。
 * 最多重试 20 次寻找一个不违反约束的组合。
 */
export function selectContentParams(
  memory: ContentMemory,
  forcedParams?: Partial<ContentParams>
): ContentParams {
  let params: ContentParams = {
    hookType: forcedParams?.hookType ?? HOOK_TYPES[Math.floor(Math.random() * HOOK_TYPES.length)],
    narrativeStructure: forcedParams?.narrativeStructure ?? NARRATIVE_STRUCTURES[Math.floor(Math.random() * NARRATIVE_STRUCTURES.length)],
    toneStyle: forcedParams?.toneStyle ?? TONE_STYLES[Math.floor(Math.random() * TONE_STYLES.length)],
    pacingStyle: forcedParams?.pacingStyle ?? PACING_STYLES[Math.floor(Math.random() * PACING_STYLES.length)],
  };

  let attempts = 0;
  const maxAttempts = 20;

  while (violatesConstraint(params, memory) && attempts < maxAttempts) {
    if (!forcedParams?.hookType) params.hookType = HOOK_TYPES[Math.floor(Math.random() * HOOK_TYPES.length)];
    if (!forcedParams?.narrativeStructure) params.narrativeStructure = NARRATIVE_STRUCTURES[Math.floor(Math.random() * NARRATIVE_STRUCTURES.length)];
    if (!forcedParams?.toneStyle) params.toneStyle = TONE_STYLES[Math.floor(Math.random() * TONE_STYLES.length)];
    if (!forcedParams?.pacingStyle) params.pacingStyle = PACING_STYLES[Math.floor(Math.random() * PACING_STYLES.length)];
    attempts++;
  }

  return params;
}

export interface DegradationResult {
  params: ContentParams;
  memory: ContentMemory;
  level: 0 | 1 | 2 | 3;
}

/**
 * 执行完整降级链：
 *   Level 0: 无违规
 *   Level 1: 放宽滑动窗口
 *   Level 2: 换语气 + 节奏
 *   Level 3: 已知重复（无法进一步降级）
 */
export function executeDegradationChain(
  initialParams: ContentParams,
  memory: ContentMemory
): DegradationResult {
  let params = { ...initialParams };
  let currentMemory = { ...memory };
  let level: DegradationResult["level"] = 0;

  if (violatesConstraint(params, currentMemory)) {
    // L1: 放宽窗口
    const l1Result = applyL1Degradation(params, currentMemory);
    params = l1Result.params;
    currentMemory = l1Result.memory;
    level = 1;

    // 如果 L1 后仍然违反
    if (violatesConstraint(params, currentMemory)) {
      // L2: 换语气和节奏
      params = applyL2Degradation(params);
      level = 2;

      // 如果 L2 后仍然违反
      if (violatesConstraint(params, currentMemory)) {
        // L3: 标记为已知重复
        level = 3;
      }
    }
  }

  return { params, memory: currentMemory, level };
}
