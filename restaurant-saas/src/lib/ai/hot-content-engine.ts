import { HotContent } from "./hot-contents";
import { getAllHotContent, getSourceInfo, updateItemAnalysis, addUserLink, getUserLinks } from "./hot-content-storage";

export async function fetchAllHotContent(
  options?: {
    platform?: string;
    cuisine?: string;
    city?: string;
    preferAnalyzed?: boolean;
    limit?: number;
  }
) {
  const opts = options || {};
  // Get analyzed items first if preferAnalyzed is true
  let analyzed: HotContent[] = [];
  let unanalyzed: HotContent[] = [];

  const all = getAllHotContent(opts.platform, opts.cuisine, opts.city);

  if (opts.preferAnalyzed) {
    analyzed = all.filter((i) => i.analysis);
    unanalyzed = all.filter((i) => !i.analysis);
  } else {
    analyzed = all;
    unanalyzed = [];
  }

  // Combine: analyzed first, then unanalyzed
  const combined = [...analyzed, ...unanalyzed];

  // Dedup by title prefix
  const seen = new Set<string>();
  const unique = combined.filter((i) => {
    const k = i.title?.slice(0, 20) || i.id;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const limit = opts.limit || 30;
  const items = unique.slice(0, limit);

  return {
    total: unique.length,
    analyzedCount: analyzed.length,
    unanalyzedCount: unanalyzed.length,
    items,
    sources: getSourceInfo(),
  };
}

export { updateItemAnalysis, addUserLink, getUserLinks };
