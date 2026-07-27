import { NextResponse } from "next/server";
import { buildAgentContext } from "@/lib/agent";
import { createToolRegistry } from "@/lib/agent/tools";
import { buildChatPrompt, buildAgentSystemPrompt } from "@/lib/agent/prompts";
import { callDeepSeekWithMessages, callLLM } from "@/lib/ai/client";
import type { AgentContext } from "@/lib/agent/types";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    let context: AgentContext;
    try {
      context = await buildAgentContext("demo-merchant");
    } catch {
      context = {
        merchantId: "demo-merchant",
        storeInfo: { id: "demo-merchant", name: "", accountStage: "new" },
      };
    }

    const registry = createToolRegistry();
    await registry.init();
    const tools = registry.listTools();

    const systemContent = buildAgentSystemPrompt(context, tools);
    const apiMessages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemContent },
      ...messages.map((m: any) => ({
        role: m.role === "agent" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    const result = process.env.DEEPSEEK_API_KEY
      ? await callDeepSeekWithMessages(apiMessages, 1024)
      : await callLLM(apiMessages.map(m => m.content).join("\n"), 1024);

    return NextResponse.json({ response: result });
  } catch (error) {
    console.error("Agent chat error:", error);
    return NextResponse.json(
      { response: "抱歉，我暂时无法处理你的请求，请稍后再试。" },
      { status: 200 }
    );
  }
}
