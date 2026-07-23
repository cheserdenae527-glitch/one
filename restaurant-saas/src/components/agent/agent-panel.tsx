"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentMessage } from "./agent-message";
import { AgentInput } from "./agent-input";
import { HotContentPanel } from "@/components/hot-content/hot-content-panel";
import { LinkInput } from "@/components/hot-content/link-input";
import { Bot, TrendingUp, Settings2 } from "lucide-react";

interface Message {
  id: string;
  role: "agent" | "user";
  content: string;
  actions?: Array<{ label: string; action: string }>;
}

export function AgentPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      content: "早上好！检测到最近'\''夏日夜宵'\''话题在升温，适合你店里的品类。要不要试试生成一条相关内容？",
      actions: [
        { label: "生成内容", action: "generate" },
        { label: "换一个", action: "refresh" },
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: inputValue };
    const agentMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "agent",
      content: "好的，我来帮你分析一下。正在跑权重系统获取最佳建议...",
    };
    setMessages(prev => [...prev, userMsg, agentMsg]);
    setInputValue("");
  };

  const handleAction = (action: string) => {
    if (action === "generate") {
      const agentMsg: Message = {
        id: Date.now().toString(),
        role: "agent",
        content: "已生成一篇夏日夜宵促销文案，请在主内容区查看和编辑。",
      };
      setMessages(prev => [...prev, agentMsg]);
    }
  };

  return (
    <aside className="w-[340px] shrink-0 border-l bg-card flex flex-col overflow-hidden">
      <Tabs defaultValue="agent" className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2.5 border-b">
          <TabsList className="h-8">
            <TabsTrigger value="agent" className="text-xs gap-1.5 px-3">
              <Bot className="w-3.5 h-3.5" /> 运营助手
            </TabsTrigger>
            <TabsTrigger value="trending" className="text-xs gap-1.5 px-3">
              <TrendingUp className="w-3.5 h-3.5" /> 热门参考
            </TabsTrigger>
          </TabsList>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        <TabsContent value="agent" className="flex-1 flex flex-col m-0 p-0">
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map(msg => (
              <AgentMessage key={msg.id} message={msg} onAction={handleAction} />
            ))}
          </div>
          <AgentInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
          />
        </TabsContent>

        <TabsContent value="trending" className="flex-1 overflow-y-auto m-0 p-0">
          <div className="p-3">
            <HotContentPanel />
          </div>
          <div className="p-3 border-t bg-muted/10">
            <LinkInput />
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
