"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { classifyMerchant } from "@/lib/agent/classification/merchant-classifier";
import { STRATEGY_LABELS } from "@/lib/agent/classification/types";
import { getStrategyTemplate } from "@/lib/agent/classification/strategy-templates";
import type {
  MerchantClassification,
  ClassificationDetail,
  ClassificationInput,
  ContentStrategyType,
} from "@/lib/agent/classification/types";
import type { BrandPersona } from "@/types";
import type { StoreFormData } from "@/components/forms/store-form";

interface PersonaSelectorProps {
  onSelect: (persona: BrandPersona) => void;
  storeData?: StoreFormData | null;
}

function extractCity(address: string): string {
  const match = address.match(/(.+?(?:市|区|县|城))/);
  return match ? match[1] : "本地";
}

export function PersonaSelector({ onSelect, storeData }: PersonaSelectorProps) {
  const [classification, setClassification] = useState<MerchantClassification | null>(null);
  const [selectedType, setSelectedType] = useState<ContentStrategyType | null>(null);

  useEffect(() => {
    if (!storeData) return;
    const input: ClassificationInput = {
      cuisineType: storeData.cuisineType || "",
      priceRange: storeData.priceRange || "",
      targetCustomers: storeData.targetCustomers || "",
      hasDianping: Boolean(storeData.dianpingUrl),
      hasXiaohongshu: Boolean(storeData.xiaohongshuUrl),
      hasDouyin: Boolean(storeData.douyinUrl),
      accountStage: "new",
      city: extractCity(storeData.address || ""),
    };
    const result = classifyMerchant(input);
    setClassification(result);
    setSelectedType(result.primaryType);
  }, [storeData]);

  function handleConfirm() {
    if (!classification || !selectedType || !storeData) return;
    const template = getStrategyTemplate(
      selectedType,
      storeData.cuisineType || "美食",
      extractCity(storeData.address || ""),
    );
    onSelect(template.recommendedPersona);
  }

  if (!classification) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">分析店铺信息中...</p>
      </div>
    );
  }

  const preferredType = classification.primaryType;
  const details: ClassificationDetail[] = classification.details || [];

  const cuisine = storeData?.cuisineType || "美食";
  const city = extractCity(storeData?.address || "");
  const selectedTemplate = selectedType ? getStrategyTemplate(selectedType, cuisine, city) : null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-1">选择你的内容战略方向</h3>
        <p className="text-xs text-muted-foreground">
          系统根据你的店铺信息推荐最适合的战略方向，你也可以按需切换
        </p>
      </div>

      {/* Strategy type selector */}
      <div className="grid gap-2">
        {details.map((d: ClassificationDetail) => {
          const isSelected = selectedType === d.type;
          const isRecommended = d.type === preferredType;
          return (
            <Card
              key={d.type}
              className={`p-3 cursor-pointer transition-all ${
                isSelected ? "ring-2 ring-primary" : "hover:bg-muted/50"
              } ${isRecommended && !isSelected ? "border-blue-200" : ""}`}
              onClick={() => setSelectedType(d.type)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{d.label}</span>
                  {isRecommended && (
                    <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      推荐
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-muted-foreground">{d.score}分</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {d.matchedReasons.slice(0, 3).map((r: string, i: number) => (
                  <span
                    key={i}
                    className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selected strategy detail */}
      {selectedTemplate && selectedType && (
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-medium bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">
              战略详情
            </span>
            <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {STRATEGY_LABELS[selectedType]}
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            {selectedTemplate.oneLinePositioning}
          </p>

          {/* Content pillars */}
          <div className="mb-3">
            <p className="text-xs font-medium mb-1.5">内容栏目：</p>
            <div className="grid grid-cols-2 gap-1.5">
              {selectedTemplate.contentPillars.map((p, i) => (
                <div key={i} className="bg-white/60 px-2 py-1.5 rounded text-xs">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground ml-1">
                    {Math.round(p.ratio * 100)}% · {p.purpose}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 30-day topics */}
          <div className="mb-3">
            <p className="text-xs font-medium mb-1.5">30天选题方向：</p>
            <div className="space-y-1">
              {selectedTemplate.initialTopics.slice(0, 5).map((topic, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested persona */}
          <div className="bg-white/60 px-3 py-2 rounded-lg">
            <p className="text-xs font-medium mb-1">建议人设：</p>
            <p className="text-sm font-semibold text-blue-800">
              {selectedTemplate.recommendedPersona.position}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedTemplate.recommendedPersona.tone}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {selectedTemplate.recommendedPersona.personality.map((tag, i) => (
                <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Button
        className="w-full"
        onClick={handleConfirm}
        disabled={!selectedType}
      >
        确认战略方向
      </Button>
    </div>
  );
}
