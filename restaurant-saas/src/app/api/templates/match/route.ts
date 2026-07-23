import { NextResponse } from "next/server";
import { selectTemplates, Template } from "@/lib/ai/template-matcher";

const MOCK: Template[] = [
  { id: "1", name: "\u6a2a\u8bc4\u5bf9\u6bd4", description: "\u540c\u54c1\u7c7b\u5bf9\u6bd4\u591a\u5bb6\u5e97\uff0c\u7a81\u51fa\u81ea\u5bb6\u4f18\u52bf", tone: ["\u4e13\u4e1a\u8bc4\u6d4b"], cuisines: ["\u706b\u9505", "\u70e7\u70e4", "\u5ddd\u83dc"], platforms: ["\u5927\u4f17\u70b9\u8bc4", "\u5c0f\u7ea2\u4e66"], weight: 0.85, isActive: true },
  { id: "2", name: "\u5355\u54c1\u6df1\u6316", description: "\u6df1\u5165\u4ecb\u7ecd\u4e00\u9053\u62db\u724c\u83dc", tone: ["\u8001\u5b57\u53f7\u53e3\u7891"], cuisines: ["\u706b\u9505", "\u5ddd\u83dc"], platforms: ["\u5927\u4f17\u70b9\u8bc4"], weight: 0.72, isActive: true },
  { id: "3", name: "\u573a\u666f\u5f15\u53d1", description: "\u4ece\u6d88\u8d39\u573a\u666f\u5207\u5165\u63a8\u8350", tone: ["\u5e74\u8f7b\u4eba\u6253\u5361"], cuisines: ["\u706b\u9505", "\u65e5\u6599"], platforms: ["\u5c0f\u7ea2\u4e66", "\u6296\u97f3"], weight: 0.68, isActive: true },
  { id: "4", name: "\u79d1\u666e\u6559\u80b2", description: "\u8bb2\u89e3\u98df\u6750/\u5de5\u827a\u77e5\u8bc6", tone: ["\u4e13\u4e1a\u8bc4\u6d4b"], cuisines: ["\u5ddd\u83dc", "\u65e5\u6599"], platforms: ["\u5c0f\u7ea2\u4e66"], weight: 0.5, isActive: true },
  { id: "5", name: "\u6545\u4e8b\u53d9\u8ff0", description: "\u7528\u6545\u4e8b\u5438\u5f15\u7528\u6237", tone: ["\u8001\u5b57\u53f7\u53e3\u7891"], cuisines: ["\u706b\u9505", "\u70e7\u70e4"], platforms: ["\u5927\u4f17\u70b9\u8bc4", "\u6296\u97f3"], weight: 0.45, isActive: true },
];

export async function POST(request: Request) {
  const body = await request.json();
  const result = selectTemplates(body, MOCK);
  return NextResponse.json(result);
}
