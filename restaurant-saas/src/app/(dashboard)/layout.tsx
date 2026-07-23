import { Sidebar } from "@/components/layout/sidebar";
import { AgentPanel } from "@/components/agent/agent-panel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <AgentPanel />
    </div>
  );
}
