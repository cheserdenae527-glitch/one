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
      <p className="text-xs font-medium mb-2">\u7C98\u8D34\u53C2\u8003\u94FE\u63A5</p>
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="\u7C98\u8D34\u5927\u4F17\u70B9\u8BC4/\u5C0F\u7EA2\u4E66/\u6296\u97F3\u94FE\u63A5..."
        className="text-xs mb-2"
      />
      <Button size="sm" className="w-full text-xs" disabled={loading || !url.trim()} onClick={handleAnalyze}>
        {loading ? "\u5206\u6790\u4E2D..." : "\u5206\u6790\u53C2\u8003"}
      </Button>
    </div>
  );
}

