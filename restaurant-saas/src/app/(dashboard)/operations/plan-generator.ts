/**
 * ============================================================
 * 运营规划模块 — 账号运营计划生成器
 *
 * 基于 docs/operations-planning-redesign.md 5.1 节
 * ============================================================
 */

import { getStrategyTemplate } from "@/lib/agent/classification/strategy-templates";
import type { ClassificationInput, MerchantClassification } from "@/lib/agent/classification/types";
import type {
  PlatformAccount,
  AccountOperationPlan,
} from "./operations-types";

/**
 * 根据账号的战略类型 + 方向标签 + 自定义定位生成运营计划。
 * 复用 strategy-templates 作为骨架，方向标签和自定义定位注入到人设和选题中。
 */
export function generateAccountPlan(
  account: PlatformAccount,
  merchantInfo: ClassificationInput
): AccountOperationPlan {
  const base = templateToPlan(
    getStrategyTemplate(
      account.strategyType,
      merchantInfo.cuisineType,
      merchantInfo.city || ""
    )
  );

  // 方向标签注入
  let plan = account.directionTags.length > 0
    ? injectDirectionTags(base, account.directionTags)
    : base;

  // customPositioning 注入
  if (account.customPositioning) {
    plan = {
      ...plan,
      persona: {
        ...plan.persona,
        position: mergePositioning(
          plan.persona.position,
          account.customPositioning
        ),
      },
      differentiationStrategy:
        plan.differentiationStrategy +
        `\n\n【自定义定位补充】${account.customPositioning}`,
    };
  }

  return plan;
}

/**
 * 方向标签注入：将标签字面植入人设、栏目、选题中。
 */
function injectDirectionTags(
  plan: AccountOperationPlan,
  tags: string[]
): AccountOperationPlan {
  return {
    ...plan,
    persona: {
      ...plan.persona,
      position: `${plan.persona.position}（${tags.join("、")}）`,
      contentDirections: [...tags, ...plan.persona.contentDirections],
    },
    initialTopics: [
      ...tags.map((t) => `【${t}】系列内容第1期`),
      ...plan.initialTopics.slice(0, 3),
    ],
  };
}

/**
 * 合并方向标签和自定义定位标签，避免双层括号堆叠。
 */
function mergePositioning(current: string, custom: string): string {
  const tagMatch = current.match(/（(.+)）$/);
  if (tagMatch) {
    return current.replace(/（(.+)）$/, `（$1；${custom}）`);
  }
  return `${current}（${custom}）`;
}

/**
 * 将 MerchantClassification（策略模板输出）映射为 AccountOperationPlan。
 */
function templateToPlan(tpl: MerchantClassification): AccountOperationPlan {
  return {
    oneLinePositioning: tpl.oneLinePositioning,
    description: tpl.description,
    persona: {
      position: tpl.recommendedPersona.position,
      personality: tpl.recommendedPersona.personality,
      tone: tpl.recommendedPersona.tone,
      contentDirections: tpl.recommendedPersona.contentDirections,
      examplePosts: tpl.recommendedPersona.examplePosts,
    },
    contentPillars: tpl.contentPillars,
    platformPriority: tpl.platformPriority,
    recommendedFrequency: "建议每周 2-3 篇",
    recommendedSchedule: tpl.initialTopics.slice(0, 5).map((t, i) =>
      [`Day ${i + 1}`, t].join(": ")
    ),
    differentiationStrategy: tpl.differentiationStrategy,
    initialTopics: tpl.initialTopics,
    audienceTags: tpl.audienceTags,
  };
}
