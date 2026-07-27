"use client";
import { useState, useEffect } from "react";
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
      id: "loading",
      role: "agent",
      content: "正在分析你的店铺数据...",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);

  // 每日首次加载时从 pipeline 获取建议
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    fetch("/api/agent/suggestion")
      .then(res => res.json())
      .then(data => {
        if (data.suggestion) {
          const s = data.suggestion.suggestion;
          setMessages([{
            id: "daily",
            role: "agent",
            content: `${s.description}`,
            actions: [{ label: s.actionLabel, action: s.actionType }],
          }]);
        } else {
          // Pipeline returned empty — use fallback
          setMessages([{
            id: "fallback",
            role: "agent",
            content: "今天还没有内容计划，要不要生成一篇试试？",
            actions: [{ label: "生成内容", action: "generate" }],
          }]);
        }
      })
      .catch(() => {
        // API unavailable — keep default message
        setMessages([{
          id: "offline",
          role: "agent",
          content: "运营助手已就绪，有什么需要帮忙的吗？",
          actions: [{ label: "写文案", action: "generate" }],
        }]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    if (sending) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: inputValue };
    const loadingId = (Date.now() + 1).toString();
    const loadingMsg: Message = { id: loadingId, role: "agent", content: "正在分析..." };
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInputValue("");
    setSending(true);

    fetch("/api/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg.content }),
    })
      .then(res => res.json())
      .then(data => {
        setMessages(prev => prev.map(m =>
          m.id === loadingId ? { ...m, content: data.response || "好的，已收到你的消息。" } : m
        ));
      })
      .catch(() => {
        setMessages(prev => prev.map(m =>
          m.id === loadingId ? { ...m, content: "抱歉，暂时无法处理，请稍后再试。" } : m
        ));
      })
      .finally(() => setSending(false));
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
