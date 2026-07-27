"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TEMPLATES = [
  { id: "dish", label: "菜品展示", desc: "美食特写，突出食材质感", icon: "F" },
  { id: "kitchen", label: "后厨纪实", desc: "师傅制作过程，真实专业", icon: "K" },
  { id: "explore", label: "探店打卡", desc: "环境体验，沉浸式探店", icon: "P" },
  { id: "event", label: "活动预告", desc: "节日促销，优惠信息", icon: "A" },
  { id: "newdish", label: "新品发布", desc: "新品推荐介绍", icon: "N" },
];

const PLATFORMS = [
  { id: "douyin", label: "抖音", ratio: "9:16" },
  { id: "xiaohongshu", label: "小红书", ratio: "3:4" },
  { id: "shipin", label: "视频号", ratio: "16:9" },
];

const SCRIPTS: Record<string, string> = {
  dish: "今天给大家推荐一道我们店的招牌菜，食材新鲜、口感绝佳，一定要来尝尝。",
  kitchen: "我们的厨房每天这样运转，新鲜食材、专业师傅，每道菜都用心制作。",
  explore: "今天带大家探一家宝藏店铺，环境特别好，拍照打卡超出片。",
  event: "好消息！本店周年庆活动开始了，全场优惠，到店还有惊喜礼品。",
  newdish: "万众期待的新品终于上市了！从选材到出品，每个环节都严格把控。",
};

export default function VideosPage() {
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [referenceUrl, setReferenceUrl] = useState("");
  const [videoHistory, setVideoHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("video_history");
    if (saved) setVideoHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("video_history", JSON.stringify(videoHistory));
  }, [videoHistory]);

  // Import analysis result from 运营助手
  useEffect(() => {
    const ref = sessionStorage.getItem("agent_reference_video");
    if (ref) {
      setScript(ref);
      sessionStorage.removeItem("agent_reference_video");
      toast.success("已导入运营助手的视频分析结果，请调整脚本后点击生成");
    }
  }, []);

  const [script, setScript] = useState(SCRIPTS[template.id]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  function handleTemplateChange(t: typeof TEMPLATES[0]) {
    setTemplate(t);
    setScript(SCRIPTS[t.id] || "");
    setResults([]);
  }

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/videos/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: template.id, platform: platform.id, script, referenceUrl }),
      });
      const data = await res.json();
      const vids = data.videos || [];
      setResults(vids);
      if (vids.length) {
        setVideoHistory((prev) => [{ type: template.label, preview: vids[0], time: new Date().toLocaleTimeString() }, ...prev.slice(0, 19)]);
        toast.success("视频生成成功");
      }
    } catch { toast.error("生成失败"); }
    finally { setLoading(false); }
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight">视频生成</h1>
      <p className="text-sm text-muted-foreground -mt-4">选择模板，AI 自动生成短视频</p>

      <div className="grid grid-cols-5 gap-3">
        {TEMPLATES.map((t) => (
          <Card key={t.id} className={"cursor-pointer " + (template.id === t.id ? "ring-2 ring-primary" : "")}
            onClick={() => handleTemplateChange(t)}>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold mb-1">{t.icon}</div>
              <div className="text-sm font-medium">{t.label}</div>
              <div className="text-[10px] text-muted-foreground">{t.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardContent className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">目标平台</label>
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map((p) => (
                <Button key={p.id} variant={platform.id === p.id ? "default" : "outline"} size="sm"
                  onClick={() => setPlatform(p)}>
                  {p.label} ({p.ratio})
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">参考视频链接（选填）</label>
            <Input value={referenceUrl} onChange={(e) => setReferenceUrl(e.target.value)}
              placeholder="粘贴抖音/小红书视频链接，AI 将分析脚本结构" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">视频脚本（可编辑）</label>
            <textarea className="w-full min-h-[120px] rounded-md border border-input bg-background p-3 text-sm resize-y"
              value={script} onChange={(e) => setScript(e.target.value)} />
          </div>

          <Button className="w-full" onClick={handleGenerate} disabled={loading}>
            {loading ? "视频生成中..." : "生成视频"}
          </Button>
        </CardContent></Card>

        <Card><CardContent className="p-4 min-h-[400px]">
          {results.length > 0 ? (
            <>
              <h3 className="text-sm font-semibold mb-3">生成结果</h3>
              <div className="grid grid-cols-2 gap-3">
                {results.map((url, i) => (
                  <div key={i} className="rounded-md overflow-hidden bg-muted/30 border">
                    <div className="aspect-[9/16] bg-muted/50 flex items-center justify-center text-muted-foreground text-xs">
                      <video src={url} controls className="w-full h-full object-cover" />
                    </div>
                    <div className="p-1.5 flex gap-1">
                      <a href={url} target="_blank"
                        className="flex-1 text-xs bg-muted hover:bg-muted/80 py-1 rounded text-center block transition-colors">
                        查看视频
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <p className="mb-2">选择模板后点击生成</p>
              <p className="text-xs">AI 将根据脚本自动生成短视频</p>
            </div>
          )}
        </CardContent></Card>
      </div>

      {videoHistory.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">生成历史 ({videoHistory.length})</h3>
            <div className="grid grid-cols-5 gap-2">
              {videoHistory.map((item: any, i: number) => (
                <div key={i} className="rounded overflow-hidden border cursor-pointer hover:ring-2 hover:ring-primary transition-all p-2">
                  <div className="text-xs font-medium truncate">{item.type}</div>
                  <div className="text-[10px] text-muted-foreground">{item.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
