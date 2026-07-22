import { NextResponse } from "next/server";
import { generateContent } from "@/lib/ai/content-generator";

export async function POST(request: Request) {
  const params = await request.json();
  const result = await generateContent(params);
  return NextResponse.json({ content: result });
}
