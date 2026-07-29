import { NextResponse } from "next/server";
import { getUserLinks, addUserLink, deleteUserLink } from "@/lib/ai/hot-content-storage";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id") || "anonymous";
  const links = getUserLinks(userId);
  return NextResponse.json({ links });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, title, platform, likesCount, storeInfo, keywords } = body;
    if (!url) return NextResponse.json({ error: "缺少链接 URL" }, { status: 400 });

    const userId = request.headers.get("x-user-id") || "anonymous";
    const link = addUserLink(userId, url, { title, platform, likesCount, storeInfo, keywords });
    return NextResponse.json({ success: true, link });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "保存失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { linkId } = await request.json();
    if (!linkId) return NextResponse.json({ error: "缺少链接 ID" }, { status: 400 });

    const userId = request.headers.get("x-user-id") || "anonymous";
    const deleted = deleteUserLink(userId, linkId);
    if (!deleted) return NextResponse.json({ error: "链接不存在或无权删除" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "删除失败" }, { status: 500 });
  }
}
