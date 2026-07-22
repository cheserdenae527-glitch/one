import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { templateId, action } = await request.json();
  // TODO: Update weight in database
  return NextResponse.json({ success: true, templateId, action });
}
