import { NextResponse } from "next/server";
import { updateWeight } from "@/lib/ai/template-matcher";
export async function POST(request: Request) {
  const { templateId, action, storeId } = await request.json();
  // For MVP: return success with weight delta
  const deltas: Record<string,number> = { used:0.1, saved:0.3, shared:0.3, regenerated:-0.2, skipped:-0.5 };
  const delta = deltas[action]||0;
  return NextResponse.json({ success: true, templateId, action, delta });
}