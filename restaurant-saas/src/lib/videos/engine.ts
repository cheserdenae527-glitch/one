export interface VideoTemplate {
  id: string;
  label: string;
  icon: string;
  desc: string;
  defaultScript: string;
}

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  { id: "dish", label: "菜品展示", icon: "F", desc: "美食特写，突出食材质感",
    defaultScript: "今天要给大家推荐一道我们店的招牌菜，食材新鲜，口感绝佳，一定要来尝尝。" },
  { id: "kitchen", label: "后厨纪实", icon: "K", desc: "师傅制作过程，真实专业",
    defaultScript: "我们的厨房每天都是这样运转的，新鲜的食材，专业的师傅，每一道菜都是用心制作。" },
  { id: "explore", label: "探店打卡", icon: "E", desc: "环境体验，沉浸式探店",
    defaultScript: "今天带大家来探一家宝藏店铺，环境特别好，拍照打卡超出片，快来看看吧。" },
  { id: "event", label: "活动预告", icon: "A", desc: "节日促销，优惠信息",
    defaultScript: "好消息！本店周年庆活动开始了，全场优惠，到店还有惊喜礼品，赶紧约上朋友一起来吧。" },
  { id: "newdish", label: "新品发布", icon: "N", desc: "新品推荐介绍",
    defaultScript: "万众期待的新品终于上市了！我们精心研发的新菜品，从选材到出品，每一个环节都严格把控。" },
];

export const VIDEO_PLATFORMS = [
  { id: "douyin", label: "抖音", ratio: "9:16", size: "1080x1920" },
  { id: "xiaohongshu", label: "小红书", ratio: "3:4", size: "1080x1440" },
  { id: "shipin", label: "视频号", ratio: "16:9", size: "1920x1080" },
];
