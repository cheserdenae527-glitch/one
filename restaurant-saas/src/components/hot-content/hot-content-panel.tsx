"use client";

import { useState, useEffect, useCallback } from "react";
import { HotContent, HotContentAnalysis } from "@/lib/ai/hot-contents";

const PLATFORMS = ["all", "dianping", "xiaohongshu", "douyin"];
const PLATFORM_LABELS_SHORT: Record<string, string> = {
  all: "全部", dianping: "评", xiaohongshu: "书", douyin: "抖",
};
const CUISINE_ITEMS = ["全部菜系", "火锅", "川菜", "日料", "烧烤", "西餐"];
const CITY_ITEMS = ["全国", "北京", "上海", "广州", "深圳", "成都", "杭州", "重庆"];
const PLATFORM_LABELS: Record<string, string> = {
  dianping: "大众点评", xiaohongshu: "小红书", douyin: "抖音",
};

interface HotContentPanelProps {
  onInject?: (analysis: HotContentAnalysis) => void;
}

export function HotContentPanel({ onInject }: HotContentPanelProps) {
  const [platform, setPlatform] = useState("all");
  const [cuisine, setCuisine] = useState("全部菜系");
  const [city, setCity] = useState("全国");
  const [items, setItems] = useState<HotContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [cityFallback, setCityFallback] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCityFallback(false);
    try {
      const params = new URLSearchParams({
        platform, cuisine: cuisine === "全部菜系" ? "all" : cuisine, city,
        preferAnalyzed: "true", limit: "30",
      });
      const res = await fetch(`/api/hot-content?${params}`);
      if (!res.ok) throw new Error("获取数据失败");
      const data = await res.json();
      if (city !== "全国" && data.items?.length === 0) {
        setCityFallback(true);
        const fbParams = new URLSearchParams({
          platform, cuisine: cuisine === "全部菜系" ? "all" : cuisine,
          city: "全国", preferAnalyzed: "true", limit: "30",
        });
        const fbRes = await fetch(`/api/hot-content?${fbParams}`);
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          setItems(fbData.items || []);
          return;
        }
      }
      setItems(data.items || []);
    } catch (err: any) {
      setError(err.message || "加载失败");
    } finally {
      setLoading(false);
    }
  }, [platform, cuisine, city]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAnalyze(item: HotContent) {
    if (analyzingId) return;
    setAnalyzingId(item.id);
    try {
      const res = await fetch("/api/hot-content/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id, title: item.title,
          briefContent: item.briefContent, platform: item.platform,
          cuisineType: item.cuisineType,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.analysis && onInject) {
          // Open Agent with the analysis
          onInject(data.analysis);
        }
      }
    } catch {
      // silent
    } finally {
      setAnalyzingId(null);
    }
  }

  return (
    <div className="space-y-3">
      {/* Header + Filter tabs */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">热门参考</h3>
        <div className="flex gap-1 bg-background border rounded-md p-0.5">
          {PLATFORMS.map((p) => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                platform === p ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >{PLATFORM_LABELS_SHORT[p]}</button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <select className="flex-1 text-xs border rounded px-2 py-1 bg-background"
          value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
          {CUISINE_ITEMS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="flex-1 text-xs border rounded px-2 py-1 bg-background"
          value={city} onChange={(e) => setCity(e.target.value)}>
          {CITY_ITEMS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* City fallback */}
      {cityFallback && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
          你所在的城市暂无热门数据，以下展示全国近期热门内容供参考
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-2 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-1.5">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-2.5 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && <div className="text-xs text-red-500 text-center py-4">{error}</div>}

      {/* Empty */}
      {!loading && !error && items.length === 0 && (
        <div className="text-xs text-muted-foreground text-center py-8">暂无热门数据</div>
      )}

      {/* Item list */}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {items.map((item) => (
            <div key={item.id}
              className="flex items-start gap-2 p-2 rounded-md transition-colors text-xs hover:bg-muted/50"
            >
              {/* Title + meta (click opens original) */}
              <div className="flex-1 min-w-0">
                <a href={item.url || "#"} target="_blank" rel="noopener noreferrer"
                  className="font-medium line-clamp-2 block hover:text-primary transition-colors cursor-pointer"
                >{item.title}</a>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                  <span>{PLATFORM_LABELS[item.platform] || item.platform}</span>
                  {item.cuisineType && <span>· {item.cuisineType}</span>}
                  {item.crawledAt && <span>· {new Date(item.crawledAt).toLocaleDateString("zh-CN")}</span>}
                </div>
              </div>
              {/* Likes + analyze button */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] text-muted-foreground">{item.likesCount}</span>
                <button onClick={() => handleAnalyze(item)}
                  disabled={analyzingId === item.id}
                  className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                    analyzingId === item.id
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "text-primary bg-primary/5 hover:bg-primary/10"
                  }`}
                >
                  {analyzingId === item.id ? "分析中..." : "分析"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
