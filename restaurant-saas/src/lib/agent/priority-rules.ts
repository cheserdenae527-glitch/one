import type { PipelineContext, Suggestion } from "./types";

export type RuleMatch = {
  matched: true;
  suggestion: Suggestion;
} | {
  matched: false;
  reason: string;
};

// Rule 1: 起号期未设置账号名
export function checkAccountSetupRule(ctx: PipelineContext): RuleMatch {
  if (ctx.stage === "new") {
    return {
      matched: true,
      suggestion: {
        type: "account_setup",
        title: "开始起号",
        description: "你的账号还在新建期，建议先设置账号名称和头像",
        actionLabel: "去设置",
        actionType: "navigate",
        confidence: 95,
      },
    };
  }
  return { matched: false, reason: "not_new_stage" };
}

// Rule 2: 同质化严重
export function checkHomogeneityRule(ctx: PipelineContext): RuleMatch {
  if (ctx.homogeneity.severity === "severe") {
    return {
      matched: true,
      suggestion: {
        type: "homogeneity_warning",
        title: "近期内容风格趋同",
        description: `同质化评分 ${ctx.homogeneity.score}，建议换一个切入角度`,
        actionLabel: "换角度",
        actionType: "generate",
        confidence: 90,
      },
    };
  }
  return { matched: false, reason: "not_severe" };
}

// Rule 3: 热点窗口紧急
export function checkHotUrgencyRule(ctx: PipelineContext): RuleMatch {
  if (ctx.hotUrgency.hasUrgent && ctx.hotUrgency.expiresInHours < 24) {
    return {
      matched: true,
      suggestion: {
        type: "hot_topic",
        title: "热点即将过期",
        description: `这个热点还剩不到 ${ctx.hotUrgency.expiresInHours} 小时窗口期，建议立即发布`,
        actionLabel: "生成内容",
        actionType: "generate",
        confidence: 88,
      },
    };
  }
  return { matched: false, reason: "no_urgent_hot" };
}

// 执行所有规则，命中即停
export function evaluatePriorityRules(ctx: PipelineContext): RuleMatch {
  const rules = [
    checkAccountSetupRule,
    checkHomogeneityRule,
    checkHotUrgencyRule,
  ];

  for (const rule of rules) {
    const result = rule(ctx);
    if (result.matched) return result;
  }

  return { matched: false, reason: "no_rules_matched" };
}
