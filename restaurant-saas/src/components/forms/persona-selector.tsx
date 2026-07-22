"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { BrandPersona } from "@/types";

const DEMO_PERSONAS: BrandPersona[] = [
  {
    position: "老字号口碑路线",
    personality: ["最实惠", "靠谱", "经典"],
    tone: "朴实真诚，突出“做了XX年”的历史感",
    contentDirections: ["后厨纪实", "老客故事", "经典菜品"],
    examplePosts: ["开了12年的老成都火锅，每天现熬牛油锅底"],
  },
  {
    position: "年轻人打卡路线",
    personality: ["潮流", "有趣", "适合分享"],
    tone: "活泼潮流，带网络感",
    contentDirections: ["环境氛围", "网红单品", "社交场景"],
    examplePosts: ["在上海挖到一家神仙火锅！人均80吃到撑"],
  },
  {
    position: "专业品瓣路线",
    personality: ["专业", "认真", "有见解"],
    tone: "专业策展，像美食记者",
    contentDirections: ["菜品测评", "食材溯源", "做法解析"],
    examplePosts: ["深圳火锅横评：5家网红店哪家真的好吃？"],
  },
];

interface PersonaSelectorProps {
  onSelect: (persona: BrandPersona) => void;
}

export function PersonaSelector({ onSelect }: PersonaSelectorProps) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        根据你的店铺信息，我们为你推荐以下人设方案：
      </p>
      <div className="grid gap-3">
        {DEMO_PERSONAS.map((persona, i) => (
          <Card
            key={i}
            className={`p-4 cursor-pointer transition-all ${
              selected === i ? "ring-2 ring-primary" : "hover:bg-muted/50"
            }`}
            onClick={() => setSelected(i)}
          >
            <h3 className="font-semibold">{persona.position}</h3>
            <div className="flex gap-2 mt-2">
              {persona.personality.map((tag) => (
                <span key={tag} className="text-xs bg-muted px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">{persona.tone}</p>
            <p className="text-xs text-muted-foreground mt-1">
              内容方向：{persona.contentDirections.join(" · ")}
            </p>
          </Card>
        ))}
      </div>
      <Button
        className="w-full"
        disabled={selected === null}
        onClick={() => selected !== null && onSelect(DEMO_PERSONAS[selected])}
      >
        确定人设
      </Button>
    </div>
  );
}
