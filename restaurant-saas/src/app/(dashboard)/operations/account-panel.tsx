"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, Hash } from "lucide-react";
import type { PlatformAccount } from "./operations-types";
import type { ContentStrategyType } from "@/lib/agent/classification/types";
import { STRATEGY_LABELS } from "@/lib/agent/classification/types";

// ── 样式常量 ──────────────────────────────────

const TICKET = "bg-[#FFFDF8] border border-[#E6DCC8] rounded-sm shadow-[0_1px_2px_rgba(43,38,33,0.06)]";
const EYEBROW = "text-[10px] font-mono tracking-[0.2em] text-[#8A7F6E] uppercase";

type PlatformId = "dianping" | "xiaohongshu" | "douyin";

const PLATFORM_NAMES: Record<PlatformId, string> = {
  dianping: "大众点评", xiaohongshu: "小红书", douyin: "抖音",
};
const PLATFORM_COLORS: Record<PlatformId, string> = {
  dianping: "#E1483A", xiaohongshu: "#E0356B", douyin: "#1F1F1F",
};
const PLATFORM_LIST: PlatformId[] = ["dianping", "xiaohongshu", "douyin"];

const STRATEGY_OPTIONS: { value: ContentStrategyType; label: string }[] = (
  Object.entries(STRATEGY_LABELS) as [ContentStrategyType, string][]
).map(([value, label]) => ({ value, label }));

// ── Props ──────────────────────────────────────

interface AccountPanelProps {
  accounts: PlatformAccount[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (account: PlatformAccount) => void;
}

export function AccountPanel({ accounts, selectedId, onSelect, onAdd }: AccountPanelProps) {
  const [addingPlatform, setAddingPlatform] = useState<PlatformId | null>(null);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newFollowers, setNewFollowers] = useState(0);
const [newStage, setNewStage] = useState<"new" | "growing" | "mature">("new");
  const [newStrategy, setNewStrategy] = useState<ContentStrategyType>("scene_experience");
  const [newTagsInput, setNewTagsInput] = useState("");
  const [newCustomPos, setNewCustomPos] = useState("");

  function handleAdd() {
    if (!addingPlatform || !newName.trim()) return;
    const tags = newTagsInput
      .split(/[,，、\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);

    const account: PlatformAccount = {
      id: crypto.randomUUID(),
      merchantId: "",
      platform: addingPlatform,
      accountName: newName.trim(),
      accountUrl: newUrl.trim(),
      followers: newFollowers,
      accountStage: newStage,
      strategySource: newCustomPos.trim() ? "custom" : "manual",
      strategyType: newStrategy,
      directionTags: tags,
      customPositioning: newCustomPos.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAdd(account);
    setAddingPlatform(null);
    setNewName("");
    setNewUrl("");
    setNewStage("new");
    setNewFollowers(0);
    setNewTagsInput("");
    setNewCustomPos("");

  }

  // ── 按平台分组 ──

  const grouped = PLATFORM_LIST.map((p) => ({
    platform: p,
    accounts: accounts.filter((a) => a.platform === p),
  }));

  return (
    <Card className={TICKET}>
      <CardContent className="p-5 sm:p-6">
        <p className={`${EYEBROW} mb-3`}>账号管理</p>

        {/* 各平台分组 */}
        <div className="space-y-4">
          {grouped.map(({ platform, accounts: accs }) => (
            <div key={platform}>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: PLATFORM_COLORS[platform] }} />
                <span className="text-xs font-semibold text-[#2B2621]">{PLATFORM_NAMES[platform]}</span>
                {accs.length > 0 && (
                  <span className="rounded-full bg-[#F3E4D4] px-1.5 py-0.5 text-[9px] font-mono text-[#8A7F6E]">
                    {accs.length}
                  </span>
                )}
              </div>

              {/* 账号列表 */}
              <div className="ml-4 flex flex-wrap gap-1.5">
                {accs.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onSelect(a.id)}
                    className={`inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B23A1E] ${
                      selectedId === a.id
                        ? "border-[#B23A1E] bg-[#FBF7EF] text-[#B23A1E] font-semibold"
                        : "border-[#D9CFBF] bg-white text-[#2B2621] hover:border-[#B23A1E]"
                    }`}
                  >
                    {selectedId === a.id && <Check className="h-3 w-3" />}
                    {a.accountName || PLATFORM_NAMES[a.platform]}
                  </button>
                ))}

                {/* 添加按钮 */}
                {addingPlatform !== platform && (
                  <button
                    type="button"
                    onClick={() => { setAddingPlatform(platform); }}
                    className="inline-flex items-center gap-1 rounded-sm border border-dashed border-[#D9CFBF] bg-transparent px-2 py-1 text-xs text-[#8A7F6E] transition-colors hover:border-[#B23A1E] hover:text-[#B23A1E]"
                  >
                    <Plus className="h-3 w-3" /> 添加
                  </button>
                )}
              </div>

              {/* 添加表单 */}
              {addingPlatform === platform && (
                <div className="ml-4 mt-2 space-y-2 rounded-sm border border-dashed border-[#D9CFBF] bg-[#FBF7EF]/70 p-3">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="账号名称"
                    className="h-8 border-[#D9CFBF] bg-white text-xs"
                  />
                  <Input
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="账号链接（可选）"
                    className="h-8 border-[#D9CFBF] bg-white text-xs"
                  />

                  <Input
                    value={newFollowers === 0 ? "" : String(newFollowers)}
                    onChange={(e) => setNewFollowers(parseInt(e.target.value) || 0)}
                    placeholder="粉丝数（可选）"
                    className="h-8 border-[#D9CFBF] bg-white text-xs"
                    type="number"
                    min="0"
                  />
                  {/* 账号阶段 */}
                  <div className="flex gap-2">
                    {(["new", "growing", "mature"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewStage(s)}
                        className={`flex-1 rounded-sm border py-1 text-[10px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B23A1E] ${
                          newStage === s
                            ? "border-[#B23A1E] bg-[#F3E4D4] font-semibold text-[#B23A1E]"
                            : "border-[#D9CFBF] bg-white text-[#6B6259] hover:border-[#B23A1E]"
                        }`}
                      >
                        {{ new: "新号", growing: "成长中", mature: "成熟" }[s]}
                      </button>
                    ))}
                  </div>

                  {/* 战略类型 */}
                  <select
                    value={newStrategy}
                    onChange={(e) => setNewStrategy(e.target.value as ContentStrategyType)}
                    className="h-8 w-full rounded-sm border border-[#D9CFBF] bg-white px-2 text-xs text-[#2B2621] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B23A1E]"
                  >
                    {STRATEGY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>

                  {/* 方向标签 */}
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3 text-[#8A7F6E]" />
                    <Input
                      value={newTagsInput}
                      onChange={(e) => setNewTagsInput(e.target.value)}
                      placeholder="方向标签，用逗号分隔（最多3个）"
                      className="h-8 border-[#D9CFBF] bg-white text-xs"
                    />
                  </div>

                  {/* 自定义定位（可选） */}
                  <Input
                    value={newCustomPos}
                    onChange={(e) => setNewCustomPos(e.target.value)}
                    placeholder="自定义定位说明（可选）"
                    className="h-8 border-[#D9CFBF] bg-white text-xs"
                  />

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-[#2B2621] text-xs text-white hover:bg-[#1c1815]"
                      onClick={handleAdd}
                      disabled={!newName.trim()}
                    >
                      添加账号
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#D9CFBF] text-xs text-[#6B6259]"
                      onClick={() => { setAddingPlatform(null); }}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


