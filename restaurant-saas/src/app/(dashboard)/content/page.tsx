"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const CONTENT_TYPES = [
  { id: "dianping", label: "大众点评简介", desc: "店铺首页文案，建立第一印象" },
  { id: "xiaohongshu", label: "小红书笔记", desc: "种草文案，吸引用户到店" },
  { id: "promotion", label: "促销活动", desc: "节日/新客/老客活动文案" },
  { id: "reply", label: "评价回复", desc: "好评感谢、差评回复" },
  { id: "douyin", label: "抖音脚本", desc: "短视频口播脚本" },
];

const TONES = ["轻松自然", "正式专业", "活泼潮流"];
const LENGTHS = ["短（200字）", "中（500字）", "长（800字）"];

const DEMO_CONTENTS: Record<string, string> = {
  dianping: "开了12年的老成都火锅，坚持每天现熬牛油锅底。招牌毛肚每日凌晨现切，入口爽脆化渣。\n\n位于人民广场商圈，交通便利，环境宽敞适合聚餐。人均80-120元，性价比超高。\n\n推荐菜品：精品鲜毛肚、手打虾滑、鲜切黄牛肉。适合朋友聚会、情侣约会、家庭聚餐。",
  xiaohongshu: "在上海挖到一家神仙火锅！人均80吃到撑🔥\n\n终于打卡了收藏夹里躺了半年的老码头火锅，果然名不虚传！\n\n🌟推荐必点：\n- 精品鲜毛肚：每日现切，七上八下入口爽脆\n- 手打虾滑：Q弹鲜甜，能吃到整只虾\n- 鲜切黄牛肉：纹理漂亮，涮10秒刚刚好\n\n店里的环境也很有氛围感，适合拍照打卡📸\n\n#上海美食 #火锅 #上海探店 #美食推荐",
  promotion: "【周年庆回馈】全场菜品8折优惠！\n\n活动时间：7月20日 - 8月5日\n\n到店消费满200元赠送招牌毛肚一份\n\n老朋友回来吃顿熟悉的味道，新朋友来尝尝我们的招牌好菜。",
  reply: "感谢您的光临和好评！我们的毛肚确实是每天凌晨去市场现选的，师傅4点就去挑货了。下次来试试我们新出的菌汤锅底，也是最近很受欢迎的新品。期待您再次光临！",
  douyin: "【3秒钩子】在上海吃了10年的火锅店，到底凭什么天天排队？\n\n【店铺故事】老码头火锅开了12年，老板老陈自己就是炒料师傅，每天凌晨4点去市场挑毛肚。\n\n【产品展示】看这锅红油，看这毛肚的纹理，七上八下入口脆嫩。\n\n【用户场景】朋友聚餐来这，情侣约会来这，一个人想吃火锅也来这。\n\n【行动引导】左下角定位在这里，来晚了可要排队哦！",
};

export default function ContentPage() {
  const [type, setType] = useState(CONTENT_TYPES[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [length, setLength] = useState(LENGTHS[0]);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [history, setHistory] = useState<{ type: string; preview: string; time: string }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("content_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("content_history", JSON.stringify(history));
  }, [history]);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/content/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: type.id,
          platform: type.id === "dianping" ? "大众点评" : type.id === "xiaohongshu" ? "小红书" : "抖音",
          tone,
          length: length.includes("短") ? "short" : length.includes("中") ? "medium" : "long",
          referenceContent: reference ? { title: reference } : undefined,
        }),
      });
      if (!res.ok) throw new Error("API 未配置");
      const data = await res.json();
      const text = data.content || "";
      setContent(text);
      if (text) {
        setHistory((prev) => [{ type: type.label, preview: text.substring(0, 30) + "...", time: new Date().toLocaleTimeString() }, ...prev.slice(0, 19)]);
      }
    } catch {
      setContent(DEMO_CONTENTS[type.id] || "");
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!content.trim()) return;
    setHistory((prev) => [
      { type: type.label, preview: content.substring(0, 30) + "...", time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9),
    ]);
    toast.success("已保存");
  }

  function handleCopy() {
    navigator.clipboard.writeText(content);
    toast.success("已复制");
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight">内容创作</h1>
      <p className="text-sm text-muted-foreground -mt-4">选择内容类型，AI 自动生成高质量文案</p>

      <div className="grid grid-cols-5 gap-3">
        {CONTENT_TYPES.map((t) => (
          <Card key={t.id} className={"cursor-pointer " + (type.id === t.id ? "ring-2 ring-primary" : "")}
            onClick={() => { setType(t); setContent(""); }}>
            <CardContent className="p-3 text-center">
              <div className="text-sm font-medium">{t.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardContent className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">语气风格</label>
            <div className="flex gap-2 flex-wrap">
              {TONES.map((t) => (
                <Button key={t} variant={tone === t ? "default" : "outline"} size="sm" onClick={() => setTone(t)}>{t}</Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">文案长度</label>
            <div className="flex gap-2 flex-wrap">
              {LENGTHS.map((l) => (
                <Button key={l} variant={length === l ? "default" : "outline"} size="sm" onClick={() => setLength(l)}>{l}</Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">参考内容（选填）</label>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="粘贴参考链接或输入参考主题" />
          </div>
          <Button className="w-full" onClick={handleGenerate} disabled={loading}>
            {loading ? "生成中..." : "✨ 生成文案"}
          </Button>
          <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
            {type.id === "dianping" ? "生成店铺简介、标签、搜索关键词优化文案" :
             type.id === "xiaohongshu" ? "生成种草笔记，模拟真实食客口吻" :
             type.id === "promotion" ? "生成节日/新客/老客活动方案" :
             type.id === "reply" ? "根据评价内容生成有温度的回复" :
             "生成抖音短视频口播脚本，含钩子+内容+引导"}
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">生成结果</h3>
            <div className="flex gap-1">
              {content && (
                <>
                  <Button size="sm" variant="outline" onClick={handleSave}>保存</Button>
                  <Button size="sm" variant="outline" onClick={handleCopy}>复制</Button>
                  <Button size="sm" variant="outline" onClick={() => setContent("")}>清空</Button>
                </>
              )}
            </div>
          </div>
          <textarea
            className="w-full min-h-[300px] rounded-md border border-input bg-background p-3 text-sm resize-y leading-relaxed"
            value={content || (loading ? "生成中..." : "点击「生成文案」开始创作")}
            onChange={(e) => setContent(e.target.value)}
            placeholder="点击「生成文案」开始创作"
          />
        </CardContent></Card>
      </div>

      {history.length > 0 && (
        <Card><CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-3">历史内容 ({history.length})</h3>
          <div className="space-y-2">
            {history.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{item.type}</span>
                  <span className="text-muted-foreground">{item.preview}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}
