/**
 * ============================================================
 * 运营规划模块 — 类型定义
 *
 * 基于 docs/operations-planning-redesign.md v1.2
 * PlatformAccount / SyncGroup / AccountOperationPlan
 * ============================================================
 */

import type {
  ContentStrategyType,
  ContentPillar,
  PlatformSuggestion,
  AudienceTagResult,
} from "@/lib/agent/classification/types";

// ── 账号战略来源 ─────────────────────────────────

export type StrategySource = "auto" | "manual" | "custom";

// ── 平台账号（核心实体） ────────────────────────

export interface PlatformAccount {
  id: string;                          // crypto.randomUUID()
  merchantId: string;
  platform: "dianping" | "xiaohongshu" | "douyin";

  // 基础信息
  accountName: string;
  accountUrl: string;
  avatar?: string;
  followers?: number;
  accountStage: "new" | "growing" | "mature";

  // 战略定位：8大类型 + 方向标签
  strategySource: StrategySource;
  strategyType: ContentStrategyType;   // 8选1，必选
  directionTags: string[];             // 方向标签，1-3个自由填写

  // 当 strategySource = "custom" 时，额外补充自由文本
  customPositioning?: string;

  // 同步关系（关联到 SyncGroup）
  syncGroupId?: string;                // 所属同步组；空 = 独立运营

  // 运营计划（由系统生成）
  operationPlan?: AccountOperationPlan;

  // 元数据
  createdAt: string;
  updatedAt: string;
}

// ── 同步组 ──────────────────────────────────────

export interface SyncGroup {
  id: string;
  merchantId: string;
  name: string;                        // 如 "主账号同步组"、"一鱼多吃组"
  accountIds: string[];                // 组内账号 ID 列表
  defaultStrategy: "same_copy";        // Phase 1 仅支持同内容分发
  createdAt: string;
}

// ── 账号运营计划 ────────────────────────────────

export interface AccountOperationPlan {
  oneLinePositioning: string;
  description: string;

  // 人设方案
  persona: {
    position: string;
    personality: string[];
    tone: string;
    contentDirections: string[];
    examplePosts: string[];
  };

  // 内容栏目体系
  contentPillars: ContentPillar[];

  // 平台建议
  platformPriority: PlatformSuggestion[];

  // 运营节奏
  recommendedFrequency: string;
  recommendedSchedule: string[];

  // 差异化策略说明
  differentiationStrategy: string;

  // 30天选题方向
  initialTopics: string[];

  // 抖音人群标签
  audienceTags?: AudienceTagResult;
}

// ── 账号诊断（Phase 3 预留） ────────────────────

export interface AccountDiagnostics {
  accountId: string;
  contentCoverage: {
    pillarName: string;
    targetRatio: number;
    actualRatio: number;
    gap: number;                        // 负 = 不足
  }[];
  contentGaps: string[];
  overallAssessment: string;
  suggestions: string[];
  dataSource: "simulated" | "api";
  lastAnalyzed: string;
}

// ── localStorage 键名常量 ──────────────────────

export const OPS_STORAGE_KEYS = {
  ACCOUNTS: "merchant_platform_accounts",
  SYNC_GROUPS: "merchant_sync_groups",
  STORE_INFO: "merchant_store_info",
  SELECTED_STRATEGY: "merchant_selected_strategy",
  CLASSIFICATION_CACHE: "ops_classification_cache",
} as const;
