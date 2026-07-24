import fs from "fs";
import path from "path";
import { HotContent } from "./hot-contents";

const DATA_DIR = path.join(process.cwd(), "data", "hot-content");

export function getAllHotContent(platform?: string, cuisine?: string): HotContent[] {
  try {
    const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json") && f !== "raw");
    const all: HotContent[] = [];
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
        const data = JSON.parse(raw);
        if (data?.items) {
          for (const item of data.items) {
            if ((!platform || platform === "all" || item.platform === platform) &&
                (!cuisine || cuisine === "all" || item.cuisineType === cuisine)) {
              all.push(item);
            }
          }
        }
      } catch {}
    }
    return all.sort((a, b) => b.hotScore - a.hotScore);
  } catch {
    return [];
  }
}

export function getSourceInfo(): { platform: string; count: number; crawledAt: string }[] {
  try {
    const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json") && f !== "raw");
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
            sources.push({ platform: data.platform, count: data.items?.length || 0, crawledAt: data.crawledAt || "" });
          }
        }
      } catch {}
    }
    return sources;
  } catch {
    return [];
  }
}

const USER_FILE = path.join(DATA_DIR, 'user-content.json');
let userContent: HotContent[] = [];
try { if (fs.existsSync(USER_FILE)) { userContent = JSON.parse(fs.readFileSync(USER_FILE, 'utf-8')); } } catch {}

export function addUserContent(item: HotContent) {
  userContent.push({ ...item, id: "user_" + Date.now() });
}
