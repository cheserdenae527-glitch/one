import { HotContentPanel } from "@/components/hot-content/hot-content-panel";
import { LinkInput } from "@/components/hot-content/link-input";

interface RightPanelProps {
  children?: React.ReactNode;
}

export function RightPanel({ children }: RightPanelProps) {
  return (
    <aside className="w-[260px] shrink-0 border-l bg-muted/20 p-4 overflow-y-auto">
      {children || (
        <div className="space-y-4">
          <HotContentPanel />
          <LinkInput />
        </div>
      )}
    </aside>
  );
}
