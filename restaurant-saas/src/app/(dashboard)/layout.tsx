import { Sidebar } from "@/components/layout/sidebar";
import { AgentPanel } from "@/components/agent/agent-panel";
import { AgentProvider } from "@/components/agent/agent-context";
import { HotReferenceWidget } from "@/components/hot-content/hot-reference-widget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AgentProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* 热门参考: persistent, top-right, independently collapsible */}
        <HotReferenceWidget />

        {/* 运营助手: summonable via its own floating icon, or via a
            "参考" click inside 热门参考 (see hot-reference-widget.tsx) */}
        <AgentPanel />
      </div>
    </AgentProvider>
  );
}
