import { NextResponse } from "next/server";
import { buildAgentContext } from "@/lib/agent";
import { createToolRegistry } from "@/lib/agent/tools";
import { buildAgentSystemPrompt } from "@/lib/agent/prompts";
import { callDeepSeekWithMessages, callLLM } from "@/lib/ai/client";
import { hasMediaContent, callDoubaoChat } from "@/lib/ai/media-utils";
import type { AgentContext } from "@/lib/agent/types";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    // Step 1: build context (with safe fallback)
    let context: AgentContext;
    try {
      context = await buildAgentContext("demo-merchant");
    } catch {
      context = {
        merchantId: "demo-merchant",
        storeInfo: { id: "demo-merchant", name: "", accountStage: "new" },
      };
    }

    // Step 2: init tool registry
    const registry = createToolRegistry();
    let tools: import("@/lib/agent/types").AgentTool[] = [];
    try {
      await registry.init();
      tools = registry.listTools();
    } catch {
      // tools stay empty, prompts.ts handles empty list gracefully
    }

    // Step 3: build system prompt
    const systemContent = buildAgentSystemPrompt(context, tools);

    // Step 4: build API messages
    const apiMessages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemContent },
      ...messages.map((m: any) => ({
        role: m.role === "agent" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    // Step 5: call LLM
    const lastMsg = messages[messages.length - 1];
    let result: string;
    if (hasMediaContent(lastMsg.content)) {
      result = await callDoubaoChat(apiMessages, 4096);
    } else if (process.env.DEEPSEEK_API_KEY) {
      result = await callDeepSeekWithMessages(apiMessages, 2048);
    } else {
      result = await callLLM(apiMessages.map(m => m.content).join("\n"), 2048);
    }

    return NextResponse.json({ response: result || "好的，已收到你的消息。" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Agent chat error:", msg);
    return NextResponse.json(
      { response: `抱歉，我暂时无法处理你的请求。${msg.substring(0, 100)}` },
      { status: 200 }
    );
  }
}
