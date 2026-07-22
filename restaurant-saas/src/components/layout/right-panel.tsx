import { HotContentPanel } from "@/components/hot-content/hot-content-panel";
import { LinkInput } from "@/components/hot-content/link-input";

export function RightPanel() {
  return (
    <aside className="w-[280px] shrink-0 border-l bg-card overflow-y-auto">
      <div className="p-3 border-b bg-muted/10">
        <HotContentPanel />
      </div>
      <div className="p-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">创作方向</div>
        <div className="space-y-2">
          <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
            <div className="text-xs font-medium text-amber-800">番茄锅底新热点</div>
            <div className="text-[11px] text-amber-600 mt-0.5">结合招牌毛肚出测评笔记</div>
          </div>
          <div className="p-2.5 bg-purple-50 border border-purple-100 rounded-lg">
            <div className="text-xs font-medium text-purple-800">&ldquo;上海必吃火锅&rdquo;话题上升</div>
            <div className="text-[11px] text-purple-600 mt-0.5">合集类内容展示3家对比</div>
          </div>
        </div>
      </div>
      <div className="p-3 border-t bg-muted/10">
        <LinkInput />
      </div>
    </aside>
  );
}

