import { NextResponse } from "next/server";
import { selectTemplates } from "@/lib/ai/template-matcher";
export async function POST(request: Request) {
  const body = await request.json();
  const result = selectTemplates(body);
  return NextResponse.json(result);
}