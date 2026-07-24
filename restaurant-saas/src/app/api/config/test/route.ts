import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { serviceType, provider, apiKey, endpoint } = await request.json();
  if (!apiKey) return NextResponse.json({ success: false, error: "Missing API key" });

  try {
    if (serviceType === "text") {
      if (provider === "doubao") {
        const testEndpoint = endpoint || "https://ark.cn-beijing.volces.com/api/v3/responses";
        const res = await fetch(testEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
          body: JSON.stringify({
            model: "doubao-seed-2-0-lite-260428",
            input: [{ role: "user", content: [{ type: "input_text", text: "Hi" }] }],
            max_output_tokens: 4096,
          }),
        });
        const data = await res.json();
        const hasOutput = data?.output && Array.isArray(data.output) && data.output.length > 0;
        return NextResponse.json({ success: res.ok && hasOutput });
      } else {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
          body: JSON.stringify({
            model: provider === "openai" ? "gpt-4o-mini" : provider === "deepseek" ? "deepseek-chat" : "qwen-turbo",
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 10,
          }),
        });
        return NextResponse.json({ success: res.ok });
      }
    } else if (serviceType === "image") {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
        body: JSON.stringify({
          model: provider === "seedream" ? "doubao-seedream-5-0-260128" : "dall-e-3",
          prompt: "test",
          n: 1,
          size: "1024x1024",
        }),
      });
      return NextResponse.json({ success: res.ok });
    } else {
      return NextResponse.json({ success: false, error: "Video test not implemented" });
    }
  } catch (e: any) {
    const errMsg = (e && typeof e === "object" && e.message) ? e.message : String(e || "unknown error");
    return NextResponse.json({ success: false, error: errMsg });
  }
}
