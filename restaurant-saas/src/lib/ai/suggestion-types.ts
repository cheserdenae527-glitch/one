// ── 建议聚合层类型定义 ──────────────────────────────────────

export type SuggestionType =
  | "action_required"   // 待处理事项：差评待回复、待合规复审
  | "node_event"        // 节点性建议：注册周年、平台节日促销
  | "content_inspiration" // 内容创作建议：模板引擎匹配结果
  | "maintenance_reminder"; // 账号维护提醒：素材不足、未绑定平台

export interface SuggestionItem {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  priority: number;         // 0-100，数值越大优先级越高
  source: string;           // 来源模块名
  platform?: string;        // 关联平台
  genre?: string;           // 关联体裁
  actionLabel?: string;     // 操作按钮文案
  actionUrl?: string;       // 点击跳转路径
  expiresAt?: string;       // 过期时间（节点性建议按活动日期过期，内容建议 48h）
  createdAt: string;
}

export const SUGGESTION_TYPE_LABELS: Record<SuggestionType, string> = {
  action_required: "待处理",
  node_event: "节点提醒",
  content_inspiration: "创作灵感",
  maintenance_reminder: "维护提醒",
};

export const SUGGESTION_TYPE_COLORS: Record<SuggestionType, string> = {
  action_required: "rose",
  node_event: "blue",
  content_inspiration: "amber",
  maintenance_reminder: "slate",
};

export const SUGGESTION_TYPE_ORDER: Record<SuggestionType, number> = {
  action_required: 0,
  node_event: 1,
  content_inspiration: 2,
  maintenance_reminder: 3,
};
