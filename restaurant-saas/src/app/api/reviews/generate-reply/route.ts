import { NextResponse } from "next/server";
import { generateReviewReply } from "@/lib/ai/reply-generator";

export async function POST(request: Request) {
  const params = await request.json();
  const reply = await generateReviewReply(params);
  return NextResponse.json({ reply });
}
