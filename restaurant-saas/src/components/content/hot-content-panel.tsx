"use client";
import { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";

interface HotContentAnalysis {
  writingStyle?: string;
  hookType?: string;
  structure?: string[];
  toneTags?: string[];
  visualStyle?: string;
  promptTemplate?: string;
}

interface HotContentItem {
  id: string;
  title: string;
  platform: string;
  likesCount: number;
  briefContent?: string;
  contentType?: string;
  url: string;
}

interface Props {
  onApplyAnalysis?: (analysis: HotContentAnalysis, title: string) => void;
  /** 当前已应用到创作表单的标题，用于在列表里高亮对应条目 */
  appliedTitle?: string | null;
}

const PLATFORMS = [
  { id: "all", label: "全部" },
  { id: "dianping", label: "评" },
  { id: "xiaohongshu", label: "书" },
  { id: "douyin", label: "抖" },
];

const PLATFORM_NAME: Record<string, string> = {
  dianping: "点评",
  xiaohongshu: "小红书",
  douyin: "抖音",
};

function formatCount(n?: number) {
  if (!n && n !== 0) return "-";
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

export default function HotContentPanel({ onApplyAnalysis, appliedTitle }: Props) {
  const [items, setItems] = useState<HotContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [platform, setPlatform] = useState("all");
  const [expanded, setExpanded] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, HotContentAnalysis>>({});

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch("/api/hot-content?platform=" + platform + "&limit=15")
      .then((r) => {
        if (!r.ok) throw new Error("bad status");
        return r.json();
      })
      .then((d) => setItems(d.items || []))
      .catch(() => {
        setItems([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [platform]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAnalyze(item: HotContentItem) {
    if (results[item.id]) {
      setOpenId((prev) => (prev === item.id ? null : item.id));
      return;
    }
    setAnalyzingId(item.id);
    try {
      const res = await fetch("/api/hot-content/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          briefContent: item.briefContent,
          platform: item.platform,
          contentType: item.contentType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResults((p) => ({ ...p, [item.id]: data.analysis }));
        setOpenId(item.id);
      }
    } catch {
      // 分析失败时保持按钮可再次点击，不打断浏览
    }
    setAnalyzingId(null);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2 cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs inline-block transition-transform"
            style={{ transform: expanded ? "rotate(0deg)" : "rotate(-90deg)" }}
          >
            ▼
          </span>
          <span className="text-[10px] text-muted-foreground">热门参考</span>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={
                "text-[10px] px-1.5 py-0.5 rounded " +
                (platform === p.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")
              }
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={load}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground disabled:opacity-40 ml-0.5"
            aria-label="换一批"
          >
            <RefreshCw className={"h-3 w-3 " + (loading ? "animate-spin" : "")} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-1 max-h-[320px] overflow-y-auto">
          {loading ? (
            <div className="space-y-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="p-2 rounded-lg space-y-1.5 animate-pulse">
                  <div className="h-3 bg-muted rounded w-4/5" />
                  <div className="h-2.5 bg-muted rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-[10px] text-muted-foreground p-2 flex items-start gap-1.5">
              <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <div>没能拉到热门参考，可能是数据还没更新</div>
                <button onClick={load} className="underline hover:text-foreground">
                  重试一次
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-[10px] text-muted-foreground p-2">今天这个平台还没有热门数据，换个平台看看，或稍后再来</div>
          ) : (
            items.map((item) => {
              const isApplied = appliedTitle && appliedTitle === item.title;
              const isOpen = openId === item.id;
              return (
                <div key={item.id}>
                  <div
                    className={
                      "flex items-start gap-1 p-2 rounded-lg hover:bg-muted/50 group " + (isApplied ? "bg-primary/5" : "")
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium leading-tight hover:text-primary transition-colors block truncate"
                      >
                        {item.title}
                      </a>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                        <span>{PLATFORM_NAME[item.platform] || item.platform}</span>
                        <span>赞 {formatCount(item.likesCount)}</span>
                        {isApplied && <span className="text-primary">已应用</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAnalyze(item)}
                      disabled={analyzingId === item.id}
                      className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
                    >
                      {analyzingId === item.id ? "分析中" : results[item.id] ? (isOpen ? "收起" : "查看") : "参考"}
                    </button>
                  </div>
                  {results[item.id] && isOpen && (
                    <div className="ml-2 p-2 mb-1 rounded-lg bg-muted/30 text-[10px] space-y-1">
                      <div>风格：{results[item.id].writingStyle || "-"}</div>
                      <div>钩子：{results[item.id].hookType || "-"}</div>
                      <div>结构：{(results[item.id].structure || []).join(" → ") || "-"}</div>
                      <div>语气：{(results[item.id].toneTags || []).join(" / ") || "-"}</div>
                      <button
                        onClick={() => onApplyAnalysis?.(results[item.id], item.title)}
                        disabled={!!isApplied}
                        className="mt-1 text-[10px] px-2 py-0.5 rounded bg-primary text-primary-foreground disabled:opacity-50"
                      >
                        {isApplied ? "已应用到创作表单" : "应用到创作表单"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </>
  );
}
