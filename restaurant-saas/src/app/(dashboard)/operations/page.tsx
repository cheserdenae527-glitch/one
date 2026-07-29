"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { classifyMerchant } from "@/lib/agent/classification/merchant-classifier";
import { STRATEGY_LABELS, STORAGE_KEYS } from "@/lib/agent/classification/types";
import { getStrategyTemplate } from "@/lib/agent/classification/strategy-templates";
import type { ClassificationInput, ContentStrategyType, PlatformAccountConfig } from "@/lib/agent/classification/types";
import type { MerchantClassification } from "@/lib/agent/classification/types";
import { toast } from "sonner";

type PlatformId = "dianping" | "xiaohongshu" | "douyin";
type SetupMode = "recommending" | "manual" | "configuring" | "done";

const DEMO: ClassificationInput = {
  cuisineType: "火锅", priceRange: "80-120", targetCustomers: "年轻人、朋友聚餐",
  hasDianping: false, hasXiaohongshu: false, hasDouyin: false, accountStage: "new", city: "成都",
};

const PLATFORM_NAMES: Record<PlatformId, string> = {
  dianping: "大众点评", xiaohongshu: "小红书", douyin: "抖音",
};
const PLATFORM_COLORS: Record<PlatformId, string> = {
  dianping: "from-orange-500 to-red-500", xiaohongshu: "from-pink-500 to-purple-500", douyin: "from-emerald-500 to-teal-500",
};

export default function Page() {
  const [classification, setClassification] = useState<MerchantClassification | null>(null);
  const [selectedType, setSelectedType] = useState<ContentStrategyType>("scene_experience");
  const [setupMode, setSetupMode] = useState<SetupMode>("recommending");
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>([]);
  const [accounts, setAccounts] = useState<PlatformAccountConfig[]>([]);
  const [addingPlatform, setAddingPlatform] = useState<PlatformId | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);

  useEffect(() => {
    const result = classifyMerchant(DEMO);
    setClassification(result);
    setSelectedType(result.primaryType);
  }, []);

  const template = useMemo(() => selectedType ? getStrategyTemplate(selectedType, DEMO.cuisineType, DEMO.city) : null, [selectedType]);
  const priorities = template?.platformPriority || [];
  const boundAccounts = accounts.filter(a => a.isBound);

  function handleAccept() {
    setSelectedPlatforms(priorities.map(p => p.platform));
    setSetupMode("configuring");
  }

  function handleAdd(p: PlatformId) {
    setAccounts(prev => [...prev, {
      platform: p, accountName: "", accountUrl: "", followers: 0, isBound: false, isCustomized: false,
    }]);
    setAddingPlatform(null);
  }

  function updateAccount(p: PlatformId, field: string, val: any) {
    setAccounts(prev => prev.map(a => (a.platform === p ? { ...a, [field]: val, isCustomized: true } : a)));
  }

  function handleBind(p: PlatformId) {
    const a = accounts.find(x => x.platform === p);
    if (!a || !a.accountName || !a.accountUrl) { toast.error("请填写"); return; }
    setAccounts(prev => prev.map(x => (x.platform === p ? { ...x, isBound: true } : x)));
    toast.success("已绑定");
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">运营规划</h1>
      <p className="text-sm text-muted-foreground -mt-4">管理运营策略与多平台账号</p>

      {/* Strategy diagnosis */}
      <Card><CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">战略诊断</h2>
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setShowPicker(!showPicker)}>更换</Button>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3">
          <span className="text-sm font-bold">{STRATEGY_LABELS[selectedType]}</span>
          {template && <p className="text-xs text-muted-foreground mt-1">{template.oneLinePositioning}</p>}
        </div>
        {showPicker && classification?.details && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {classification.details.map((d: any) => (
              <Card key={d.type} className={"p-2 cursor-pointer " + (selectedType === d.type ? "ring-2 ring-primary" : "")}
                onClick={() => { setSelectedType(d.type); setShowPicker(false); }}>
                <p className="text-xs font-medium">{d.label}</p>
                <p className="text-[10px] text-muted-foreground">{d.score}分</p>
              </Card>
            ))}
          </div>
        )}
      </CardContent></Card>

      {/* Platform creation */}
      <Card><CardContent className="p-4">
        <h2 className="font-semibold text-sm mb-2">平台创建</h2>

        {setupMode === "recommending" && (
          <div className="flex gap-2">
            <Button size="sm" className="text-xs" onClick={handleAccept}>接受推荐</Button>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => setAddingPlatform("dianping")}>+ 添加账号</Button>
          </div>
        )}

        {addingPlatform && (
          <div className="flex gap-2 mt-2">
            {(["dianping", "xiaohongshu", "douyin"] as PlatformId[]).map(p => (
              <Button key={p} size="sm" variant="outline" className="text-xs" onClick={() => handleAdd(p)}>{PLATFORM_NAMES[p]}</Button>
            ))}
          </div>
        )}

        {setupMode === "configuring" && !addingPlatform && selectedPlatforms.filter(p => !accounts.find(a => a.platform === p)?.isBound).map(p => {
          const a = accounts.find(x => x.platform === p) || {platform: p, accountName: "", accountUrl: "", followers: 0, isBound: false, isCustomized: false};
          return (
            <div key={p} className="mt-2 p-2 border rounded space-y-1">
              <p className="text-xs font-medium">{PLATFORM_NAMES[p]}</p>
              <input className="flex h-7 w-full rounded border px-2 text-xs" value={a.accountName}
                onChange={e => updateAccount(p, "accountName", e.target.value)} placeholder="账号名称" />
              <input className="flex h-7 w-full rounded border px-2 text-xs" value={a.accountUrl}
                onChange={e => updateAccount(p, "accountUrl", e.target.value)} placeholder="账号链接" />
              <Button size="sm" className="w-full text-xs" onClick={() => handleBind(p)}>绑定</Button>
            </div>
          );
        })}
      </CardContent></Card>

      {/* Bound accounts */}
      {boundAccounts.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {boundAccounts.map(a => (
            <Card key={a.platform} className="overflow-hidden cursor-pointer"
              onClick={() => setExpandedAccount(expandedAccount === a.platform ? null : a.platform)}>
              <CardContent className="p-3">
                <p className="text-sm font-semibold">{PLATFORM_NAMES[a.platform]}</p>
                <p className="text-xs text-muted-foreground">{a.accountName}</p>
                {expandedAccount === a.platform && template && (
                  <div className="mt-3 pt-3 border-t space-y-2 bg-blue-50 rounded-lg p-3">
                    <p className="text-[10px] font-medium text-blue-700 mb-1">账号详情</p>
                    <p className="text-xs font-semibold">{STRATEGY_LABELS[selectedType]}</p>
                    <p className="text-[10px] text-muted-foreground">{template.oneLinePositioning}</p>
                    <p className="text-[10px] font-medium text-muted-foreground mt-2">人设</p>
                    <p className="text-xs font-medium">{template.recommendedPersona.position}</p>
                    <p className="text-[10px] text-muted-foreground">{template.recommendedPersona.tone}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.recommendedPersona.personality.slice(0, 3).map((t: string, i: number) => (
                        <span key={i} className="text-[9px] bg-white/60 px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground mt-2">内容栏目</p>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {template.contentPillars.map((p: any, i: number) => (
                        <div key={i} className="bg-white/60 px-1.5 py-1 rounded text-[10px]">
                          <span className="font-medium">{p.name}</span> {Math.round(p.ratio * 100)}%
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground mt-2">更新计划</p>
                    <p className="text-[10px]">频率：建议每周 2-3 篇</p>
                    <p className="text-[10px] text-muted-foreground">内容配比：60% 产品 + 40% 信任</p>
                    <p className="text-[10px] font-medium text-muted-foreground mt-2">选题方向</p>
                    {template.initialTopics.slice(0, 3).map((t: string, i: number) => (
                      <div key={i} className="flex items-center gap-1 text-[10px]">
                        <span className="w-3 h-3 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[7px] font-bold">{i + 1}</span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 30-day topics */}
      {template && <Card><CardContent className="p-4">
        <h2 className="font-semibold text-sm mb-3">30天选题方向</h2>
        {template.initialTopics.slice(0, 5).map((t: string, i: number) => (
          <p key={i} className="text-sm">{i+1}. {t}</p>
        ))}
      </CardContent></Card>}
    </div>
  );
}
