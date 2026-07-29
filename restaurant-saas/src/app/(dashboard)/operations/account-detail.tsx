"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Trash2 } from "lucide-react";
import { STRATEGY_LABELS } from "@/lib/agent/classification/types";
import type { ContentStrategyType } from "@/lib/agent/classification/types";
import type {
  PlatformAccount,
  SyncGroup,
  AccountOperationPlan,
} from "./operations-types";

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

const STRATEGY_OPTIONS: { value: ContentStrategyType; label: string }[] = (
  Object.entries(STRATEGY_LABELS) as [ContentStrategyType, string][]
).map(([value, label]) => ({ value, label }));

// ── Props ──────────────────────────────────────

interface AccountDetailProps {
  account: PlatformAccount;
  plan: AccountOperationPlan | null;
  syncGroups: SyncGroup[];
  onUpdate: (id: string, updates: Partial<PlatformAccount>) => void;
  onDelete: (id: string) => void;
  onJoinGroup: (accountId: string, groupId: string) => void;
  onLeaveGroup: (accountId: string) => void;
  onCreateSyncGroup: (name: string, accountId: string) => string;
}

export function AccountDetail({
  account, plan, syncGroups,
  onUpdate, onDelete, onJoinGroup, onLeaveGroup, onCreateSyncGroup,
}: AccountDetailProps) {
  const [newTag, setNewTag] = useState("");
  const [showSyncPicker, setShowSyncPicker] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const isInGroup = !!account.syncGroupId;
  const currentGroup = isInGroup
    ? syncGroups.find((g) => g.id === account.syncGroupId)
    : null;

  // ── 方向标签操作 ──

  function addTag(tag: string) {
    const t = tag.trim();
    if (!t || account.directionTags.length >= 3) return;
    onUpdate(account.id, { directionTags: [...account.directionTags, t] });
    setNewTag("");
  }

  function removeTag(tag: string) {
    onUpdate(account.id, { directionTags: account.directionTags.filter((t) => t !== tag) });
  }

  // ── 同步组操作 ──

  function joinGroup(groupId: string) {
    onJoinGroup(account.id, groupId);
    setShowSyncPicker(false);
  }

  function leaveGroup() {
    onLeaveGroup(account.id);
  }

  function handleCreateGroup() {
    if (!newGroupName.trim()) return;
    const gid = onCreateSyncGroup(newGroupName.trim(), account.id);
    onUpdate(account.id, { syncGroupId: gid });
    setNewGroupName("");
    setShowSyncPicker(false);
  }

  // ── 渲染 ──

  return (
    <Card className={TICKET}>
      <CardContent className="p-5 sm:p-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: PLATFORM_COLORS[account.platform as PlatformId] }}
            />
            <p className="text-sm font-semibold text-[#2B2621]">
              {PLATFORM_NAMES[account.platform as PlatformId]}
              {" · "}
              {account.accountName}
            </p>
            <span className="rounded-sm border border-[#D9CFBF] px-1.5 py-0.5 text-[9px] text-[#8A7F6E]">
              {{ new: "新号", growing: "成长中", mature: "成熟" }[account.accountStage]}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onDelete(account.id)}
            className="text-[#8A7F6E] transition-colors hover:text-[#B23A1E]"
            title="删除账号"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* 战略定位 */}
        <div className="mt-5 space-y-3">
          <p className={EYEBROW}>战略定位</p>

          <div className="flex items-center gap-2">
            <select
              value={account.strategyType}
              onChange={(e) =>
                onUpdate(account.id, {
                  strategyType: e.target.value as ContentStrategyType,
                })
              }
              className="h-8 flex-1 rounded-sm border border-[#D9CFBF] bg-white px-2 text-xs text-[#2B2621] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B23A1E]"
            >
              {STRATEGY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* 方向标签 */}
          <div>
            <div className="flex flex-wrap items-center gap-1">
              {account.directionTags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-sm bg-[#F3E4D4] px-1.5 py-0.5 text-[10px] text-[#6B6259]"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="hover:text-[#B23A1E]"
                  >
                    ×
                  </button>
                </span>
              ))}
              {account.directionTags.length < 3 && (
                <span className="inline-flex items-center gap-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="+ 添加标签"
                    className="h-6 w-24 border-0 border-b border-dashed border-[#D9CFBF] bg-transparent px-1 py-0 text-[10px] text-[#8A7F6E] placeholder:text-[#B0A59A] focus-visible:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { addTag(newTag); }
                    }}
                  />
                </span>
              )}
            </div>
          </div>

          {/* 自定义定位 */}
          <div>
            <Input
              value={account.customPositioning ?? ""}
              onChange={(e) =>
                onUpdate(account.id, {
                  customPositioning: e.target.value || undefined,
                })
              }
              placeholder="自定义定位说明（可选）"
              className="h-8 border-[#D9CFBF] bg-white text-xs"
            />
          </div>
        </div>

        {/* 运营计划 */}
        {plan && (
          <div className="mt-5 space-y-3 border-t-2 border-dashed border-[#D9CFBF] pt-5">
            <p className={EYEBROW}>运营计划</p>

            {/* 一句话定位 */}
            <p className="text-xs font-semibold text-[#2B2621]">{plan.oneLinePositioning}</p>

            {/* 人设 */}
            <div>
              <p className="text-[10px] text-[#8A7F6E]">人设：{plan.persona.position}</p>
              <p className="text-[10px] text-[#8A7F6E]">语气：{plan.persona.tone}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {plan.persona.personality.slice(0, 3).map((t: string) => (
                  <span
                    key={t}
                    className="rounded-sm bg-[#FBF7EF] px-1.5 py-0.5 text-[9px] text-[#6B6259]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* 栏目配比 */}
            <div>
              <p className="text-[10px] font-medium text-[#2B2621]">内容栏目</p>
              <div className="mt-1 grid grid-cols-2 gap-1">
                {plan.contentPillars.map((p) => (
                  <div
                    key={p.name}
                    className="rounded-sm bg-[#FBF7EF] px-1.5 py-1 text-[10px] text-[#2B2621]"
                  >
                    <span className="font-medium">{p.name}</span>{" "}
                    <span className="font-mono tabular-nums text-[#8A7F6E]">
                      {Math.round(p.ratio * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 更新计划 */}
            <div>
              <p className="text-[10px] text-[#6B6259]">
                频率：{plan.recommendedFrequency}
              </p>
            </div>

            {/* 月度选题 */}
            <div>
              <p className="text-[10px] font-medium text-[#2B2621]">月度选题</p>
              <ol className="mt-1 space-y-1">
                {plan.initialTopics.slice(0, 5).map((t, i) => (
                  <li
                    key={i}
                    className="flex items-baseline gap-2 text-[10px] text-[#2B2621]"
                  >
                    <span className="w-5 shrink-0 font-mono tabular-nums text-[#B23A1E]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* 同步设置 */}
        <div className="mt-5 space-y-2 border-t-2 border-dashed border-[#D9CFBF] pt-5">
          <p className={EYEBROW}>同步设置</p>

          {!isInGroup ? (
            <div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  checked={!showSyncPicker}
                  onChange={() => setShowSyncPicker(false)}
                  className="accent-[#B23A1E]"
                />
                <span className="text-xs text-[#2B2621]">独立运营</span>
              </label>
              <label className="mt-1 flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  checked={showSyncPicker}
                  onChange={() => setShowSyncPicker(true)}
                  className="accent-[#B23A1E]"
                />
                <span className="text-xs text-[#2B2621]">
                  加入同步组（多账号同内容分发）
                </span>
              </label>

              {showSyncPicker && (
                <div className="mt-2 space-y-2">
                  {syncGroups.length > 0 && (
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) joinGroup(e.target.value);
                      }}
                      className="h-8 w-full rounded-sm border border-[#D9CFBF] bg-white px-2 text-xs text-[#2B2621]"
                    >
                      <option value="">选择已有同步组...</option>
                      {syncGroups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}（{g.accountIds.length}个账号）
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="flex items-center gap-2">
                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="新建同步组名称"
                      className="h-8 border-[#D9CFBF] bg-white text-xs"
                    />
                    <Button
                      size="sm"
                      className="whitespace-nowrap bg-[#2B2621] text-xs text-white hover:bg-[#1c1815]"
                      onClick={handleCreateGroup}
                      disabled={!newGroupName.trim()}
                    >
                      创建并加入
                    </Button>
                  </div>
                </div>
              )}

              <p className="mt-2 text-[9px] text-[#B0A59A]">
                Phase 2 将支持按平台调性微调后分发（adapted_copy）
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#3F7D57]" />
                  <span className="text-xs font-medium text-[#2B2621]">
                    {currentGroup?.name ?? "同步组"}
                  </span>
                  <span className="text-[9px] text-[#8A7F6E]">
                    同内容分发（same_copy）
                  </span>
                </div>
                <button
                  type="button"
                  onClick={leaveGroup}
                  className="text-[9px] text-[#B23A1E] hover:underline"
                >
                  退出
                </button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



