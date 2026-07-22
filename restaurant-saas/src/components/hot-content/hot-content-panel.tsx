"use client";

import { useState } from "react";

const PLATFORMS = ["评分", "书", "抖"];
const CUISINES = ["全部菜系", "火锅", "川菜", "烧烤"];
const CITIES = ["全国", "上海", "北京", "成都"];

export function HotContentPanel() {
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [cuisine, setCuisine] = useState(CUISINES[0]);
  const [city, setCity] = useState(CITIES[0]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">热门参考</h3>
        <div className="flex gap-1 bg-background border rounded-md p-0.5">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`text-xs px-2 py-0.5 rounded ${
                platform === p ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <select className="flex-1 text-xs border rounded px-2 py-1 bg-background" value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
          {CUISINES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="flex-1 text-xs border rounded px-2 py-1 bg-background" value={city} onChange={(e) => setCity(e.target.value)}>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="text-xs text-muted-foreground text-center py-8">
        数据将在榜单采集任务完成后显示
      </div>
    </div>
  );
}
