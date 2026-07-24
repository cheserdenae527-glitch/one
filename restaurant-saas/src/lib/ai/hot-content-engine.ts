import { HotContent } from "./hot-contents";
import { getAllHotContent, getSourceInfo, addUserContent as storageAdd } from "./hot-content-storage";

export function addUserContent(item: HotContent) {
  storageAdd(item);
}

export async function fetchAllHotContent() {
  const stored = getAllHotContent();
  const all = stored;
  const seen = new Set<string>();
  const unique = all.filter(i => { const k = i.title.slice(0,20); if (seen.has(k)) return false; seen.add(k); return true; });
  unique.sort((a:any,b:any) => b.hotScore - a.hotScore);
  return { total: unique.length, items: unique.slice(0,30), sources: getSourceInfo() };
}