"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface SubTypeItem { id: string; name: string; }
interface SubTypeGroup { label: string; items: SubTypeItem[]; }

const GROUPS: SubTypeGroup[] = [
  { label: "\u8d26\u53f7\u57fa\u7840\u7c7b", items: [{ id: "douyin_nickname", name: "\u8d26\u53f7\u6635\u79f0" }, { id: "douyin_bio", name: "\u7b80\u4ecbBio" }] },
  { label: "\u77ed\u89c6\u9891\u5185\u5bb9\u7c7b", items: [{ id: "douyin_title", name: "\u89c6\u9891\u6807\u9898" }, { id: "douyin_description", name: "\u89c6\u9891\u63cf\u8ff0(\u6838\u5fc3)" }, { id: "douyin_subtitle", name: "\u5b57\u5e55/\u8d34\u7eb8\u6587\u6848" }] },
  { label: "\u76f4\u64ad\u7c7b", items: [{ id: "douyin_live_opener", name: "\u5f00\u573a\u767d" }, { id: "douyin_live_product", name: "\u4ea7\u54c1\u8bb2\u89e3\u811a\u672c" }, { id: "douyin_live_cta", name: "\u50ac\u5355/\u4e92\u52a8\u8bdd\u672f" }, { id: "douyin_live_closer", name: "\u7ed3\u675f\u8bed" }] },
  { label: "\u8425\u9500\u8f6c\u5316\u7c7b", items: [{ id: "douyin_promotion", name: "\u56e2\u8d2d/\u5546\u54c1\u5361\u6587\u6848" }, { id: "douyin_poi", name: "POI\u4f4d\u7f6e\u63cf\u8ff0" }, { id: "douyin_ad", name: "\u6295\u653e\u7d20\u6750\u6587\u6848" }, { id: "douyin_hashtag", name: "\u8bdd\u9898\u6807\u7b7e\u7ec4\u5408" }] },
  { label: "\u793e\u533a\u8fd0\u8425\u7c7b", items: [{ id: "douyin_reply", name: "\u8bc4\u8bba\u56de\u590d\u6a21\u677f" }] },
];

interface Props {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function DouyinSubTypeSelector({ selected, onSelect }: Props) {
  return (
    <div className="space-y-3">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <p className="text-xs text-muted-foreground mb-1.5">{g.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {g.items.map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={selected === item.id ? "default" : "outline"}
                className="rounded-full text-xs h-7 px-3"
                onClick={() => onSelect(item.id)}
              >
                {item.name}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
