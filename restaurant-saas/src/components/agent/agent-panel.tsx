"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AgentMessage, type MessageAttachment } from "./agent-message";
import { AgentInput, type PendingAttachment } from "./agent-input";
import { useAgent } from "./agent-context";
import { extractMediaUrl } from "@/lib/media/detect";
import { Bot, X } from "lucide-react";

interface Message {
  id: string;
  role: "agent" | "user";
  content: string;
  actions?: Array<{ label: string; action: string }>;
  attachments?: MessageAttachment[];
}

function AgentLauncher() {
  const { isOpen, openAgent } = useAgent();
  if (isOpen) return null;

  return (
    <button
      onClick={() => openAgent()}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      aria-label="呼出运营助手"
    >
      <Bot className="w-5 h-5" />
    </button>
  );
}

function AgentChat() {
  const { closeAgent, pendingPrefill, consumePrefill } = useAgent();
  const [messages, setMessages] = useState<Message[]>([
    { id: "loading", role: "agent", content: "正在分析你的店铺数据..." },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Daily suggestion on first load
  useEffect(() => {
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
          setMessages([{
            id: "fallback",
            role: "agent",
            content: "今天还没有内容计划，要不要生成一篇试试？",
            actions: [{ label: "生成内容", action: "generate" }],
          }]);
        }
      })
      .catch(() => {
        setMessages([{
          id: "offline",
          role: "agent",
          content: "运营助手已就绪，有什么需要帮忙的吗？",
          actions: [{ label: "写文案", action: "generate" }],
        }]);
      });
  }, []);

  // If opened (or re-triggered) via a "参考" click from 热门参考, seed the
  // conversation with that content and kick off analysis automatically.
  useEffect(() => {
    if (!pendingPrefill) return;
    const prefill = consumePrefill();
    if (!prefill) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: prefill };
    const loadingId = `${Date.now()}-loading`;
    setMessages(prev => [...prev, userMsg, { id: loadingId, role: "agent", content: "正在分析..." }]);
    setSending(true);
    fetch("/api/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: prefill }] }),
    })
      .then(res => res.json())
      .then(data => {
        setMessages(prev => prev.map(m =>
          m.id === loadingId ? { ...m, content: data.response || "好的，已收到。" } : m
        ));
      })
      .catch(() => {
        setMessages(prev => prev.map(m =>
          m.id === loadingId ? { ...m, content: "抱歉，暂时无法处理，请稍后再试。" } : m
        ));
      })
      .finally(() => setSending(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrefill]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const updateLoading = (id: string, text: string) =>
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, content: text } : m)));

  const uploadWithProgress = (file: File, onProgress: (pct: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const form = new FormData();
      form.append("file", file);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          try { resolve(JSON.parse(xhr.responseText).url); }
          catch { reject(new Error("parse failed")); }
        } else reject(new Error("upload failed"));
      };
      xhr.onerror = () => reject(new Error("network error"));
      xhr.open("POST", "/api/upload");
      xhr.send(form);
    });
  };

  const handleSend = async (pendingAttachments: PendingAttachment[]) => {
    const text = inputValue;
    if (!text.trim() && pendingAttachments.length === 0) return;
    if (sending) return;

    const attachments: MessageAttachment[] = pendingAttachments.map(a => ({
      id: a.id,
      name: a.file.name,
      type: a.type,
      url: a.previewUrl,
    }));

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    const loadingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, userMsg, { id: loadingId, role: "agent", content: "正在分析..." }]);
    setInputValue("");
    setSending(true);

    const fail = (msg: string) =>
      setMessages(prev => prev.map(m => (m.id === loadingId ? { ...m, content: msg } : m)));
    const succeed = (msg: string, actions?: Array<{label: string; action: string}>) =>
      setMessages(prev => prev.map(m => (m.id === loadingId ? { ...m, content: msg || "好的，已收到你的消息。", ...(actions ? { actions } : {}) } : m)));

    try {
      const videoAttachment = pendingAttachments.find(a => a.type === "video");
      const imageAttachment = pendingAttachments.find(a => a.type === "image");
      const linkedUrl = extractMediaUrl(text);

      if (videoAttachment) {
        updateLoading(loadingId, "正在上传...");
        const videoUrl = await uploadWithProgress(videoAttachment.file, (pct) => {
          updateLoading(loadingId, `正在上传 (${pct}%)...`);
        });
        updateLoading(loadingId, "正在分析...");
        const vRes = await fetch("/api/video/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: videoUrl, message: text }),
        });
        const vData = await vRes.json();
        sessionStorage.setItem("agent_reference_video", vData.response);
        succeed(vData.response, [{ label: "一键参考到视频脚本", action: "reference_video" }]);
      } else if (imageAttachment) {
        updateLoading(loadingId, "正在上传...");
        const imageUrl = await uploadWithProgress(imageAttachment.file, (pct) => {
          updateLoading(loadingId, `正在上传 (${pct}%)...`);
        });
        updateLoading(loadingId, "正在分析...");
        const iRes = await fetch("/api/media/analyze-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: imageUrl, message: text }),
        });
        const iData = await iRes.json();
        sessionStorage.setItem("agent_reference_image", iData.response);
        succeed(iData.response, [{ label: "一键参考到图片生成", action: "reference_image" }]);
      } else if (linkedUrl) {
        // Plain pasted link (e.g. 抖音 share URL) with no local upload.
        const res = await fetch("/api/video/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: linkedUrl, message: text }),
        });
        const data = await res.json();
        sessionStorage.setItem("agent_reference_video", data.response);
        succeed(data.response, [{ label: "一键参考到视频脚本", action: "reference_video" }]);
      } else {
        const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
        const res = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        const data = await res.json();
        succeed(data.response);
      }
    } catch {
      fail("抱歉，暂时无法处理，请稍后再试。");
    } finally {
      setSending(false);
    }
  };

  const handleAction = (action: string) => {
    if (action === "navigate") { router.push("/settings"); return; }
    if (action === "reference_image") { router.push("/images"); return; }
    if (action === "reference_video") { router.push("/videos"); return; }
    if (action === "generate") {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "agent",
        content: "已生成一篇夏日夜宵促销文案，请在主内容区查看和编辑。",
      }]);
    }
  };

  return (
    <aside className="fixed top-0 right-0 h-screen w-[420px] shrink-0 border-l bg-card flex flex-col overflow-hidden z-50 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Bot className="w-4 h-4 text-primary" /> 运营助手
        </div>
        <button
          onClick={closeAgent}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="收起运营助手"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map(msg => (
          <AgentMessage key={msg.id} message={msg} onAction={handleAction} />
        ))}
      </div>

      <AgentInput value={inputValue} onChange={setInputValue} onSend={handleSend} />
    </aside>
  );
}

export function AgentPanel() {
  const { isOpen } = useAgent();
  return (
    <>
      <AgentLauncher />
      {isOpen && <AgentChat />}
    </>
  );
}


