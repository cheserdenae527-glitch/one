"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PRESETS = [
  { id: "dish", label: "菜品展示", desc: "突出菜品质感", variants: ["白底精拍", "餐桌实拍", "手绘插画"] },
  { id: "poster", label: "海报", desc: "店铺活动宣传", variants: ["促销海报", "新品上市", "节日主题"] },
  { id: "cover", label: "封面图", desc: "各平台账号封面", variants: ["简洁文字", "菜品特写", "环境氛围"] },
  { id: "menu", label: "菜单图", desc: "推荐菜品展示", variants: ["精致摆盘", "食材特写", "组合推荐"] },
  { id: "event", label: "活动图", desc: "节日促销活动", variants: ["节日主题", "周年庆", "限时优惠"] },
];

const PLATFORMS = [
  { id: "dianping", label: "大众点评", ratio: "1:1" },
  { id: "xiaohongshu", label: "小红书", ratio: "3:4" },
  { id: "douyin", label: "抖音", ratio: "9:16" },
];

export default function ImagesPage() {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [variant, setVariant] = useState(preset.variants[0]);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [text, setText] = useState("");
  const [count, setCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  // Upload + analysis state
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 2048;
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const cvs = document.createElement("canvas");
        cvs.width = w; cvs.height = h;
        const ctx = cvs.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0, w, h);
        setImageDataUrl(cvs.toDataURL("image/jpeg", 0.85));
        setAnalysisResult(null);
        setResults([]);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }


  async function handleAnalyze() {
    if (!imageDataUrl) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/images/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl, platform: platform.id }),
      });
      if (!res.ok) { const e = await res.text(); try { const j = JSON.parse(e); throw new Error(j.error || "分析失败"); } catch { throw new Error("分析失败"); } }
      const data = await res.json();
      setAnalysisResult(data);
      toast.success("分析完成: " + (data.dish_name || "已识别菜品"));
    } catch (err: any) {
      toast.error(err.message || "分析失败");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleGenerate() {
    setLoading(true);
    try {
      const body: any = { preset: preset.id, variant, platform: platform.id, text, count };
      if (imageDataUrl) body.imageDataUrl = imageDataUrl;
      if (analysisResult) {
        body.dishDescription = analysisResult.detailed_description || "";
        body.anchorDetails = (analysisResult.anchor_details || []).join("\n");
        body.dishName = analysisResult.dish_name || "";
        body.ingredients = analysisResult.ingredients || [];
      }
      const res = await fetch("/api/images/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResults(data.images || []);
      if (data.images?.length) toast.success("已生成 " + data.images.length + " 张图片");
    } catch {
      toast.error("生成失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight">图片生成</h1>
      <p className="text-sm text-muted-foreground -mt-4">上传参考图 → AI 分析 → 选择模板 → 生成优化图</p>

      {/* Presets */}
      <div className="grid grid-cols-5 gap-3">
        {PRESETS.map((p) => (
          <Card key={p.id} className={"cursor-pointer " + (preset.id === p.id ? "ring-2 ring-primary" : "")}
            onClick={() => { setPreset(p); setVariant(p.variants[0]); }}>
            <CardContent className="p-3 text-center">
              <div className="text-sm font-medium">{p.label}</div>
              <div className="text-[10px] text-muted-foreground">{p.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Settings */}
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Upload */}
            <div>
              <label className="text-sm font-medium mb-2 block">上传参考菜品图</label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30"
                onClick={() => document.getElementById("dish-upload")?.click()}>
                {imageDataUrl ? (
                  <img src={imageDataUrl} alt="参考图" className="max-h-32 mx-auto rounded object-contain" />
                ) : (
                  <p className="text-sm text-muted-foreground">点击上传菜品照片</p>
                )}
                <input id="dish-upload" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </div>
            </div>

            {imageDataUrl && !analysisResult && (
              <Button className="w-full" variant="secondary" onClick={handleAnalyze} disabled={analyzing}>
                {analyzing ? "AI 分析中..." : "AI 分析菜品"}
              </Button>
            )}

            {/* Analysis result */}
            {analysisResult && (
              <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 text-sm">
                <div className="font-medium">{analysisResult.dish_name || "已识别的菜品"}</div>
                {analysisResult.ingredients?.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    食材: {analysisResult.ingredients.join("、")}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  评分: {analysisResult.overall_score?.toFixed(1) || "-"} | 食欲: {analysisResult.food_appeal?.toFixed(1) || "-"}
                </div>
                {analysisResult.anchor_details?.length > 0 && (
                  <div className="text-xs text-amber-600">锚点: {analysisResult.anchor_details.join("; ")}</div>
                )}
              </div>
            )}

            {/* Style & platform */}
            <div>
              <label className="text-sm font-medium mb-2 block">风格变体</label>
              <div className="flex gap-2 flex-wrap">
                {preset.variants.map((v) => (
                  <Button key={v} variant={variant === v ? "default" : "outline"} size="sm" onClick={() => setVariant(v)}>{v}</Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">目标平台</label>
              <div className="flex gap-2 flex-wrap">
                {PLATFORMS.map((p) => (
                  <Button key={p.id} variant={platform.id === p.id ? "default" : "outline"} size="sm" onClick={() => setPlatform(p)}>
                    {p.label} ({p.ratio})
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">参考文字</label>
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="例如：招牌必点" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">生成数量</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <Button key={n} variant={count === n ? "default" : "outline"} size="sm" onClick={() => setCount(n)}>{n}张</Button>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={handleGenerate} disabled={loading}>
              {loading ? "生成中..." : "生成图片" + (analysisResult ? " (保留菜品原样)" : "")}
            </Button>
          </CardContent>
        </Card>

        {/* Right: Upload zone / Analysis / Results */}
        <Card>
          <CardContent className="p-4 min-h-[400px]">
            {results.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">生成结果 ({count}张)</h3>
                  <span className="text-xs text-muted-foreground">{analysisResult?.dish_name || ""}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {results.map((img, i) => (
                    <div key={i} className="rounded-md overflow-hidden bg-white">
                      <img src={img} alt={"" + (i + 1)} className="w-full h-auto" />
                    </div>
                  ))}
                </div>
              </>
            ) : !imageDataUrl ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <p className="mb-4">上传菜品参考图</p>
                <p className="text-xs">AI 将分析菜品特征后生成优化图</p>
              </div>
            ) : analyzing ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>AI 正在分析菜品...</p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">AI 分析结果</h3>
                {analysisResult.detailed_description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{analysisResult.detailed_description}</p>
                )}
                {analysisResult.improvement_priority?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1">优化建议：</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {analysisResult.improvement_priority.map((s: string, i: number) => (
                        <li key={i}>- {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">选择左侧参数后点击"生成图片"</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>等待上传...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



