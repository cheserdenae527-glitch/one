"use client";
import { useState, useEffect } from "react";
import ImageTemplateGenerator from "@/components/images/image-template-generator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Sparkles } from "lucide-react";

export default function ImagesPage() {
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  useEffect(() => {
    const ref = sessionStorage.getItem("agent_reference_image");
    if (ref) {
      sessionStorage.removeItem("agent_reference_image");
      toast.success("已导入运营助手的分析结果，请根据分析调整出图参数");
    }
  }, []);

  async function handleGenerate(params: any) {
    setGenerating(true);
    try {
      const res = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        setGeneratedImages(data.images);
        toast.success("生成了 " + data.images.length + " 张图片");
      } else {
        toast.error("生成失败");
      }
    } catch {
      toast.error("生成请求失败");
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload(url: string, i: number) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "dish_image_" + (i + 1) + ".png";
    a.click();
    toast.success("开始下载");
  }

  return (
    <div>
      <ImageTemplateGenerator onGenerate={handleGenerate} />

      {generatedImages.length > 0 && (
        <div className="px-5 pb-8">
          <h2 className="text-base font-bold mb-4" style={{ color: "#F2EDE4" }}>
            <Sparkles className="w-4 h-4 inline mr-1.5" style={{ color: "#E8A33D" }} />
            AI 生成结果
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {generatedImages.map((url, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden" style={{ border: "1px solid #3A342C" }}>
                <img src={url} alt={"生成图片 " + (i + 1)} className="w-full aspect-square object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
                  <Button size="sm" variant="secondary" onClick={() => handleDownload(url, i)}>
                    <Download className="w-3.5 h-3.5 mr-1" /> 下载
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
