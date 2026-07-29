"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { SuggestionItem, SuggestionType, SUGGESTION_TYPE_LABELS } from "@/lib/ai/suggestion-types";

const TYPE_STYLES: Record<SuggestionType, { bg: string; border: string; text: string; badge: string; badgeBg: string }> = {
  action_required: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-800",
    badge: "text-rose-700",
    badgeBg: "bg-rose-100",
  },
  node_event: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    badge: "text-blue-700",
    badgeBg: "bg-blue-100",
  },
  content_inspiration: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    badge: "text-amber-700",
    badgeBg: "bg-amber-100",
  },
  maintenance_reminder: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-800",
    badge: "text-slate-700",
    badgeBg: "bg-slate-100",
  },
};

export function SuggestionPanel() {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/suggestions?cuisine=火锅&stage=early&pendingReviews=3");
      if (!res.ok) throw new Error("获取建议失败");
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err: any) {
      setError(err.message || "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // Group by type for section headers
  const grouped = suggestions.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, SuggestionItem[]>);

  const typeOrder: SuggestionType[] = ["action_required", "node_event", "content_inspiration", "maintenance_reminder"];

  if (loading) {
    return (
      <div className="space-y-2 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse space-y-1.5">
            <div className="h-3 bg-muted rounded w-2/3" />
            <div className="h-2.5 bg-muted rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-red-500 text-center py-8">
        建议加载失败
        <button onClick={fetchSuggestions} className="ml-2 underline">重试</button>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-xs text-muted-foreground text-center py-8">
        暂无今日建议
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {typeOrder.map((type) => {
        const items = grouped[type];
        if (!items || items.length === 0) return null;
        const style = TYPE_STYLES[type];

        return (
          <div key={type}>
            {/* Section header */}
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-0.5">
              {SUGGESTION_TYPE_LABELS[type]}
            </div>
            {/* Items */}
            <div className="space-y-1.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 ${style.bg} ${style.border} border rounded-lg text-xs`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className={`font-medium ${style.text} leading-tight`}>
                        {item.title}
                      </div>
                      <div className="text-muted-foreground mt-0.5 leading-tight">
                        {item.description}
                      </div>
                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${style.badgeBg} ${style.badge}`}>
                          {SUGGESTION_TYPE_LABELS[item.type]}
                        </span>
                        {item.platform && item.platform !== "all" && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${style.badgeBg} ${style.badge}`}>
                            {item.platform === "dianping" ? "大众点评" : item.platform === "xiaohongshu" ? "小红书" : item.platform === "douyin" ? "抖音" : item.platform}
                          </span>
                        )}
                        {item.genre && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${style.badgeBg} ${style.badge}`}>
                            {item.genre}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.actionLabel && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0 text-[11px] h-6 px-2"
                        onClick={() => {
                          if (item.actionUrl) {
                            window.location.href = item.actionUrl;
                          }
                        }}
                      >
                        {item.actionLabel}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
