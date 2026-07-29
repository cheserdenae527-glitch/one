"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Check, Link2 } from "lucide-react";
import type { PlatformAccount, SyncGroup } from "./operations-types";


// ── 样式常量 ──────────────────────────────────

const TICKET = "bg-[#FFFDF8] border border-[#E6DCC8] rounded-sm shadow-[0_1px_2px_rgba(43,38,33,0.06)]";
const EYEBROW = "text-[10px] font-mono tracking-[0.2em] text-[#8A7F6E] uppercase";

type PlatformId = "dianping" | "xiaohongshu" | "douyin";

const PLATFORM_NAMES: Record<PlatformId, string> = {
  dianping: "大众点评", xiaohongshu: "小红书", douyin: "抖音",
};

// ── Props ──────────────────────────────────────

interface SyncGroupSectionProps {
  syncGroups: SyncGroup[];
  accounts: PlatformAccount[];
  onCreateGroup: (name: string, accountIds: string[]) => string;
  onDeleteGroup: (id: string) => void;
}

export function SyncGroupSection({
  syncGroups,
  accounts,
  onCreateGroup,
  onDeleteGroup,
}: SyncGroupSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  function handleCreate() {
    if (!groupName.trim()) return;
    const gid = onCreateGroup(groupName.trim(), selectedAccountIds);
    if (gid) {
      setGroupName("");
      setSelectedAccountIds([]);
      setShowForm(false);
    }
  }

  function toggleAccount(id: string) {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function getAccountName(id: string): string {
    return accounts.find((a) => a.id === id)?.accountName ?? id.slice(0, 8);
  }

  if (syncGroups.length === 0 && !showForm) return null;

  return (
    <Card className={TICKET}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <p className={EYEBROW}>同步组</p>
          <Button
            size="sm"
            variant="outline"
            className="h-7 border-[#D9CFBF] text-xs text-[#6B6259] hover:bg-[#FBF7EF]"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="mr-1 h-3 w-3" />
            新建
          </Button>
        </div>

        {/* 新建表单 */}
        {showForm && (
          <div className="mt-3 space-y-3 rounded-sm border border-dashed border-[#D9CFBF] bg-[#FBF7EF]/70 p-3">
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder='同步组名称，如「一鱼多吃组」'
              className="h-8 border-[#D9CFBF] bg-white text-xs"
            />

            {accounts.length > 0 && (
              <div>
                <p className="mb-1 text-[10px] text-[#8A7F6E]">选择账号加入</p>
                <div className="flex flex-wrap gap-1.5">
                  {accounts.map((a) => {
                    const sel = selectedAccountIds.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggleAccount(a.id)}
                        className={`rounded-sm border px-2 py-1 text-[10px] transition-colors ${
                          sel
                            ? "border-[#B23A1E] bg-[#F3E4D4] font-semibold text-[#B23A1E]"
                            : "border-[#D9CFBF] bg-white text-[#6B6259] hover:border-[#B23A1E]"
                        }`}
                      >
                        {sel && <Check className="mr-1 inline h-2.5 w-2.5" />}
                        {PLATFORM_NAMES[a.platform as PlatformId]}/{a.accountName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              size="sm"
              className="w-full bg-[#2B2621] text-xs text-white hover:bg-[#1c1815]"
              onClick={handleCreate}
              disabled={!groupName.trim()}
            >
              创建同步组
            </Button>
          </div>
        )}

        {/* 同步组列表 */}
        {syncGroups.length > 0 && (
          <div className="mt-3 space-y-2">
            {syncGroups.map((g) => {
              const expanded = expandedGroup === g.id;
              const memberNames = g.accountIds
                .map((id) => getAccountName(id))
                .join(" + ");
              return (
                <div
                  key={g.id}
                  className="rounded-sm border border-[#E6DCC8] bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedGroup(expanded ? null : g.id)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B23A1E]"
                  >
                    <div className="flex items-center gap-2">
                      <Link2 className="h-3.5 w-3.5 text-[#8A7F6E]" />
                      <span className="text-xs font-medium text-[#2B2621]">
                        {g.name}
                      </span>
                      <span className="text-[9px] text-[#8A7F6E]">
                        {memberNames}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGroup(g.id);
                      }}
                      className="text-[#8A7F6E] hover:text-[#B23A1E]"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </button>

                  {expanded && (
                    <div className="border-t border-dashed border-[#E6DCC8] px-3 py-2">
                      <p className="text-[9px] text-[#8A7F6E]">
                        策略：同内容分发（same_copy）
                      </p>
                      <p className="mt-1 text-[9px] text-[#B0A59A]">
                        Phase 2 将支持按平台调性微调分发
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


