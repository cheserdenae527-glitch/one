import { NextResponse } from "next/server";
import { callLLM } from "@/lib/ai/client";
import { buildChatPrompt } from "@/lib/agent/prompts";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const prompt = buildChatPrompt(message);
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
