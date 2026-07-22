import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { url } = await request.json();
  return NextResponse.json({ success: true, url });
}

