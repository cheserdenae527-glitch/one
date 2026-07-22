 export const PRESET_DEFINITIONS = [
   { id: "dish", label: "菜品展示", icon: "dish", desc: "突出菜品味觉质感", variants: ["白底精拍", "餐桌实拍", "手绘插画"] },
   { id: "poster", label: "海报", icon: "poster", desc: "店铺活动宣传", variants: ["促销海报", "新品上市", "节日主题"] },
   { id: "cover", label: "封面图", icon: "cover", desc: "各平台账号封面", variants: ["简洁文字", "菜品特写", "环境氛围"] },
   { id: "menu", label: "菜单图", icon: "menu", desc: "推荐菜品展示", variants: ["精致摆盘", "食材特写", "组合推荐"] },
   { id: "event", label: "活动图", icon: "event", desc: "节日促销活动", variants: ["节日主题", "周年庆", "限时优惠"] },
 ];
 
 export const PLATFORM_SIZES = {
   dianping: { label: "大众点评", ratio: "1:1", width: 1080, height: 1080 },
   xiaohongshu: { label: "小红书", ratio: "3:4", width: 1080, height: 1440 },
   douyin: { label: "抖音", ratio: "9:16", width: 1080, height: 1920 },
 } as const;
 
 export function buildImagePrompt(
   preset: string,
   variant: string,
   platform: string,
   text: string,
   storeInfo?: { name?: string; cuisineType?: string }
 ): string {
   const presetDescriptions: Record<string, string> = {
     dish: "菜品特写展示，突出食材质感和摆盘精致度，画面干净有高级感",
     poster: "店铺活动宣传海报设计，视觉冲击力强，吸引顾客注意",
     cover: "社交媒体封面图设计，简洁美观有食欲，适合做头像或封面",
     menu: "菜单推荐菜品展示图，精致美食摄影风格，让人有点单欲望",
     event: "节日促销活动视觉设计，喜庆氛围感，突出优惠信息",
   };
 
   let prompt = `美食摄影，${variant}风格`;
   if (storeInfo?.cuisineType) prompt += `，${storeInfo.cuisineType}类餐厅`;
   prompt += `，${presetDescriptions[preset] || presetDescriptions.dish}`;
   prompt += `，适合${PLATFORM_SIZES[platform as keyof typeof PLATFORM_SIZES]?.label || "大众点评"}平台`;
   if (text) prompt += `，画面中需包含文字："${text}"`;
   prompt += `，专业美食摄影，柔和光线，构图精致`;
 
   return prompt;
 }
 
 export function getSizeString(platform: string): string {
   const sizes: Record<string, string> = {
     dianping: "1080x1080",
     xiaohongshu: "1080x1440",
     douyin: "1080x1920",
   };
   return sizes[platform] || "1080x1080";
 }
