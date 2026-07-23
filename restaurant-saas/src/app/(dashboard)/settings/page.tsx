"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SettingsPage() {
  const [name, setName] = useState("老码头火锅");
  const [address, setAddress] = useState("上海市黄浦区人民广场");
  const [phone, setPhone] = useState("021-12345678");
  const [cuisine, setCuisine] = useState("火锅");
  const [price, setPrice] = useState("80-120");
  const [target, setTarget] = useState("年轻人、朋友聚餐");
  const [dpUrl, setDpUrl] = useState("");
  const [xhsUrl, setXhsUrl] = useState("");
  const [dyUrl, setDyUrl] = useState("");

  function save() {
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
                <option>火锅</option><option>川菜</option><option>烧烤</option><option>日料</option><option>西餐</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">客单价</label>
              <select className={SEL} value={price} onChange={(e) => setPrice(e.target.value)}>
                <option>50以下</option><option>50-80</option><option>80-120</option><option>120-200</option><option>200以上</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">目标客群</label>
              <Input value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
          </div>
          <Button onClick={save}>保存修改</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">平台账号</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-medium mb-1 block">大众点评链接</label>
            <Input value={dpUrl} onChange={(e) => setDpUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">小红书链接</label>
            <Input value={xhsUrl} onChange={(e) => setXhsUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">抖音链接</label>
            <Input value={dyUrl} onChange={(e) => setDyUrl(e.target.value)} placeholder="https://..." />
          </div>
          <Button onClick={save}>保存</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">品牌人设</CardTitle></CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="font-medium text-sm">老字号口碑路线</div>
            <div className="text-xs text-muted-foreground mt-1">朴实真诚，突出做了12年的历史感</div>
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded">最实惠</span>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded">靠谱</span>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded">经典</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">人设在注册时选择</p>
        </CardContent>
      </Card>

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
