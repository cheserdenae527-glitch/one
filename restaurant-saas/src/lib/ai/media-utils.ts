// hasMediaContent lives in lib/media/detect.ts now (it has no server-only
// deps, so the frontend can import it directly for client-side link
// detection). Re-exported here so existing `from "@/lib/.../media-utils"`
// imports keep working unchanged.
export { hasMediaContent, extractMediaUrl } from "@/lib/media/detect";

export async function callDoubaoChat(
  messages: Array<{ role: string; content: string }>,
  maxTokens = 4096
): Promise<string> {
  const apiKey = process.env.VOLC_API_KEY;
  if (!apiKey) throw new Error("No Doubao API key configured");
  const input = messages.map(m => ({
    role: m.role,
    content: [{ type: "input_text" as const, text: m.content }],
  }));
  const res = await fetch("https://ark.cn-beijing.volces.com/api/v3/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({ model: "doubao-seed-2-0-lite-260428", input, temperature: 0.7, max_output_tokens: maxTokens }),
  });
  if (!res.ok) { const err = await res.text(); throw new Error("Doubao API failed: " + res.status + " " + err.substring(0, 200)); }
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

export async function callDoubaoChatWithImages(
  messages: Array<{ role: string; content: string }>,
  imageUrls: string[],
  maxTokens = 4096
): Promise<string> {
  const apiKey = process.env.VOLC_API_KEY;
  if (!apiKey) throw new Error("No Doubao API key configured");

  const history = messages.slice(0, -1).map(m => ({
    role: m.role,
    content: [{ type: "input_text" as const, text: m.content }],
  }));
  const last = messages[messages.length - 1];
  const lastContent: Array<
    | { type: "input_text"; text: string }
    | { type: "input_image"; image_url: string }
  > = [
    { type: "input_text", text: last?.content ?? "" },
    ...imageUrls.map(url => ({ type: "input_image" as const, image_url: url })),
  ];

  const input = [...history, { role: last?.role ?? "user", content: lastContent }];

  const res = await fetch("https://ark.cn-beijing.volces.com/api/v3/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({ model: "doubao-seed-2-0-lite-260428", input, temperature: 0.7, max_output_tokens: maxTokens }),
  });
  if (!res.ok) { const err = await res.text(); throw new Error("Doubao API failed: " + res.status + " " + err.substring(0, 200)); }
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
