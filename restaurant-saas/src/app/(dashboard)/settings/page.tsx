"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { classifyMerchant } from "@/lib/agent/classification/merchant-classifier";
import { STRATEGY_LABELS } from "@/lib/agent/classification/types";
import { STORAGE_KEYS } from "@/lib/agent/classification/types";
import type { ClassificationInput } from "@/lib/agent/classification/types";
import type { PlatformAccountConfig } from "@/lib/agent/classification/types";

export default function SettingsPage() {
  // ── 店铺信息 ──
  const [name, setName] = useState("老码头火锅");
  const [address, setAddress] = useState("成都市锦江区建设路");
  const [phone, setPhone] = useState("028-12345678");
  const [cuisine, setCuisine] = useState("火锅");
  const [price, setPrice] = useState("80-120");
  const [target, setTarget] = useState("年轻人、朋友聚餐");
  const [stage, setStage] = useState("new");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoInput, setPhotoInput] = useState("");

  // ── 分类结果 ──
  const [strategyLabel, setStrategyLabel] = useState<string | null>(null);
  const [strategyScore, setStrategyScore] = useState<number>(0);

  // 加载已保存的数据
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STORE_INFO);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.name) setName(data.name);
        if (data.address) setAddress(data.address);
        if (data.phone) setPhone(data.phone);
        if (data.cuisineType) setCuisine(data.cuisineType);
        if (data.priceRange) setPrice(data.priceRange);
        if (data.targetCustomers) setTarget(data.targetCustomers);
        if (data.globalStage) setStage(data.globalStage);
        if (data.brandAssets) setPhotoUrls(data.brandAssets);
      }
    } catch {}
  }, []);

  function runClassification() {
    const input: ClassificationInput = {
      cuisineType: cuisine,
      priceRange: price,
      targetCustomers: target,
      hasDianping: false, // 由 platformAccounts 决定，这里留空
      hasXiaohongshu: false,
      hasDouyin: false,
      accountStage: stage as "new" | "growing" | "mature",
      city: address.match(/(.+?(?:市|区|县|城))/)?.[1] || "",
    };
    try {
      const result = classifyMerchant(input);
      setStrategyLabel(STRATEGY_LABELS[result.primaryType]);
      setStrategyScore(result.details?.[0]?.score ?? 0);
    } catch {}
  }

  function save() {
    const storeInfo = {
      name, address, phone,
      cuisineType: cuisine,
      priceRange: price,
      targetCustomers: target,
      globalStage: stage,
      brandAssets: photoUrls,
    };
    localStorage.setItem(STORAGE_KEYS.STORE_INFO, JSON.stringify(storeInfo));
    runClassification();
    toast.success("店铺信息已保存，战略诊断已更新");
  }

  function addPhoto() {
    if (photoInput.trim() && !photoUrls.includes(photoInput.trim())) {
      setPhotoUrls((prev) => [...prev, photoInput.trim()]);
      setPhotoInput("");
    }
  }

  function removePhoto(url: string) {
    setPhotoUrls((prev) => prev.filter((u) => u !== url));
  }

  const SEL = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight">设置</h1>
      <p className="text-sm text-muted-foreground -mt-4">管理店铺信息和账号配置</p>

      {/* 店铺信息 */}
      <Card>
        <CardHeader><CardTitle className="text-base">店铺信息</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">店铺名称</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">地址</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">电话</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">菜系</label>
              <select className={SEL} value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                <option>火锅</option><option>川菜</option><option>烧烤</option>
                <option>粤菜</option><option>日料</option><option>西餐</option>
                <option>小吃</option><option>咖啡</option><option>烘焙</option><option>其他</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">客单价</label>
              <select className={SEL} value={price} onChange={(e) => setPrice(e.target.value)}>
                <option>50以下</option><option>50-80</option><option>80-120</option>
                <option>120-200</option><option>200以上</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">目标客群</label>
              <Input value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">主账号阶段</label>
              <select className={SEL} value={stage} onChange={(e) => setStage(e.target.value)}>
                <option value="new">新建期</option>
                <option value="growing">成长期</option>
                <option value="mature">成熟期</option>
              </select>
              <p className="text-[10px] text-muted-foreground mt-0.5">各平台阶段不同时以此为准，不设置则自动从已绑定平台推断</p>
            </div>
          </div>

          {/* 店铺照片 */}
          <div className="border-t pt-3">
            <label className="text-xs font-medium mb-1.5 block">店铺照片（品牌素材）</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="输入图片URL后添加"
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" variant="outline" onClick={addPhoto}>添加</Button>
            </div>
            {photoUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photoUrls.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt={""} className="w-16 h-16 object-cover rounded-md border"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <button
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100"
                      onClick={() => removePhoto(url)}
                    >x</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 分类诊断 */}
          {strategyLabel && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-medium bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">
                  当前战略诊断
                </span>
              </div>
              <p className="text-sm font-medium">
                {strategyLabel}（{strategyScore}分）
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                在「运营规划」页面可按需更换战略方向和配置平台账号
              </p>
            </div>
          )}

          <Button onClick={save}>保存修改</Button>
        </CardContent>
      </Card>

      {/* 平台账号（只读概览，编辑在运营规划页） */}
      <Card>
        <CardHeader><CardTitle className="text-base">已绑定的平台账号</CardTitle></CardHeader>
        <CardContent>
          <PlatformAccountList />
          <p className="text-xs text-muted-foreground mt-3">
            在「运营规划」页面创建和管理各平台的独立配置
          </p>
        </CardContent>
      </Card>

      {/* 品牌人设（只读） */}
      <Card>
        <CardHeader><CardTitle className="text-base">品牌人设</CardTitle></CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="font-medium text-sm">当前人设</div>
            <p className="text-xs text-muted-foreground mt-1">人设在注册时选择，可在运营规划页面重新配置</p>
          </div>
        </CardContent>
      </Card>

      {/* 订阅信息 */}
      <Card>
        <CardHeader><CardTitle className="text-base">订阅信息</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Demo 模式</div>
            <p className="text-xs text-muted-foreground mt-0.5">14天试用剩余</p>
          </div>
          <Button variant="outline" size="sm">升级</Button>
        </CardContent>
      </Card>
    </div>
  );
}

/** 已绑定平台列表（只读） */
function PlatformAccountList() {
  const [accounts, setAccounts] = useState<PlatformAccountConfig[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLATFORM_ACCOUNTS);
      if (saved) setAccounts(JSON.parse(saved));
    } catch {}
  }, []);

  const bound = accounts.filter((a) => a.isBound);
  if (bound.length === 0) {
    return <p className="text-sm text-muted-foreground">暂未绑定任何平台</p>;
  }

  return (
    <div className="space-y-2">
      {bound.map((a) => (
        <div key={a.platform} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
          <div>
            <span className="font-medium text-sm">{a.accountName}</span>
            <span className="text-xs text-muted-foreground ml-2">
              {a.platform === "dianping" ? "大众点评" : a.platform === "xiaohongshu" ? "小红书" : "抖音"}
              {a.platformStage ? " · " + (a.platformStage === "new" ? "新建" : a.platformStage === "growing" ? "成长" : "成熟") : ""}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{a.followers ? a.followers + " 粉丝" : ""}</span>
        </div>
      ))}
    </div>
  );
}

