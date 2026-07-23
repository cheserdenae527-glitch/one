"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PLATFORMS = [
  { id: "dianping", name: "大众点评", color: "from-orange-500 to-red-500", stage: "新建期" },
  { id: "xiaohongshu", name: "小红书", color: "from-pink-500 to-purple-500", stage: "未开通" },
  { id: "douyin", name: "抖音", color: "from-emerald-500 to-teal-500", stage: "未开通" },
];

const WEEK = [
  { day: "周一", type: "点评笔记", topic: "招牌毛肚推荐" },
  { day: "周二", type: "小红书", topic: "环境氛围打卡" },
  { day: "周三", type: "抖音", topic: "后厨纪实短片" },
  { day: "周四", type: "评价回复", topic: "批量处理评价" },
  { day: "周五", type: "小红书", topic: "新品预告" },
];

const STAGE_TIPS = [
  "发布首批 5 篇内容，建立店铺基础信息",
  "回复所有历史评价，维护口碑",
  "确定品牌人设和内容方向",
];

const DIRECTIONS = [
  { icon: "(hot)", title: "Tomato soup pot trending", desc: "Pair with signature tripe for a review", tag: "Trending" },
  { icon: "(book)", title: "Shanghai must-eat hotpot trending up", desc: "Publish collection content showing dish comparison", tag: "Xiaohongshu" },
];

export default function OperationsPage() {
  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">运营规划</h1>
      <p className="text-sm text-muted-foreground -mt-4">管理多平台运营策略与内容排期</p>

      <div className="grid grid-cols-3 gap-4">
        {PLATFORMS.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className={"h-1.5 bg-gradient-to-r " + p.color} />
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={"w-9 h-9 rounded-full bg-gradient-to-br " + p.color + " flex items-center justify-center text-white text-xs font-bold"}>
                  {p.id === "dianping" ? "D" : p.id === "xiaohongshu" ? "S" : "D2"}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.stage}</div>
                </div>
                <Button size="sm" variant="default" className="text-xs h-8">去创建</Button>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground pt-2 border-t">
                <span>内容 0 篇</span>
                <span>粉丝 0</span>
                <span>未绑定</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardContent className="p-4">
            <h2 className="font-semibold text-sm mb-4">本周内容计划</h2>
            <div className="grid grid-cols-5 gap-2">
              {WEEK.map((w) => (
                <div key={w.day} className="text-center p-2.5 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1.5">{w.day}</div>
                  <div className="text-[10px] font-medium bg-amber-50 text-amber-700 rounded px-1.5 py-0.5">{w.type}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{w.topic}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-sm mb-3">账号阶段</h2>
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded">新建期</span>
                <span className="text-xs text-muted-foreground">第 1 周</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full mb-3">
                <div className="w-[15%] h-full bg-amber-400 rounded-full" />
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {STAGE_TIPS.map((tip, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold text-sm mb-3">创作方向建议</h2>
          <div className="grid grid-cols-2 gap-3">
            {DIRECTIONS.map((d, i) => (
              <div key={i} className="flex gap-3 p-3 bg-muted/20 rounded-lg">
                <span className="flex-shrink-0 text-xs font-bold bg-muted px-2 py-1 rounded">{d.icon}</span>
                <div>
                  <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{d.tag}</span>
                  <div className="text-sm font-medium mt-1">{d.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
