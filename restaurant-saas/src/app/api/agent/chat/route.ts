import { NextResponse } from "next/server";
import { callLLM } from "@/lib/ai/client";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const prompt = `你是一位餐饮运营助手，帮助餐饮老板运营大众点评、小红书、抖音等平台。
请根据你的专业知识回答用户的问题，给出具体、可执行的建议。
用户问题：${message}
请用中文回复，语气亲切、专业。`;

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
