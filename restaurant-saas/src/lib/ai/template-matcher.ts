import { Template, MatchInput, MatchResult, CANDIDATE_COUNT, WEIGHT_MAX } from "./template-types";
import { SEED_TEMPLATES } from "./template-seeds";

const PM: Record<string,string> = {大众点评:"dianping",小红书:"xiaohongshu",抖音:"douyin"}

export function selectTemplates(input: MatchInput, templates?: Template[]): MatchResult {
  const all = (templates ?? SEED_TEMPLATES).filter(t => t.status === "active" || t.status === "observing");
  let l1=0,l2=0,l3=0;
  let c = all.filter(t => t.platforms.includes(PM[input.platform]||input.platform)); l1=c.length;
  if (input.cuisine && input.cuisine !== "all") { c = c.filter(t => t.cuisines.includes("all") || t.cuisines.includes(input.cuisine)); }
  l2=c.length;
  if (input.stage) { c = c.filter(t => t.stages.includes(input.stage)); }
  l3=c.length;
  c = c.filter(t => !input.recentAngles.includes(t.name));
  if (input.personaTone) { c = c.map(t => ({...t, weight: Math.min(t.tone.includes(input.personaTone) ? t.weight*1.2 : t.weight, 1)})); }
  if (input.storeId) { c = c.map(t => ({...t, weight: Math.min(Math.max(t.weight+(t.storeWeightOffsets[input.storeId]||0),0.01),1)})); }
  c.sort((a,b) => (b.weight*(0.8+Math.random()*0.4)) - (a.weight*(0.8+Math.random()*0.4)));
  const r = []; const u = new Set<string>();
  for (const x of c) { const k = x.angle + "|" + x.format; if (!u.has(k) && r.length < 3) { r.push(x); u.add(k); } }
  return { candidates: r, selected: r[0]||null, debug: { layer1Count: l1, layer2Count: l2, layer3Count: l3, finalCount: r.length }};
}

export function updateWeight(tpl: any, action: string, storeId?: string): any {
  const d: Record<string,number> = { used:0.1, saved:0.3, shared:0.3, regenerated:-0.2, skipped:-0.5 };
  const delta = d[action]||0;
  const w = Math.min(Math.max(tpl.weight + delta, 0.05), 1);
  const r: any = {...tpl, weight: w};
  if (action === "used") r.usageCount = (tpl.usageCount||0) + 1;
  if (action === "skipped") r.skipCount = (tpl.skipCount||0) + 1;
  if (storeId) { r.storeWeightOffsets = {...tpl.storeWeightOffsets, [storeId]: (tpl.storeWeightOffsets[storeId]||0) + delta*0.3}; }
  return r;
}
