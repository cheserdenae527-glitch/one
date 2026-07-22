import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") || "\u70B9\u8BC4";
  const cuisine = searchParams.get("cuisine") || "";
  const city = searchParams.get("city") || "";

  // TODO: Query from hot_contents table
  return NextResponse.json({
    items: [],
    total: 0,
    platform,
    cuisine,
    city,
  });
}
