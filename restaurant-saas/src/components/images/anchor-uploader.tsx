"use client";

import { useCallback } from "react";
import { X } from "lucide-react";

interface AnchorUploaderProps {
  images: string[];
  onImagesChange: (urls: string[], files: File[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function AnchorImageUploader({
  images,
  onImagesChange,
  maxImages = 3,
  disabled,
}: AnchorUploaderProps) {
  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const remaining = maxImages - images.length;
    const allowed = newFiles.slice(0, remaining);
    const newUrls = allowed.map((f) => URL.createObjectURL(f));
    onImagesChange([...images, ...newUrls], allowed);
    e.target.value = "";
  }, [images, maxImages, onImagesChange]);

  const handleRemove = useCallback((index: number) => {
    onImagesChange(
      images.filter((_, i) => i !== index),
      []
    );
  }, [images, onImagesChange]);

  const remaining = maxImages - images.length;
  const hasFiles = images.length > 0;

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium block">
        锚点图片（选填，最多{maxImages}张）
      </label>
      <div className="text-[10px] text-muted-foreground mb-1">
        上传碗花纹、Logo 等细节图，AI 将作为硬约束保留
      </div>

      {hasFiles && (
        <div className="flex gap-2 flex-wrap">
          {images.map((url, i) => (
            <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => handleRemove(i)}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center"
                disabled={disabled}
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {remaining > 0 && !disabled && (
        <label className="flex items-center justify-center h-16 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/30 text-xs text-muted-foreground">
          + 添加锚点图片（{remaining}张剩余）
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      )}
    </div>
  );
}
