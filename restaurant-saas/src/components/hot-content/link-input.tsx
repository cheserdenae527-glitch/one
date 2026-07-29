"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const PLATFORM_ICONS: Record<string, string> = {
  dianping: "点评", xiaohongshu: "小红书", douyin: "抖音",
};

export function LinkInput() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    title?: string;
    platform?: string;
    likesCount?: number;
    storeInfo?: string;
    keywords?: string[];
  } | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleAnalyze() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);

    try {
      const res = await fetch("/api/hot-content/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: url.trim(),
          briefContent: "",
          platform: "douyin",
          id: "link_" + Date.now(),
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err.substring(0, 100) || "分析失败");
      }
      const data = await res.json();
      setResult({
        title: url.split("/").pop()?.slice(0, 30) || "参考链接",
        platform: "douyin",
        keywords: data.analysis?.toneTags || [],
      });

      // Save to user link library
      const saveRes = await fetch("/api/hot-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          title: "用户参考链接",
          platform: "douyin",
        }),
      });
      if (saveRes.ok) {
        setSaved(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  const handleClear = useCallback(() => {
    setUrl("");
    setResult(null);
    setError(null);
    setSaved(false);
  }, []);

  return (
    <div className="pt-3 border-t mt-3">
      <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
        <Link className="w-3 h-3" />
        粘贴参考链接
      </p>

      {/* Link input */}
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="粘贴大众点评/小红书/抖音链接..."
        className="text-xs mb-1.5"
        disabled={loading}
        onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
      />
      <Button
        size="sm"
        className="w-full text-xs"
        disabled={loading || !url.trim()}
        onClick={handleAnalyze}
      >
        {loading ? (
          <>
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            分析中...
          </>
        ) : (
          "分析参考"
        )}
      </Button>

      {/* Error state */}
      {error && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-red-500">
          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis result */}
      {result && !error && (
        <div className="mt-2 space-y-1.5 text-xs bg-muted/20 rounded-md p-2">
          {result.platform && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {PLATFORM_ICONS[result.platform] || result.platform}
            </Badge>
          )}
          {result.title && (
            <p className="text-xs font-medium line-clamp-1">{result.title}</p>
          )}
          {result.keywords && result.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {result.keywords.map((kw: string, i: number) => (
                <span
                  key={i}
                  className="text-[10px] px-1.5 py-0.5 bg-primary/5 rounded"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
          {saved && (
            <p className="flex items-center gap-1 text-[10px] text-green-600">
              <CheckCircle className="w-3 h-3" />
              已存入链接库
            </p>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="w-full text-[10px] h-6"
            onClick={handleClear}
          >
            清除
          </Button>
        </div>
      )}
    </div>
  );
}
