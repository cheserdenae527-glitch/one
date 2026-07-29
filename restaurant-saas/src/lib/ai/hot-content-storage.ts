import fs from "fs";
import path from "path";
import { HotContent, UserLink, DEFAULT_CITY, KNOWN_PLATFORMS } from "./hot-contents";

const DATA_DIR = path.join(process.cwd(), "data", "hot-content");

export function getAllHotContent(
  platform?: string,
  cuisine?: string,
  city?: string,
  onlyWithAnalysis?: boolean,
): HotContent[] {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(
      (f) => f.endsWith(".json") && f !== "raw" && f !== "user-content.json" && f !== "user-links.json",
    );
    const all: HotContent[] = [];
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
        const data = JSON.parse(raw);
        if (data?.items) {
          for (const item of data.items) {
            // Platform filter
            if (platform && platform !== "all" && item.platform !== platform) continue;
            // Cuisine filter
            if (cuisine && cuisine !== "all" && cuisine !== "全部菜系" && item.cuisineType !== cuisine) continue;
            // City filter: if city != DEFAULT_CITY and city != "全国", filter exact match
            const itemCity = item.city || "";
            const userCity = city || "";
            if (userCity && userCity !== "全国" && userCity !== DEFAULT_CITY && itemCity !== userCity) continue;
            // Analysis filter
            if (onlyWithAnalysis && !item.analysis) continue;
            all.push(item);
          }
        }
      } catch {
        /* skip corrupt files */
      }
    }
    return all.sort((a, b) => b.hotScore - a.hotScore);
  } catch {
    return [];
  }
}

export function getSourceInfo(): { platform: string; count: number; crawledAt: string }[] {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(
      (f) => f.endsWith(".json") && f !== "raw" && f !== "user-content.json" && f !== "user-links.json",
    );
    const sources: any[] = [];
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
        const data = JSON.parse(raw);
        if (data?.platform) {
          const existing = sources.find((s) => s.platform === data.platform);
          if (existing) {
            existing.count += data.items?.length || 0;
            if (data.crawledAt > existing.crawledAt) existing.crawledAt = data.crawledAt;
          } else {
            sources.push({
              platform: data.platform,
              count: data.items?.length || 0,
              crawledAt: data.crawledAt || "",
            });
          }
        }
      } catch {
        /* skip */
      }
    }
    return sources;
  } catch {
    return [];
  }
}

export function updateItemAnalysis(id: string, analysis: any): boolean {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(
      (f) => f.endsWith(".json") && f !== "raw" && f !== "user-content.json" && f !== "user-links.json",
    );
    for (const file of files) {
      const fp = path.join(DATA_DIR, file);
      const raw = fs.readFileSync(fp, "utf-8");
      const data = JSON.parse(raw);
      if (!data?.items) continue;
      let changed = false;
      for (const item of data.items) {
        if (item.id === id) {
          item.analysis = analysis;
          changed = true;
          break;
        }
      }
      if (changed) {
        fs.writeFileSync(fp, JSON.stringify(data, null, 2), "utf-8");
        return true;
      }
    }
  } catch {
    /* ignore */
  }
  return false;
}

// ── User link library (6.3) ──────────────────────────────────────────

const USER_LINKS_FILE = path.join(DATA_DIR, "user-links.json");

function readUserLinks(): UserLink[] {
  try {
    if (fs.existsSync(USER_LINKS_FILE)) {
      return JSON.parse(fs.readFileSync(USER_LINKS_FILE, "utf-8"));
    }
  } catch {
    /* ignore */
  }
  return [];
}

function writeUserLinks(links: UserLink[]) {
  fs.writeFileSync(USER_LINKS_FILE, JSON.stringify(links, null, 2), "utf-8");
}

export function getUserLinks(userId?: string): UserLink[] {
  const links = readUserLinks();
  if (userId) return links.filter((l) => l.userId === userId);
  return links;
}

export function addUserLink(
  userId: string,
  url: string,
  data?: Partial<UserLink>,
): UserLink {
  const links = readUserLinks();
  // Dedup by url + userId: update existing or insert new
  const existingIdx = links.findIndex((l) => l.userId === userId && l.url === url);
  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    links[existingIdx] = {
      ...links[existingIdx],
      ...data,
      url,
      userId,
      updatedAt: now,
    };
    writeUserLinks(links);
    return links[existingIdx];
  }

  const newLink: UserLink = {
    id: "link_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    userId,
    url,
    title: data?.title,
    platform: data?.platform,
    likesCount: data?.likesCount,
    storeInfo: data?.storeInfo,
    keywords: data?.keywords,
    analysis: data?.analysis,
    createdAt: now,
    updatedAt: now,
  };
  links.push(newLink);
  writeUserLinks(links);
  return newLink;
}

export function deleteUserLink(userId: string, linkId: string): boolean {
  const links = readUserLinks();
  const idx = links.findIndex((l) => l.userId === userId && l.id === linkId);
  if (idx < 0) return false;
  links.splice(idx, 1);
  writeUserLinks(links);
  return true;
}
