"use client";
import { useState } from "react";
import { TrendingUp, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { LinkInput } from "@/components/hot-content/link-input";
import { useAgent } from "@/components/agent/agent-context";
import { HotContentAnalysis } from "@/lib/ai/hot-contents";
import { HotContentPanel } from "@/components/hot-content/hot-content-panel";
import { SuggestionPanel } from "@/components/hot-content/suggestion-panel";

/**
 * 热门参考 is a persistent, always-visible widget pinned to the top-right
 * corner of the page. It can be collapsed to a small pill and re-expanded,
 * but (unlike the Agent) it is never fully unmounted — it's always reachable.
 *
 * INTEGRATION NOTE:
 * To let a specific hot-content item hand off to the Agent when the user
 * clicks its "参考" button, <HotContentPanel /> needs a small change:
 *
 *   const { openAgent } = useAgent();
 *   ...
 *   <Button onClick={() => openAgent(item.content)}>参考</Button>
 *
 * That opens the Agent panel and seeds the conversation with that item's
 * content so the Agent starts analyzing it immediately. Send over
 * hot-content-panel.tsx if you'd like this wired in directly rather than
 * left as a callback.
 */
export function HotReferenceWidget() {
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState<"hot" | "direction">("hot");
  const { openAgent } = useAgent();

  const handleInject = (analysis: HotContentAnalysis) => {
    const parts = [
      "请参考以下热门内容的结构特征，为我的店铺生成一个可直接使用的视频脚本和配套推广文案：",
      "",
      "【参考内容结构】",
      "风格：" + analysis.writingStyle,
      "钩子：" + analysis.hookType,
      "结构：" + (analysis.structure?.join(" -> ") || ""),
      "语气：" + (analysis.toneTags?.join("/") || ""),
    ];
    if (analysis.angleName) parts.push("角度：" + analysis.angleName);
    if (analysis.formatName) parts.push("体裁：" + analysis.formatName);
    parts.push("提示词模板：" + analysis.promptTemplate);
    parts.push("");
    parts.push("请按以下格式输出：");
    parts.push("");
    parts.push("## 视频脚本（分镜表）");
    parts.push("| 时间 | 画面 | 旁白/字幕 | 备注 |");
    parts.push("");
    parts.push("## 口播/字幕文案");
    parts.push("(完整的口播稿或字幕文本)");
    parts.push("");
    parts.push("## 推广文案");
    parts.push("(适配抖音/小红书/大众点评的文案)");
    openAgent(parts.join("\n"));
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed top-4 right-4 z-40 flex items-center gap-1.5 h-8 px-3 rounded-full border bg-card shadow-sm text-xs font-medium text-muted-foreground hover:text-foreground hover:shadow-md transition-all"
      >
        <TrendingUp className="w-3.5 h-3.5" />
        热门参考
        <ChevronDown className="w-3 h-3" />
      </button>
    );
  }

  return (
    <aside className="fixed top-4 right-4 z-40 w-[340px] max-h-[calc(100vh-2rem)] flex flex-col rounded-xl border bg-card shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          热门参考
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="收起热门参考"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex gap-1 mb-3 bg-background border rounded-md p-0.5">
          <button
            onClick={() => setTab("hot")}
            className={`flex-1 text-xs py-1 rounded text-center transition-colors ${
              tab === "hot" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            热门参考
          </button>
          <button
            onClick={() => setTab("direction")}
            className={`flex-1 text-xs py-1 rounded text-center transition-colors ${
              tab === "direction" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            今日建议
          </button>
        </div>

        {tab === "hot" ? (
          <HotContentPanel onInject={handleInject} />
        ) : (
          <SuggestionPanel />
        )}
      </div>
      <div className="p-3 border-t bg-muted/10 shrink-0">
        <LinkInput />
      </div>
    </aside>
  );
}

