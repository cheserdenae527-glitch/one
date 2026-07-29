import { SuggestionItem, SUGGESTION_TYPE_ORDER } from "./suggestion-types";
import { getAllHotContent } from "./hot-content-storage";
import { selectTemplates, updateWeight } from "./template-matcher";
import { SEED_TEMPLATES } from "./template-seeds";

// ── 聚合引擎 ──────────────────────────────────────────────

interface SuggestionContext {
  storeInfo?: {
    name: string;
    cuisineType: string;
    city?: string;
    dianpingUrl?: string;
    xiaohongshuUrl?: string;
    douyinUrl?: string;
    brandAssets?: any[];
    stage?: string;
    createdAt?: string;
  };
  pendingReviewCount?: number;
  pendingComplianceCount?: number;
}

export function generateSuggestions(ctx: SuggestionContext): SuggestionItem[] {
  const suggestions: SuggestionItem[] = [];
  const now = new Date().toISOString().split("T")[0];

  // ── 1. 待处理事项（action_required）─────────────────────
  if (ctx.pendingReviewCount && ctx.pendingReviewCount > 0) {
    suggestions.push({
      id: "action_reviews_" + now,
      type: "action_required",
      title: `${ctx.pendingReviewCount} 条差评待回复`,
      description: "进入评价管理页批量处理，差评回复需人工审核后发布",
      priority: 90,
      source: "评价管理",
      actionLabel: "去处理",
      actionUrl: "/reviews",
      createdAt: now,
    });
  }

  if (ctx.pendingComplianceCount && ctx.pendingComplianceCount > 0) {
    suggestions.push({
      id: "action_compliance_" + now,
      type: "action_required",
      title: `${ctx.pendingComplianceCount} 条内容待合规复审`,
      description: "合规审查未通过的内容需要确认后重新提交",
      priority: 85,
      source: "合规审查",
      actionLabel: "查看",
      actionUrl: "/content?filter=compliance",
      createdAt: now,
    });
  }

  // ── 2. 节点性建议（node_event）─────────────────────────
  if (ctx.storeInfo?.createdAt) {
    const createdDate = new Date(ctx.storeInfo.createdAt);
    const nowDate = new Date();
    const diffMonths =
      (nowDate.getFullYear() - createdDate.getFullYear()) * 12 +
      nowDate.getMonth() - createdDate.getMonth();
    // Check if anniversary month
    if (diffMonths > 0 && diffMonths % 12 === 0) {
      const anniversaryYear = Math.floor(diffMonths / 12);
      suggestions.push({
        id: "node_anniversary_" + now,
        type: "node_event",
        title: `${ctx.storeInfo.name || "店铺"}注册${anniversaryYear}周年`,
        description: `建议规划一次回馈活动，巩固老客关系`,
        priority: 75,
        source: "内容日历",
        actionLabel: "规划活动",
        actionUrl: "/content/calendar",
        expiresAt: new Date(nowDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: now,
      });
    }
  }

  // ── 3. 内容创作建议（content_inspiration）──────────────
  try {
    const matchResult = selectTemplates(
      {
        cuisine: ctx.storeInfo?.cuisineType || "all",
        platform: "all",
        stage: ctx.storeInfo?.stage || "early",
        recentAngles: [],
      },
      SEED_TEMPLATES,
    );
    for (const tpl of matchResult.candidates) {
      suggestions.push({
        id: "inspire_" + tpl.id + "_" + now,
        type: "content_inspiration",
        title: tpl.description || tpl.name,
        description: `${tpl.name} · ${tpl.format}`,
        priority: 50 + Math.round(tpl.weight * 30),
        source: "模板引擎",
        platform: "all",
        genre: tpl.format,
        actionLabel: "去创作",
        actionUrl: "/content",
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        createdAt: now,
      });
    }
  } catch {
    // Fallback: show hot content trends
    try {
      const hotItems = getAllHotContent("all", ctx.storeInfo?.cuisineType, ctx.storeInfo?.city, false).slice(0, 3);
      for (const item of hotItems) {
        if (item.analysis) {
          suggestions.push({
            id: "inspire_hot_" + item.id + "_" + now,
            type: "content_inspiration",
            title: `${item.analysis.angleName || "热门"} — ${item.analysis.writingStyle || ""}`,
            description: `参考 ${item.title?.slice(0, 20)}... 的${item.analysis.formatName || "结构"}`,
            priority: 45,
            source: "热门榜单",
            platform: item.platform,
            createdAt: now,
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          });
        }
      }
    } catch {
      // No fallback data available
    }
  }

  // ── 4. 账号维护提醒（maintenance_reminder）──────────────
  const assets = ctx.storeInfo?.brandAssets;
  if (!assets || assets.length < 3) {
    suggestions.push({
      id: "maint_assets_" + now,
      type: "maintenance_reminder",
      title: "建议补充门店照片",
      description: `当前品牌素材 ${assets?.length || 0} 张，建议至少 3 张让生成内容更贴实际`,
      priority: 20,
      source: "商家信息库",
      actionLabel: "上传",
      actionUrl: "/settings",
      createdAt: now,
    });
  }

  const info = ctx.storeInfo;
  if (info) {
    const unbound = [];
    if (!info.dianpingUrl) unbound.push("大众点评");
    if (!info.xiaohongshuUrl) unbound.push("小红书");
    if (!info.douyinUrl) unbound.push("抖音");
    if (unbound.length >= 2) {
      suggestions.push({
        id: "maint_unbound_" + now,
        type: "maintenance_reminder",
        title: `未绑定 ${unbound.join("、")} 账号`,
        description: "绑定后获取账号阶段和粉丝量的精准数据，阶段判断更准确",
        priority: 25,
        source: "账号总览",
        actionLabel: "去绑定",
        actionUrl: "/operations",
        createdAt: now,
      });
    }
  }

  // ── 排序：按 type 优先级分组，组内按 priority 降序 ─────
  suggestions.sort((a, b) => {
    const typeOrderA = SUGGESTION_TYPE_ORDER[a.type] ?? 99;
    const typeOrderB = SUGGESTION_TYPE_ORDER[b.type] ?? 99;
    if (typeOrderA !== typeOrderB) return typeOrderA - typeOrderB;
    return b.priority - a.priority;
  });

  return suggestions;
}
