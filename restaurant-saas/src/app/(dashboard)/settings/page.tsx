"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CUISINES = ["火锅", "川菜", "烧烤", "粵菜", "日料", "西餐", "小吃", "其他"];
const PRICES = ["50以下", "50-80", "80-120", "120-200", "200以上"];

export default function SettingsPage() {
  const [form, setForm] = useState({
    name: "老码头火锅", address: "上海市黄浦区人民广场", phone: "021-12345678",
    cuisineType: "火锅", priceRange: "80-120", targetCustomers: "年轻人、朋友聚餐",
    dianpingUrl: "", xiaohongshuUrl: "", douyinUrl: "",
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    console.log("Save:", form);
    toast.success("设置已保存");
  }

  const SEL = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight">设置</h1>
      <p className="text-sm text-muted-foreground -mt-4">管理店铺信息和账号配置</p>

      <Card>
        <CardHeader><CardTitle className="text-base">店铺信息</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[{ k: "name", l: "店铺名称" }, { k: "address", l: "地址" }, { k: "phone", l: "电话" }, { k: "targetCustomers", l: "目标客群" }].map(({ k, l }) => (
              <div key={k}>
                <label className="text-xs font-medium mb-1 block">{l}</label>
                <Input value={(form as any)[k]} onChange={(e) => update(k, e.target.value)} />
              </div>
            ))}
            <div>
              <label className="text-xs font-medium mb-1 block">菜系</label>
              <select className={SEL} value={form.cuisineType} onChange={(e) => update("cuisineType", e.target.value)}>
                {CUISINES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">客单价</label>
              <select className={SEL} value={form.priceRange} onChange={(e) => update("priceRange", e.target.value)}>
                {PRICES.map((p) => <option key={p}>{p}元</option>)}
              </select>
            </div>
          </div>
          <Button onClick={handleSave}>保存修改</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">平台账号</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[{ k: "dianpingUrl", l: "大众点评" }, { k: "xiaohongshuUrl", l: "小红书" }, { k: "douyinUrl", l: "抖音" }].map(({ k, l }) => (
            <div key={k}>
              <label className="text-xs font-medium mb-1 block">{l}链接</label>
              <Input value={(form as any)[k]} onChange={(e) => update(k, e.target.value)} placeholder={"https://" + l + ".com/..."} />
            </div>
          ))}
          <Button onClick={handleSave}>保存</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">品牌人设</CardTitle></CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="font-medium text-sm">老字号口碑路线</div>
            <div className="text-xs text-muted-foreground mt-1">朴实真诚，突出做了12年的历史感</div>
            <div className="flex gap-2 mt-2">
              {["最实惠", "靠谱", "经典"].map((t) => (
                <span key={t} className="text-[10px] bg-muted px-2 py-0.5 rounded">{t}</span>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">人设在注册时选择，后续可联系客服修改</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">订阅信息</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Demo 模式</div>
            <p className="text-xs text-muted-foreground mt-0.5">14天试用剩余，到期后可升级</p>
          </div>
          <Button variant="outline" size="sm">升级</Button>
        </CardContent>
      </Card>
    </div>
  );
}
