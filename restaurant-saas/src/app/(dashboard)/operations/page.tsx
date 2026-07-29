"use client";

import { useState, useEffect, useMemo } from "react";
import { UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { classifyMerchant } from "@/lib/agent/classification/merchant-classifier";
import { getStrategyTemplate } from "@/lib/agent/classification/strategy-templates";
import { STRATEGY_LABELS } from "@/lib/agent/classification/types";
import type { ContentStrategyType, ClassificationInput } from "@/lib/agent/classification/types";
import type { MerchantClassification } from "@/lib/agent/classification/types";

import type { PlatformAccount, SyncGroup, AccountOperationPlan } from "./operations-types";
import { OPS_STORAGE_KEYS } from "./operations-types";
import { generateAccountPlan } from "./plan-generator";
import { AccountPanel } from "./account-panel";
import { AccountDetail } from "./account-detail";
import { SyncGroupSection } from "./sync-group-section";

const TICKET = "bg-[#FFFDF8] border border-[#E6DCC8] rounded-sm shadow-[0_1px_2px_rgba(43,38,33,0.06)]";
const EYEBROW = "text-[10px] font-mono tracking-[0.2em] text-[#8A7F6E] uppercase";

const DEMO: ClassificationInput = {
  cuisineType: "火锅", priceRange: "80-120", targetCustomers: "年轻人、朋友聚餐",
  hasDianping: false, hasXiaohongshu: false, hasDouyin: false,
  accountStage: "new", city: "成都",
};

function makeMerchantInfo(accounts: PlatformAccount[]): ClassificationInput {
  const raw = typeof window !== "undefined"
    ? localStorage.getItem(OPS_STORAGE_KEYS.STORE_INFO)
    : null;
  if (raw) {
    try {
      const d = JSON.parse(raw);
      return {
        cuisineType: d.cuisineType || DEMO.cuisineType,
        priceRange: d.priceRange || DEMO.priceRange,
        targetCustomers: d.targetCustomers || DEMO.targetCustomers,
        hasDianping: accounts.some((a) => a.platform === "dianping"),
        hasXiaohongshu: accounts.some((a) => a.platform === "xiaohongshu"),
        hasDouyin: accounts.some((a) => a.platform === "douyin"),
        accountStage: (d.globalStage as any) ?? DEMO.accountStage,
        city: d.city || DEMO.city,
      };
    } catch {}
  }
  return DEMO;
}

function migrateOldAccounts(storedMerchantId: string): PlatformAccount[] {
  const raw = localStorage.getItem(OPS_STORAGE_KEYS.ACCOUNTS);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed) && parsed.length > 0 && "isBound" in parsed[0]) {
    let oldStrategy: ContentStrategyType = "scene_experience";
    let savedRaw: string | null = null;
    try {
      savedRaw = localStorage.getItem(OPS_STORAGE_KEYS.SELECTED_STRATEGY);
      if (savedRaw) { oldStrategy = JSON.parse(savedRaw) as ContentStrategyType; }
    } catch { if (savedRaw) oldStrategy = savedRaw.trim() as ContentStrategyType; }
    return parsed.filter((a: any) => a.isBound).map((a: any) => ({
      id: crypto.randomUUID(), merchantId: storedMerchantId, platform: a.platform,
      accountName: a.accountName, accountUrl: a.accountUrl, followers: a.followers ?? 0,
      accountStage: a.platformStage ?? ("new" as const), strategySource: "auto" as const,
      strategyType: oldStrategy, directionTags: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }));
  }
  return parsed;
}

function saveAccounts(accounts: PlatformAccount[]) {
  localStorage.setItem(OPS_STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
}
function saveSyncGroups(groups: SyncGroup[]) {
  localStorage.setItem(OPS_STORAGE_KEYS.SYNC_GROUPS, JSON.stringify(groups));
}

export default function OperationsPage() {
  const [classification, setClassification] = useState<MerchantClassification | null>(null);
  const [selectedType, setSelectedType] = useState<ContentStrategyType>("scene_experience");
  const [showPicker, setShowPicker] = useState(false);
  const [accounts, setAccounts] = useState<PlatformAccount[]>([]);
  const [syncGroups, setSyncGroups] = useState<SyncGroup[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [migrated, setMigrated] = useState(false);

  useEffect(() => {
    const result = classifyMerchant(DEMO);
    setClassification(result);
    setSelectedType(result.primaryType);
    const migratedAccts = migrateOldAccounts("");
    if (migratedAccts.length > 0) { setAccounts(migratedAccts); saveAccounts(migratedAccts); }
    const saved = localStorage.getItem(OPS_STORAGE_KEYS.ACCOUNTS);
    if (saved) { try { setAccounts(JSON.parse(saved)); } catch {} }
    const savedGroups = localStorage.getItem(OPS_STORAGE_KEYS.SYNC_GROUPS);
    if (savedGroups) { try { setSyncGroups(JSON.parse(savedGroups)); } catch {} }
    setMigrated(true);
  }, []);

  const merchantTemplate = useMemo(
    () => { const info = makeMerchantInfo(accounts); return getStrategyTemplate(selectedType, info.cuisineType, info.city || "本地"); },
    [selectedType, accounts]
  );
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) ?? null;
  const selectedPlan = useMemo(() => {
    if (!selectedAccount || !migrated) return null;
    return generateAccountPlan(selectedAccount, makeMerchantInfo(accounts));
  }, [selectedAccount, accounts, migrated]);

  function handleAddAccount(account: PlatformAccount) {
    const next = [...accounts, account];
    setAccounts(next); saveAccounts(next);
    setSelectedAccountId(account.id);
  }
  function handleUpdateAccount(id: string, updates: Partial<PlatformAccount>) {
    const next = accounts.map((a) => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a);
    setAccounts(next); saveAccounts(next);
  }
  function handleDeleteAccount(id: string) {
    const next = accounts.filter((a) => a.id !== id);
    setAccounts(next); saveAccounts(next);
    if (selectedAccountId === id) setSelectedAccountId(null);
    const updatedGroups = syncGroups.map((g) => ({ ...g, accountIds: g.accountIds.filter((aid) => aid !== id) }));
    setSyncGroups(updatedGroups); saveSyncGroups(updatedGroups);
  }
  function handleCreateSyncGroup(name: string, accountIds: string[]): string {
    const id = crypto.randomUUID();
    const group: SyncGroup = { id, merchantId: "", name, accountIds, defaultStrategy: "same_copy", createdAt: new Date().toISOString() };
    const next = [...syncGroups, group];
    setSyncGroups(next); saveSyncGroups(next);
    const nextAccounts = accounts.map((a) => accountIds.includes(a.id) ? { ...a, syncGroupId: id, updatedAt: new Date().toISOString() } : a);
    setAccounts(nextAccounts); saveAccounts(nextAccounts);
    return id;
  }
  function handleJoinGroup(accountId: string, groupId: string) {
    handleUpdateAccount(accountId, { syncGroupId: groupId });
    const nextGroups = syncGroups.map((g) => g.id === groupId
      ? { ...g, accountIds: [...g.accountIds, accountId].filter((x, i, a) => a.indexOf(x) === i) } : g);
    setSyncGroups(nextGroups); saveSyncGroups(nextGroups);
  }
  function handleLeaveGroup(accountId: string) {
    const acct = accounts.find((a) => a.id === accountId);
    if (!acct?.syncGroupId) return;
    handleUpdateAccount(accountId, { syncGroupId: undefined });
    const nextGroups = syncGroups.map((g) => ({ ...g, accountIds: g.accountIds.filter((aid) => aid !== accountId) }));
    setSyncGroups(nextGroups); saveSyncGroups(nextGroups);
  }
  function handleDeleteSyncGroup(id: string) {
    const next = syncGroups.filter((g) => g.id !== id);
    setSyncGroups(next); saveSyncGroups(next);
    const removed = syncGroups.find((g) => g.id === id);
    if (removed) {
      const nextAccounts = accounts.map((a) => removed.accountIds.includes(a.id) ? { ...a, syncGroupId: undefined } : a);
      setAccounts(nextAccounts); saveAccounts(nextAccounts);
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF7EF]">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-8">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.3em] text-[#B23A1E]">
            <UtensilsCrossed className="h-3 w-3" /> Operations
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#2B2621]">运营规划</h1>
          <p className="mt-1 text-sm text-[#6B6259]">管理运营策略与多平台账号</p>
        </div>

        <Card className={TICKET}><CardContent className="relative p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className={EYEBROW}>战略诊断</p>
            <button type="button" onClick={() => setShowPicker(!showPicker)} className="text-xs text-[#6B6259] hover:text-[#B23A1E]">更换</button>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <h2 className="text-2xl font-bold text-[#2B2621]">{STRATEGY_LABELS[selectedType]}</h2>
            {classification && selectedType === classification.primaryType && (
              <span className="-rotate-3 rounded-full border-2 border-[#B23A1E] px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-[#B23A1E]">推荐</span>
            )}
          </div>
          {merchantTemplate && <p className="mt-1 text-sm text-[#6B6259]">{merchantTemplate.oneLinePositioning}</p>}
          {showPicker && (classification as any).details && (
            <div className="mt-5 border-t-2 border-dashed border-[#D9CFBF] pt-4">
              <p className={`${EYEBROW} mb-2`}>全部评分</p>
              <ul className="divide-y divide-dashed divide-[#E6DCC8]">
                {(classification as any).details.map((d: any) => (
                  <li key={d.type}>
                    <button type="button" onClick={() => { setSelectedType(d.type); setShowPicker(false); }}
                      className="flex w-full items-baseline gap-2 py-2 text-left transition-colors hover:text-[#B23A1E]">
                      <span className={"text-sm " + (selectedType === d.type ? "font-semibold text-[#B23A1E]" : "text-[#2B2621]")}>{d.label}</span>
                      <span className="flex-1 border-b border-dotted border-[#D9CFBF]" />
                      <span className="font-mono text-sm tabular-nums text-[#6B6259]">{d.score}分</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent></Card>

        <AccountPanel accounts={accounts} selectedId={selectedAccountId} onSelect={setSelectedAccountId} onAdd={handleAddAccount} />

        {selectedAccount && (
          <AccountDetail account={selectedAccount} plan={selectedPlan} syncGroups={syncGroups}
            onUpdate={handleUpdateAccount} onDelete={handleDeleteAccount}
            onJoinGroup={handleJoinGroup} onLeaveGroup={handleLeaveGroup}
            onCreateSyncGroup={(name, aid) => handleCreateSyncGroup(name, [aid])} />
        )}

        <SyncGroupSection syncGroups={syncGroups} accounts={accounts}
          onCreateGroup={handleCreateSyncGroup} onDeleteGroup={handleDeleteSyncGroup} />
      </div>
    </div>
  );
}
