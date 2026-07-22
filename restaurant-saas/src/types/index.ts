export interface StoreInfo {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  description?: string;
  cuisineType?: string;
  priceRange?: string;
  targetCustomers?: string;
  dianpingUrl?: string;
  xiaohongshuUrl?: string;
  douyinUrl?: string;
  brandPersona?: BrandPersona;
  brandAssets?: BrandAssets;
  accountStage: "new" | "growing" | "mature";
}

export interface BrandPersona {
  position: string;
  personality: string[];
  tone: string;
  contentDirections: string[];
  examplePosts: string[];
}

export interface BrandAssets {
  logoUrl?: string;
  storefrontUrl?: string;
  patternUrls?: string[];
  dishImageUrls?: string[];
}

export interface ContentTemplate {
  id: string;
  type: "angle" | "format";
  name: string;
  description: string;
  hook: string;
  tone: string[];
  structure: string[];
  cuisines: string[];
  platforms: string[];
  weight: number;
  usageCount: number;
  rejectionCount: number;
  isActive: boolean;
}

export interface HotContent {
  id: string;
  platform: string;
  title: string;
  body: string;
  storeName: string;
  cuisineType: string;
  city: string;
  likesCount: number;
  keywords: string[];
  sourceUrl?: string;
  coverImageUrl?: string;
}

export interface ReviewItem {
  id: string;
  platform: string;
  reviewerName: string;
  rating: number;
  content: string;
  replyContent?: string;
  replyStatus: "pending" | "approved" | "replied";
  sentiment: "positive" | "neutral" | "negative";
  createdAt: string;
}
