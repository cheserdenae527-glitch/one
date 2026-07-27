"use client";
import { useState } from "react";
import { TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import HotContentPanel from "@/components/content/hot-content-panel";
import { LinkInput } from "@/components/hot-content/link-input";
import { useAgent } from "@/components/agent/agent-context";

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
  const { openAgent } = useAgent();

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
        {/* Pass onReference={(item) => openAgent(item.content)} once
            HotContentPanel supports it — see integration note above. */}
        <HotContentPanel />
      </div>
      <div className="p-3 border-t bg-muted/10 shrink-0">
        <LinkInput />
      </div>
    </aside>
  );
}

