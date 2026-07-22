"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LinkInput() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/hot-content/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      await res.json();
      setUrl("");
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-3 border-t mt-3">
      <p className="text-xs font-medium mb-2">粘贴参考链接</p>
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="粘贴大众点评/小红书/抖音链接..."
        className="text-xs mb-2"
      />
      <Button size="sm" className="w-full text-xs" disabled={loading || !url.trim()} onClick={handleAnalyze}>
        {loading ? "分析中..." : "分析参考"}
      </Button>
    </div>
  );
}

