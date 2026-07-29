export interface HotContent {
  id: string;
  title: string;
  platform: string;
  likesCount: number;
  cuisineType: string;
  briefContent: string;
  hotScore: number;
  url: string;
  publishTime: string;
  contentType: string;
  imageUrl?: string;
  city?: string;
  storeName?: string;
  keywords?: string[];
  crawledAt?: string;
  analysis?: HotContentAnalysis;
}

export interface HotContentAnalysis {
  writingStyle: string;
  hookType: string;
  structure: string[];
  toneTags: string[];
  visualStyle?: string;
  promptTemplate: string;
  angleName?: string;
  formatName?: string;
}

export interface UserLink {
  id: string;
  userId: string;
  url: string;
  title?: string;
  platform?: string;
  likesCount?: number;
  storeInfo?: string;
  keywords?: string[];
  analysis?: HotContentAnalysis;
  createdAt: string;
  updatedAt: string;
}

export const KNOWN_PLATFORMS = ["dianping", "xiaohongshu", "douyin"];
export const PLATFORM_LABELS: Record<string, string> = {
  dianping: "大众点评", xiaohongshu: "小红书", douyin: "抖音",
};
export const CUISINE_LIST = ["火锅", "川菜", "日料", "烧烤", "西餐"];
export const CITIES_LIST = ["全国", "北京", "上海", "广州", "深圳", "成都", "杭州", "重庆", "武汉", "南京", "西安", "长沙", "苏州", "天津"];
export const DEFAULT_CITY = "全国";
