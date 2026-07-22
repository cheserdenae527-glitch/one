 "use client";
 
 import { useState } from "react";
 import { Card, CardContent } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { toast } from "sonner";
 
 const PRESETS = [
   { id: "dish", label: "菜品展示", icon: "🍽", desc: "突出菜品味觉质感", variants: ["白底精拍", "餐桌实拍", "手绘插画"] },
   { id: "poster", label: "海报", icon: "📰", desc: "店铺活动宣传", variants: ["促销海报", "新品上市", "节日主题"] },
   { id: "cover", label: "封面图", icon: "🖼", desc: "各平台账号封面", variants: ["简洁文字", "菜品特写", "环境氛围"] },
   { id: "menu", label: "菜单图", icon: "📋", desc: "推荐菜品展示", variants: ["精致摆盘", "食材特写", "组合推荐"] },
   { id: "event", label: "活动图", icon: "🎉", desc: "节日促销活动", variants: ["节日主题", "周年庆", "限时优惠"] },
 ];
 
 const PLATFORMS = [
   { id: "dianping", label: "大众点评", ratio: "1:1", note: "方图 1080x1080" },
   { id: "xiaohongshu", label: "小红书", ratio: "3:4", note: "竖图 1080x1440" },
   { id: "douyin", label: "抖音", ratio: "9:16", note: "封面 1080x1920" },
 ];
 
 export default function ImagesPage() {
   const [preset, setPreset] = useState(PRESETS[0]);
   const [variant, setVariant] = useState(preset.variants[0]);
   const [platform, setPlatform] = useState(PLATFORMS[0]);
   const [text, setText] = useState("");
   const [loading, setLoading] = useState(false);
   const [results, setResults] = useState<string[]>([]);
 
   async function handleGenerate() {
     setLoading(true);
     try {
       const res = await fetch("/api/images/generate", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ preset: preset.id, variant, platform: platform.id, text }),
       });
       const data = await res.json();
       setResults(data.images || []);
       if (data.images?.length) toast.success(`已生成 ${data.images.length} 张图片`);
     } catch {
       toast.error("生成失败，请检查 API 配置");
     } finally {
       setLoading(false);
     }
   }
 
   return (
     <div className="p-6 space-y-6 max-w-5xl">
       <div>
         <h1 className="text-2xl font-bold tracking-tight">图片生成</h1>
         <p className="text-sm text-muted-foreground mt-1">选择模板和平台，AI 自动生成多张候选图</p>
       </div>
 
       <div className="grid grid-cols-5 gap-3">
         {PRESETS.map((p) => (
           <Card key={p.id} className={`cursor-pointer transition-all hover:shadow-md ${preset.id === p.id ? "ring-2 ring-primary" : ""}`} onClick={() => { setPreset(p); setVariant(p.variants[0]); }}>
             <CardContent className="p-3 text-center">
               <div className="text-2xl mb-1">{p.icon}</div>
               <div className="text-sm font-medium">{p.label}</div>
               <div className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</div>
             </CardContent>
           </Card>
         ))}
       </div>
 
       <div className="grid grid-cols-2 gap-6">
         <Card>
           <CardContent className="p-4 space-y-4">
             <div>
               <label className="text-sm font-medium mb-2 block">风格变体</label>
               <div className="flex gap-2">
                 {preset.variants.map((v) => (
                   <Button key={v} variant={variant === v ? "default" : "outline"} size="sm" onClick={() => setVariant(v)}>{v}</Button>
                 ))}
               </div>
             </div>
             <div>
               <label className="text-sm font-medium mb-2 block">目标平台</label>
               <div className="flex gap-2">
                 {PLATFORMS.map((p) => (
                   <Button key={p.id} variant={platform.id === p.id ? "default" : "outline"} size="sm" onClick={() => setPlatform(p)}>
                     {p.label} <span className="text-[10px] ml-1 opacity-70">{p.ratio}</span>
                   </Button>
                 ))}
               </div>
             </div>
             <div>
               <label className="text-sm font-medium mb-2 block">叠加文字（选填）</label>
               <Input value={text} onChange={(e) => setText(e.target.value)} placeholder='例如："招牌必点"、"今日限定"' />
             </div>
             <Button className="w-full" onClick={handleGenerate} disabled={loading}>
               {loading ? "生成中..." : "✨ 生成图片"}
             </Button>
           </CardContent>
         </Card>
 
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center justify-between mb-3">
               <h3 className="text-sm font-semibold">预览</h3>
               <span className="text-xs text-muted-foreground">{platform.note}</span>
             </div>
             <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
               {results.length > 0 ? (
                 <div className="grid grid-cols-2 gap-2 w-full p-2">
                   {results.map((img, i) => (
                     <div key={i} className="aspect-square bg-muted rounded-md flex items-center justify-center text-[10px] text-muted-foreground overflow-hidden">
                       <img src={img} alt={`候选 ${i+1}`} className="w-full h-full object-cover" />
                     </div>
                   ))}
                 </div>
               ) : (
                 "选择模板后点击生成"
               )}
             </div>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }
