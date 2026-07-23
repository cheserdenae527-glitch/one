import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-placeholder",
  timeout: 30000,
  maxRetries: 1,
});

export async function callLLM(prompt: string, maxTokens = 2048): Promise<string> {
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
      max_output_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Doubao API failed: " + res.status + " " + err.substring(0, 200));
  }
  const data = await res.json();
  return data?.output?.choices?.[0]?.message?.content || "";
}
