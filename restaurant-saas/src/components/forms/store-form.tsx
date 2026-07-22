"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface StoreFormData {
  name: string;
  address: string;
  phone: string;
  cuisineType: string;
  priceRange: string;
  targetCustomers: string;
  dianpingUrl: string;
  xiaohongshuUrl: string;
  douyinUrl: string;
}

interface StoreFormProps {
  onSubmit: (data: StoreFormData) => void;
}

const CUISINES = ["火锅", "川菜", "烧烤", "粤菜", "日料", "西餐", "小吃", "其他"];
const PRICES = ["50以下", "50-80", "80-120", "120-200", "200以上"];

export function StoreForm({ onSubmit }: StoreFormProps) {
  const [form, setForm] = useState<StoreFormData>({
    name: "", address: "", phone: "", cuisineType: "",
    priceRange: "", targetCustomers: "",
    dianpingUrl: "", xiaohongshuUrl: "", douyinUrl: "",
  });
  const [step, setStep] = useState(1);

  function update(key: keyof StoreFormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function goToNext() {
    if (!form.name || !form.cuisineType) {
      toast.error("请填写店名和菜系");
      return;
    }
    setStep(2);
  }

  function handleFinish(e: React.FormEvent) {
    e.preventDefault();
    if (!form.priceRange) {
      toast.error("请选择客单价");
      return;
    }
    onSubmit(form);
  }

  const FIELD_STYLE = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

  return (
    <form onSubmit={handleFinish} className="space-y-5">
      {step === 1 ? (
        <>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">店铺名称 *</label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="例如：老码头火锅" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">地址</label>
              <Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="店铺地址" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">电话</label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="联系电话" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">菜系 *</label>
              <select className={FIELD_STYLE} value={form.cuisineType} onChange={(e) => update("cuisineType", e.target.value)}>
                <option value="">请选择菜系</option>
                {CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <Button type="button" onClick={goToNext} className="w-full">下一步</Button>
        </>
      ) : (
        <>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">客单价 *</label>
              <select className={FIELD_STYLE} value={form.priceRange} onChange={(e) => update("priceRange", e.target.value)}>
                <option value="">请选择客单价</option>
                {PRICES.map((p) => <option key={p} value={p}>{p}元</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">目标客群</label>
              <Input value={form.targetCustomers} onChange={(e) => update("targetCustomers", e.target.value)} placeholder="例如：年轻人、家庭聚餐、上班族" />
            </div>
            <div className="border-t pt-3 mt-3">
              <p className="text-sm text-muted-foreground mb-3">平台链接（选填）</p>
              <Input value={form.dianpingUrl} onChange={(e) => update("dianpingUrl", e.target.value)} placeholder="大众点评链接" className="mb-2" />
              <Input value={form.xiaohongshuUrl} onChange={(e) => update("xiaohongshuUrl", e.target.value)} placeholder="小红书链接" className="mb-2" />
              <Input value={form.douyinUrl} onChange={(e) => update("douyinUrl", e.target.value)} placeholder="抖音链接" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">上一步</Button>
            <Button type="submit" className="flex-1">完成</Button>
          </div>
        </>
      )}
    </form>
  );
}
