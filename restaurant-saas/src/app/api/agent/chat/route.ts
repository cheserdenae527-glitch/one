import { NextResponse } from "next/server";
import { callLLM } from "@/lib/ai/client";
import { buildAgentContext } from "@/lib/agent";
import { createToolRegistry } from "@/lib/agent/tools";
import { buildChatPrompt } from "@/lib/agent/prompts";
import type { AgentContext } from "@/lib/agent/types";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    // 尝试获取商家上下文，失败时使用最小 fallback
    let context: AgentContext;
    try {
      context = await buildAgentContext("demo-merchant");
    } catch {
      context = {
        merchantId: "demo-merchant",
        storeInfo: { id: "demo-merchant", name: "", accountStage: "new" },
      };
    }

    // 加载工具列表，用于文字指导（模型知道有哪些工具可用）
    const registry = createToolRegistry();
    await registry.init();
    const tools = registry.listTools();

    const prompt = buildChatPrompt(message, context, tools);
    const result = await callLLM(prompt, 1024);
    return NextResponse.json({ response: result });
  } catch (error) {
    console.error("Agent chat error:", error);
    return NextResponse.json(
      { response: "抱歉，我暂时无法处理你的请求，请稍后再试。" },
      { status: 200 }
    );
  }
}
