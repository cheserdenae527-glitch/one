import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-placeholder",
  timeout: 30000,
  maxRetries: 1,
});

export async function callLLM(prompt: string, maxTokens = 2048): Promise<string> {
  // DeepSeek
  if (process.env.DEEPSEEK_API_KEY) {
    return callDeepSeek(prompt, maxTokens);
  }
  // OpenAI
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key") {
    return callDoubao(prompt, maxTokens);
  }
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: maxTokens,
  });
  return response.choices[0]?.message?.content || "";
}

export async function callDeepSeek(prompt: string, maxTokens = 2048): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("No DeepSeek API key configured");
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("DeepSeek API failed: " + res.status + " " + err.substring(0, 200));
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

export async function callDeepSeekWithMessages(
  messages: Array<{ role: string; content: string }>,
  maxTokens = 2048
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("No DeepSeek API key configured");
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("DeepSeek API failed: " + res.status + " " + err.substring(0, 200));
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

export async function callDoubao(prompt: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.VOLC_API_KEY;
  if (!apiKey) throw new Error("No API key configured");
  const res = await fetch("https://ark.cn-beijing.volces.com/api/v3/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({
      model: "doubao-seed-2-0-lite-260428",
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      temperature: 0.7,
      max_output_tokens: Math.max(maxTokens, 4096),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Doubao API failed: " + res.status + " " + err.substring(0, 200));
  }
  const data = await res.json();
  if (data?.output && Array.isArray(data.output)) {
    const msgItem = data.output.find((item: any) => item.type === "message");
    if (msgItem?.content && Array.isArray(msgItem.content)) {
      const textItem = msgItem.content.find((c: any) => c.type === "output_text");
      if (textItem?.text) return textItem.text;
    }
  }
  return "";
}

