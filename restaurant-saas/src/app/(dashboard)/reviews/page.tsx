"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MOCK_REVIEWS = [
  { id: "1", name: "吃货小张", rating: 5, content: "毛肚非常新鲜，入口爽脆，锅底味道很正！服务员态度也很好，会再来。", date: "2026-07-21", sentiment: "positive", replyStatus: "pending" as const },
  { id: "2", name: "美食达人小王", rating: 4, content: "整体不错，环境很有特色，就是等位时间有点长。建议提前预约。", date: "2026-07-20", sentiment: "positive", replyStatus: "approved" as const, reply: "感谢您的建议！周末确实人比较多，建议下次提前在大众点评上取号，可以节省排队时间。" },
  { id: "3", name: "匿名用户", rating: 2, content: "等位等了1个小时，服务跟不上，点菜后半小时才上菜。体验很一般。", date: "2026-07-19", sentiment: "negative", replyStatus: "pending" as const },
  { id: "4", name: "火锅控", rating: 5, content: "吃了好多年的老店了，品质一直很稳定。毛肚和黄牛肉必点！", date: "2026-07-18", sentiment: "positive", replyStatus: "replied" as const, reply: "感谢老顾客的支持！看到您喜欢我们的菜品真的很开心，我们一定会继续保持品质。期待您下次光临！" },
  { id: "5", name: "探店博主小李", rating: 3, content: "味道还行，但价格偏贵，量也不大。性价比一般。", date: "2026-07-17", sentiment: "neutral", replyStatus: "pending" as const },
];

const SENTIMENT_LABELS: Record<string, string> = { positive: "好评", neutral: "中评", negative: "差评" };
const SENTIMENT_COLORS: Record<string, string> = { positive: "text-green-600 bg-green-50", neutral: "text-amber-600 bg-amber-50", negative: "text-red-600 bg-red-50" };

const DEMO_REPLIES: Record<string, string> = {
  positive: "感谢您的光临和好评！您的认可是我们最大的动力，我们会继续努力保持品质。期待您下次再来品尝我们的新品！",
  neutral: "感谢您的宝贵建议！关于您提到的问题，我们已经反馈给相关部门进行改进。希望能有机会再次为您服务，给您带来更好的体验。",
  negative: "非常抱歉这次没有给您带来满意的用餐体验。关于您反馈的问题，我们已经第一时间进行了检查和改进。希望能有机会再次为您服务，如有任何问题可以随时联系我们。",
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.sentiment === filter);
  const counts = { all: reviews.length, positive: reviews.filter((r) => r.sentiment === "positive").length, neutral: reviews.filter((r) => r.sentiment === "neutral").length, negative: reviews.filter((r) => r.sentiment === "negative").length };

  function toggleExpand(r: typeof MOCK_REVIEWS[0]) {
    if (expandedId === r.id) { setExpandedId(null); return; }
    setExpandedId(r.id);
    setReplyText(r.reply || "");
  }

  async function handleGenerateAI(reviewId: string) {
    setGenerating(reviewId);
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) return;
    await new Promise((r) => setTimeout(r, 500));
    setReplyText(DEMO_REPLIES[review.sentiment] || "");
    setGenerating(null);
  }

  function handleSaveReply(reviewId: string) {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, reply: replyText, replyStatus: "approved" as const } : r)));
    toast.success("回复已保存");
    setExpandedId(null);
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">评价管理</h1>
      <p className="text-sm text-muted-foreground -mt-4">管理各平台评价，AI 一键回复</p>

      <div className="grid grid-cols-4 gap-3">
        {[{ k: "all", l: "全部" }, { k: "positive", l: "好评" }, { k: "neutral", l: "中评" }, { k: "negative", l: "差评" }].map(({ k, l }) => (
          <Card key={k} className={"cursor-pointer " + (filter === k ? "ring-2 ring-primary" : "")} onClick={() => setFilter(k)}>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">{counts[k as keyof typeof counts]}</div>
              <div className="text-xs text-muted-foreground">{l}评价</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <Card key={r.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => toggleExpand(r)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{r.name}</span>
                      <span className="text-xs">{Array(r.rating).fill("⭐").join("")}</span>
                      <span className={"text-[10px] px-1.5 py-0.5 rounded " + SENTIMENT_COLORS[r.sentiment]}>{SENTIMENT_LABELS[r.sentiment]}</span>
                      <span className={"text-[10px] px-1.5 py-0.5 rounded " + (r.replyStatus === "pending" ? "bg-muted text-muted-foreground" : r.replyStatus === "approved" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600")}>
                        {r.replyStatus === "pending" ? "待回复" : r.replyStatus === "approved" ? "已编辑" : "已回复"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.content}</p>
                    <div className="text-[10px] text-muted-foreground mt-1">{r.date}</div>
                  </div>
                  <span className="text-muted-foreground text-xs ml-2">{expandedId === r.id ? "收起" : "回复"}</span>
                </div>
              </div>

              {expandedId === r.id && (
                <div className="border-t p-4 space-y-3 bg-muted/10">
                  <textarea
                    className="w-full min-h-[100px] rounded-md border border-input bg-background p-3 text-sm resize-y"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="编辑回复内容..."
                  />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => handleGenerateAI(r.id)} disabled={generating === r.id}>
                      {generating === r.id ? "生成中..." : "AI 生成回复"}
                    </Button>
                    <Button size="sm" onClick={() => handleSaveReply(r.id)} disabled={!replyText.trim()}>
                      保存回复
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
