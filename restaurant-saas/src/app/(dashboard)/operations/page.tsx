"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PLATFORMS = [
  { id: "dianping", name: "\u5927\u4f17\u70b9\u8bc4", color: "from-orange-500 to-red-500", stage: "\u65b0\u5efa\u671f" },
  { id: "xiaohongshu", name: "\u5c0f\u7ea2\u4e66", color: "from-pink-500 to-purple-500", stage: "\u672a\u5f00\u901a" },
  { id: "douyin", name: "\u6296\u97f3", color: "from-emerald-500 to-teal-500", stage: "\u672a\u5f00\u901a" },
];

const WEEK = [
  { day: "\u5468\u4e00", type: "\u70b9\u8bc4\u7b14\u8bb0", topic: "\u62db\u724c\u6bdb\u809a\u63a8\u8350" },
  { day: "\u5468\u4e8c", type: "\u5c0f\u7ea2\u4e66", topic: "\u73af\u5883\u6c1b\u56f4\u6253\u5361" },
  { day: "\u5468\u4e09", type: "\u6296\u97f3", topic: "\u540e\u53a8\u7eaa\u5b9e\u77ed\u7247" },
  { day: "\u5468\u56db", type: "\u8bc4\u4ef7\u56de\u590d", topic: "\u6279\u91cf\u5904\u7406\u8bc4\u4ef7" },
  { day: "\u5468\u4e94", type: "\u5c0f\u7ea2\u4e66", topic: "\u65b0\u54c1\u9884\u544a" },
];

const STAGE_TIPS = [
  "\u53d1\u5e03\u9996\u6279 5 \u7bc7\u5185\u5bb9\uff0c\u5efa\u7acb\u5e97\u94fa\u57fa\u7840\u4fe1\u606f",
  "\u56de\u590d\u6240\u6709\u5386\u53f2\u8bc4\u4ef7\uff0c\u7ef4\u62a4\u53e3\u7891",
  "\u786e\u5b9a\u54c1\u724c\u4eba\u8bbe\u548c\u5185\u5bb9\u65b9\u5411",
];

const DIRECTIONS = [
  { icon: "(hot)", title: "Tomato soup pot trending", desc: "Pair with signature tripe for a review", tag: "Trending" },
  { icon: "(book)", title: "Shanghai must-eat hotpot trending up", desc: "Publish collection content showing dish comparison", tag: "Xiaohongshu" },
];

export default function OperationsPage() {
  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">\u8fd0\u8425\u89c4\u5212</h1>
      <p className="text-sm text-muted-foreground -mt-4">\u7ba1\u7406\u591a\u5e73\u53f0\u8fd0\u8425\u7b56\u7565\u4e0e\u5185\u5bb9\u6392\u671f</p>

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
                <Button size="sm" variant="default" className="text-xs h-8">\u53bb\u521b\u5efa</Button>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground pt-2 border-t">
                <span>\u5185\u5bb9 0 \u7bc7</span>
                <span>\u7c89\u4e1d 0</span>
                <span>\u672a\u7ed1\u5b9a</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardContent className="p-4">
            <h2 className="font-semibold text-sm mb-4">\u672c\u5468\u5185\u5bb9\u8ba1\u5212</h2>
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
            <h2 className="font-semibold text-sm mb-3">\u8d26\u53f7\u9636\u6bb5</h2>
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded">\u65b0\u5efa\u671f</span>
                <span className="text-xs text-muted-foreground">\u7b2c 1 \u5468</span>
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
          <h2 className="font-semibold text-sm mb-3">\u521b\u4f5c\u65b9\u5411\u5efa\u8bae</h2>
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
