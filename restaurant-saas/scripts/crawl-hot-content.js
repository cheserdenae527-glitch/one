const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const SESSION = "session";
const DATA_DIR = path.join(__dirname, "..", "data", "hot-content");
const RAW_DIR = path.join(DATA_DIR, "raw");
const now = new Date().toISOString();
const CUISINES = ["火锅", "川菜", "日料", "烧烤", "西餐"];

const URLS = {
  dianping: (c) => "https://www.dianping.com/search/keyword/1_0_" + encodeURIComponent(c + " 美食"),
  xiaohongshu: (c) => "https://www.xiaohongshu.com/search_result?keyword=" + encodeURIComponent(c + " 美食") + "&sort=general",
  douyin: (c) => "https://www.douyin.com/search/" + encodeURIComponent(c + " 美食") + "?type=general",
};

function run(cmd, ms) {
  try { return execSync(cmd, { timeout: ms || 45000, encoding: "utf-8" }); }
  catch (e) { return ""; }
}

function parseDouyin(md) {
  const items = [];
  const parts = md.split(/!\[.*?\]\(/);
  for (let i = 1; i < parts.length; i++) {
    const block = parts[i];
    const lines = block.split("\n").map(l=>l.trim()).filter(Boolean);
    let item = { imageUrl: "", duration: "", likesCount: 0, title: "", author: "", publishTime: "" };
    const closeParen = block.indexOf(")");
    if (closeParen > 0) item.imageUrl = block.slice(0, closeParen);
    for (const l of lines) {
      if (l.startsWith("http") && l.includes("douyinpic") && !item.imageUrl) { item.imageUrl = l; continue; }
      if (/^\d+:\d+$/.test(l)) { item.duration = l; continue; }
      const like = l.match(/^(\d+\.?\d*)\s*万?$/);
      if (like && !l.includes("http")) {
        item.likesCount = l.includes("万") ? Math.round(parseFloat(like[1])*10000) : parseInt(like[1]);
        continue;
      }
      const author = l.match(/^@(.+?)\s*[·•]\s*(.+)$/);
      if (author) { item.author = author[1].trim(); item.publishTime = author[2].trim(); continue; }
      if (l.length > 4 && !l.startsWith("#") && !l.startsWith("[") && !l.startsWith("http")) {
        item.title += l + " ";
      }
    }
    item.title = item.title.trim();
    if (item.title) {
      item.contentType = "video";
      item.platform = "douyin";
      item.hotScore = Math.min((item.likesCount||0)/10000, 1);
      items.push(item);
    }
  }
  return items;
}

function parseXiaohongshu(md) {
  const items = [];
  // 1) 找笔记标题: [title](/search_result/...)
  const titleRegex = /\[([^\]]+)\]\(\/search_result\/[^)]+\)/g;
  const SKIP = new Set(["首页","通知","发布","全部","图文","视频","用户","筛选","直播","更多","我"]);
  let m;
  const titles = [];
  while ((m = titleRegex.exec(md)) !== null) {
    const t = m[1].trim();
    if (t.length > 2 && !SKIP.has(t) && !t.startsWith("http") && !t.startsWith("搜索") && !t.startsWith("推荐")) {
      if (!titles.includes(t)) titles.push(t);
    }
  }

  // 2) 找点赞数: ](/user/xxx)123
  // 提取所有 )数字 在 /user/ 行末尾
  const userLikeRegex = /\]\(\/user\/[^)]+\)(\d+)/g;
  const likes = [];
  while ((m = userLikeRegex.exec(md)) !== null) {
    likes.push(parseInt(m[1]));
  }

  // 3) 组装: 标题和点赞数一一对应
  for (let i = 0; i < titles.length; i++) {
    const lc = i < likes.length ? likes[i] : 0;
    items.push({
      title: titles[i],
      likesCount: lc,
      contentType: "text",
      platform: "xiaohongshu",
      hotScore: Math.min(lc / 10000, 1),
      publishTime: "",
      imageUrl: "",
    });
  }
  return items;
}

function parseDianping(md) { return []; }

const PARSERS = { douyin: parseDouyin, dianping: parseDianping, xiaohongshu: parseXiaohongshu };

function crawlOne(platform, cuisine) {
  const url = URLS[platform](cuisine);
  process.stdout.write("  " + platform + "/" + cuisine + " ... ");
  const openRes = run("opencli browser " + SESSION + ' open "' + url + '" --window background');
  if (!openRes) { console.log("OPEN FAIL"); return; }
  run("opencli browser " + SESSION + " wait time 6");
  run("opencli browser " + SESSION + " scroll down --amount 800");
  run("opencli browser " + SESSION + " wait time 3");
  const raw = run("opencli browser " + SESSION + " extract");
  if (!raw) { console.log("EXTRACT FAIL"); return; }
  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.writeFileSync(path.join(RAW_DIR, platform + "-" + cuisine + ".json"), raw, "utf-8");
  let md = "";
  try { const j = JSON.parse(raw); if (j.content) md = j.content; else md = raw; }
  catch { md = raw; }
  const parser = PARSERS[platform];
  if (!parser) { console.log("NO PARSER"); return; }
  const parsed = parser(md);
  const items = parsed.map((r, i) => ({
    id: platform + "_" + Date.now() + "_" + i,
    title: (r.title || "").slice(0, 200),
    platform: platform, url: r.url || url,
    likesCount: r.likesCount || 0, publishTime: r.publishTime || "",
    cuisineType: cuisine, briefContent: (r.briefContent || r.title || "").slice(0, 300),
    contentType: r.contentType || "text", hotScore: r.hotScore || 0, imageUrl: r.imageUrl || "",
  }));
  const out = { platform, cuisine, crawledAt: now, items };
  fs.writeFileSync(path.join(DATA_DIR, platform + "-" + cuisine + ".json"), JSON.stringify(out, null, 2), "utf-8");
  console.log(items.length + " items");
}

function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log("Re-crawl xiaohongshu @ " + now);
  const start = Date.now();
  for (const c of CUISINES) {
    try { crawlOne("xiaohongshu", c); }
    catch (e) { console.error("  ERROR:", c); }
  }
  console.log("Done: " + ((Date.now()-start)/1000).toFixed(0) + "s");
}
main();
