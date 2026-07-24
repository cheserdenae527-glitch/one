import { callLLM } from "./client";
import { CONTENT_TYPE_PROMPTS } from "./prompts";
import { selectTemplates } from "./template-matcher";

const KEY_MAP: Record<string, string> = {
  dianping: "dianping_profile", xiaohongshu: "xiaohongshu_note",
  promotion: "promotion", reply: "review_reply", douyin: "douyin_script", dish: "dish", cover: "cover",
};

const LEN_MAP: Record<string, string> = {
  short: "\u7b80\u6d01\uff08200\u5b57\u5de6\u53f3\uff09", medium: "\u9002\u4e2d\uff08400\u5b57\u5de6\u53f3\uff09", long: "\u8be6\u7ec6\uff08600\u5b57\u4ee5\u4e0a\uff09",
};

export async function generateContent(params: any) {
  // Dianping sub-type routing: when contentType is "dianping" and subType provided, use subType as prompt key
  let promptKey: string;
  if (params.contentType === "dianping") {
    promptKey = params.subType || "dianping_profile";
  } else if (params.contentType === "xiaohongshu" && params.subType) {
  } else if (params.contentType === "douyin" && params.subType) {
    promptKey = params.subType;
    promptKey = params.subType;
  } else {
    promptKey = KEY_MAP[params.contentType] || params.contentType;
  }
  let prompt = CONTENT_TYPE_PROMPTS[promptKey] || "\u8bf7\u751f\u6210\u4ee5\u4e0b\u9910\u996e\u76f8\u5173\u5185\u5bb9\uff1a";

  // Inject extraParams for dianping sub-types (Phase 1)
  if (params.extraParams?.dealDetails) {
    prompt += "\n\n套餐详情信息（基于以下内容生成）：\n" + params.extraParams.dealDetails;
  }
  if (params.extraParams?.branchDiff) {
    prompt += "\n\n分店差异描述（基于以下内容生成）：\n" + params.extraParams.branchDiff;
  }
  // Phase 2: structured extraParams from form schemas
  if (params.extraParams?.formData) {
    prompt += assembleSubTypePrompt(params.subType, params.extraParams.formData);
  }

  // Template engine integration
  const pid = params.contentType==="dianping"?"dianping":params.contentType==="xiaohongshu"?"xiaohongshu":params.contentType==="promotion"?"promotion":"douyin";
  const matchResult = selectTemplates({ cuisine: params.storeInfo?.cuisineType || "all", platform: pid, stage: params.stage || "early", personaTone: params.persona?.tone, recentAngles: [] });
  if (matchResult.selected) {
    const t = matchResult.selected;
    prompt += "\\n\\n【\u6a21\u677f\u7ed3\u6784】";
    prompt += '\u5207\u5165\u89d2\u5ea6\uff1a' + t.angle + '\uff0c\u683c\u5f0f\uff1a' + t.format + '\uff0c\u7ed3\u6784\uff1a' + t.structure.join(' > ') + '\uff0c\u8bed\u6c14\uff1a' + t.tone.join('/');
  }
  if (params.storeInfo?.name) prompt += "\\n\u5e97\u94fa\u540d\u79f0\uff1a" + params.storeInfo.name;
  if (params.storeInfo?.cuisineType) prompt += "\\n\u83dc\u7cfb\uff1a" + params.storeInfo.cuisineType;
  if (params.platform) prompt += "\\n\u76ee\u6807\u5e73\u53f0\uff1a" + params.platform;
  if (params.tone) prompt += "\\n\u8bed\u6c14\u98ce\u683c\uff1a" + params.tone;
  prompt += "\\n\u5b57\u6570\u8981\u6c42\uff1a" + (LEN_MAP[params.length || "medium"] || LEN_MAP.medium);
  if (params.referenceContent?.title) prompt += "\\n\u53c2\u8003\u4e3b\u9898\uff1a" + params.referenceContent.title;
  if (params.persona?.position) prompt += "\\n\u54c1\u724c\u5b9a\u4f4d\uff1a" + params.persona.position;
  prompt += "\\n\\n\u8bf7\u76f4\u63a5\u8f93\u51fa\u6587\u6848\uff0c\u4e0d\u8981\u5305\u542bJSON\u683c\u5f0f\u3002";
  return { content: await callLLM(prompt), templateId: matchResult.selected?.id || null };
}
 
 /**
  * assembleSubTypePrompt — 将 Phase 2 表单 schema 提交的复合字段拼装为结构化文本块，
  * 注入到 generateContent 的 prompt 中。处理 dishes 数组、deal 结构化字段等。
  */
 function assembleSubTypePrompt(subType: string, formData: Record<string, any>): string {
   let result = "";
 
   // AI 多维参数（通用）
   if (formData.emotion) result += "\n情感倾向：" + formData.emotion;
   if (formData.targetUser) result += "\n目标用户：" + formData.targetUser;
   if (formData.platformTone) result += "\n平台调性：" + formData.platformTone;
 
   // dianping_dish — 复合数组字段
   if (subType === "dianping_dish" && Array.isArray(formData.dishes)) {
     result += "\n\n菜品信息：";
     for (const dish of formData.dishes) {
       result += "\n- " + dish.name;
       if (dish.price) result += "（" + dish.price + "）";
       if (dish.tasteTags?.length) result += "\n  口感：" + dish.tasteTags.join("、");
       if (dish.specialTag) result += "\n  标签：" + dish.specialTag;
       if (dish.scene?.length) result += "\n  场景：" + dish.scene.join("、");
       if (dish.pairing) result += "\n  搭配建议：" + dish.pairing;
     }
   }
 
   // dianping_deal — 结构化套餐信息
   if (subType === "dianping_deal") {
     if (formData.dealName) result += "\n\n套餐名称：" + formData.dealName;
     if (formData.dealContents) result += "\n包含内容：\n" + formData.dealContents;
     if (formData.originalPrice) result += "\n原价：" + formData.originalPrice;
     if (formData.dealPrice) result += "\n团购价：" + formData.dealPrice;
     if (formData.scene?.length) result += "\n适用场景：" + (Array.isArray(formData.scene) ? formData.scene.join("、") : formData.scene);
     if (formData.urgency) result += "\n限时活动：是";
     if (formData.expiry) result += "\n有效期：" + formData.expiry;
     if (formData.rules) result += "\n使用须知：\n" + formData.rules;
   }
 
   // dianping_profile — 段落选择 + 关键词
   if (subType === "dianping_profile") {
     if (formData.sections?.length) result += "\n\n包含段落：" + formData.sections.join("、");
     if (formData.keyword) result += "\n主打特色关键词：" + formData.keyword;
   }
 
   // dianping_service — 设施清单
   if (subType === "dianping_service") {
     if (formData.facilities?.length) result += "\n\n设施清单：" + formData.facilities.join("、");
     if (formData.customFacility) result += "\n自定义设施：" + formData.customFacility;
     if (formData.atmosphere) result += "\n包装风格：" + formData.atmosphere;
   }
 
   // dianping_hero — Slogan 设置
   if (subType === "dianping_hero") {
     if (formData.keyword) result += "\n\n核心关键词：" + formData.keyword;
     if (formData.style) result += "\n风格：" + formData.style;
     if (formData.hasUrgency) result += "\n含紧迫感：是";
   }
 
   // dianping_ambience — 环境配文
   if (subType === "dianping_ambience") {
     if (formData.photoCategory) result += "\n\n照片类别：" + formData.photoCategory;
     if (formData.vibe?.length) result += "\n氛围关键词：" + formData.vibe.join("、");
     if (formData.practical?.length) result += "\n实用性描述：" + formData.practical.join("、");
   }
 
   // dianping_poster — 海报文案
   if (subType === "dianping_poster") {
     if (formData.mainTitle) result += "\n\n主标题：" + formData.mainTitle;
     if (formData.subtitle) result += "\n副标题：" + formData.subtitle;
     if (formData.activityType) result += "\n活动类型：" + formData.activityType;
     if (formData.deadline) result += "\n截止日期：" + formData.deadline;
   }
 
   // dianping_reply — 评价回复
   if (subType === "dianping_reply") {
     if (formData.rating) result += "\n\n评价星级：" + formData.rating;
     if (formData.userName) result += "\n用户昵称：" + formData.userName;
     if (formData.orderContent) result += "\n评价内容：" + formData.orderContent;
     if (formData.mentionDish) result += "\n推荐招牌菜：是";
   }
 
   // dianping_branch — 分店差异
   if (subType === "dianping_branch") {
     if (formData.branchName) result += "\n\n分店名称：" + formData.branchName;
     if (formData.branchDiff) result += "\n与总店差异：" + formData.branchDiff;
     if (formData.branchFeatures?.length) result += "\n分店特色标签：" + formData.branchFeatures.join("、");
   }
 
   // dianping_engagement — 用户引导
   if (subType === "dianping_engagement") {
     if (formData.type) result += "\n\n引导类型：" + formData.type;
     if (formData.reward) result += "\n奖励描述：" + formData.reward;
     if (formData.condition) result += "\n参与条件：" + formData.condition;
   }
 
  // dianping_kol — 种草素材
  if (subType === "dianping_kol") {
    if (formData.sections?.length) result += "\n\n包含段落：" + formData.sections.join("、");
    if (formData.tone) result += "\n口吻：" + formData.tone;
    if (formData.targetPlatform?.length) result += "\n适用平台：" + formData.targetPlatform.join("、");
    if (formData.mentionDishCount) result += "\n推荐菜数量：" + formData.mentionDishCount;
  }

  // ═══════════════════════════════════════════
  // 小红书子类型
  // ═══════════════════════════════════════════
 
  // xiaohongshu_bio — 账号简介
  if (subType === "xiaohongshu_bio") {
    if (formData.positionKeyword) result += "\n\n定位关键词：" + formData.positionKeyword;
    if (formData.features?.length) result += "\n核心卖点：" + formData.features.join("、");
    if (formData.includeAddress) result += "\n包含地址：是";
    if (formData.includeHours) result += "\n包含营业时间：是";
    if (formData.includeFollowPrompt) result += "\n引导关注：是";
    if (formData.emotion) result += "\n情感基调：" + formData.emotion;
  }
 
  // xiaohongshu_slogan — 品牌标语
  if (subType === "xiaohongshu_slogan") {
    if (formData.keyword) result += "\n\n核心词：" + formData.keyword;
    if (formData.style) result += "\n风格：" + formData.style;
    if (formData.hasEmoji) result += "\n含 Emoji：是";
  }
 
  // xiaohongshu_title — 笔记标题
  if (subType === "xiaohongshu_title") {
    if (formData.hookType) result += "\n\n主推钩子类型：" + formData.hookType;
    if (formData.keyword) result += "\n核心关键词：" + formData.keyword;
    if (formData.includeNumber) result += "\n包含数字：是";
  }
 
  // xiaohongshu_note — 种草笔记正文
  if (subType === "xiaohongshu_note") {
    if (formData.noteType) result += "\n\n笔记类型：" + formData.noteType;
    if (formData.sections?.length) {
      result += "\n包含段落：";
      for (const sec of formData.sections) {
        result += "\n【段落：" + sec + "】";
      }
    }
    if (formData.dishCount) result += "\n推荐菜数量：" + formData.dishCount;
    if (Array.isArray(formData.dishes)) {
      result += "\n\n菜品信息：";
      for (const dish of formData.dishes) {
        result += "\n- " + dish.name + (dish.price ? "（" + dish.price + "）" : "");
        if (dish.taste?.length) result += "\n  口感：" + dish.taste.join("、");
        if (dish.recommendReason) result += "\n  推荐理由：" + dish.recommendReason;
      }
    }
    if (formData.interactionType?.length) result += "\n\n互动引导方式：" + formData.interactionType.join("、");
    if (formData.includeLocationTag) result += "\n含定位标签：是";
    if (formData.tagStrategy) result += "\n标签策略：" + formData.tagStrategy;
    if (formData.emotion) result += "\n情感基调：" + formData.emotion;
  }
 
  // xiaohongshu_cover — 封面文案
  if (subType === "xiaohongshu_cover") {
    if (formData.keyword) result += "\n\n核心卖点关键词：" + formData.keyword;
    if (formData.subtitleHint) result += "\n副标题方向：" + formData.subtitleHint;
    if (formData.style) result += "\n封面风格：" + formData.style;
    if (formData.fontPreference) result += "\n字体偏好：" + formData.fontPreference;
    if (formData.colorTone) result += "\n色彩倾向：" + formData.colorTone;
  }
 
  // xiaohongshu_promotion — 促销/团购文案
  if (subType === "xiaohongshu_promotion") {
    if (formData.promoTitle) result += "\n\n活动标题：" + formData.promoTitle;
    if (formData.promoDetail) result += "\n活动详情：" + formData.promoDetail;
    if (formData.promoType) result += "\n活动类型：" + formData.promoType;
    if (formData.hasUrgency) result += "\n限时限量：是";
    if (formData.deadline) result += "\n截止日期：" + formData.deadline;
  }
 
  // xiaohongshu_tags — 话题标签组合
  if (subType === "xiaohongshu_tags") {
    if (formData.strategy) result += "\n\n标签策略：" + formData.strategy;
    if (formData.tagCount) result += "\n标签数量：" + formData.tagCount;
    if (formData.includeBrandTag) result += "\n包含品牌标签：是";
    if (formData.includeLocationTag) result += "\n包含地域标签：是";
    if (formData.customKeyword) result += "\n自定义关键词：" + formData.customKeyword;
  }
 
  // xiaohongshu_kol — KOL 合作文案
  if (subType === "xiaohongshu_kol") {
    if (formData.coopType) result += "\n\n合作类型：" + formData.coopType;
    if (formData.budget) result += "\n预算范围：" + formData.budget;
    if (formData.requiredDishes) result += "\n必须拍摄的菜品：" + formData.requiredDishes;
    if (formData.forbiddenWords) result += "\n禁止出现的词：" + formData.forbiddenWords;
    if (formData.publishDate) result += "\n期望发布时间：" + formData.publishDate;
    if (formData.tone) result += "\n口吻要求：" + formData.tone;
    if (formData.mustMention?.length) result += "\n必须提及：" + formData.mustMention.join("、");
  }
 
  // xiaohongshu_reply — 评论回复模板
  if (subType === "xiaohongshu_reply") {
    if (formData.replyType) result += "\n\n回复类型：" + formData.replyType;
    if (formData.userName) result += "\n用户昵称：" + formData.userName;
    if (formData.commentContent) result += "\n评论内容：" + formData.commentContent;
    if (formData.mentionDish) result += "\n推荐招牌菜：是";
    if (formData.leadToDm) result += "\n引导私信：是";
  }
 
  // xiaohongshu_ugc — 用户引导/UGC 激励
  if (subType === "xiaohongshu_ugc") {
    if (formData.ugcType) result += "\n\n活动类型：" + formData.ugcType;
    if (formData.reward) result += "\n奖品描述：" + formData.reward;
    if (formData.condition) result += "\n参与条件：" + formData.condition;
    if (formData.deadline) result += "\n截止日期：" + formData.deadline;
    if (formData.examplePrompt) result += "\n附带示例引导：是";
  }
 

  // ═══════════════════════════════════════════
  // 抖音子类型
  // ═══════════════════════════════════════════

  // douyin_nickname
  if (subType === "douyin_nickname") {
    if (formData.brandName) result += "\n\n品牌名称：" + formData.brandName;
    if (formData.city) result += "\n城市：" + formData.city;
    if (formData.category) result += "\n品类关键词：" + formData.category;
    if (formData.tagline) result += "\n后缀引流词：" + formData.tagline;
    if (formData.includeEmoji) result += "\n含 Emoji：是";
  }

  // douyin_bio
  if (subType === "douyin_bio") {
    if (formData.coreSelling) result += "\n\n核心卖点：" + formData.coreSelling;
    if (formData.features?.length) result += "\n特色标签：" + formData.features.join("、");
    if (formData.address) result += "\n门店地址：" + formData.address;
    if (formData.highlight) result += "\n附加信息：" + formData.highlight;
  }

  // douyin_title
  if (subType === "douyin_title") {
    if (formData.hookType) result += "\n\n钩子类型：" + formData.hookType;
    if (formData.keyword) result += "\n核心关键词：" + formData.keyword;
    if (formData.includeNumber) result += "\n含数字：是";
    if (formData.includeEmoji) result += "\n含 Emoji：是";
    if (formData.useHotTopics) result += "\n关联热点词：是";
    if (formData.batchCount) result += "\n生成数量：" + formData.batchCount;
  }

  // douyin_description
  if (subType === "douyin_description") {
    if (formData.videoTopic) result += "\n\n视频主题：" + formData.videoTopic;
    if (formData.dishList) result += "\n涉及菜品：" + formData.dishList;
    if (formData.videoType) result += "\n视频类型：" + formData.videoType;
    if (formData.hookType) result += "\n开头钩子类型：" + formData.hookType;
    if (formData.hasCoupon) result += "\n挂载团购链接：是";
    if (formData.ctaType) result += "\n互动引导方式：" + formData.ctaType;
    if (formData.bgmStyle) result += "\nBGM 风格：" + formData.bgmStyle;
    if (formData.batchCount) result += "\n生成数量：" + formData.batchCount;
  }

  // douyin_subtitle
  if (subType === "douyin_subtitle") {
    if (formData.topic) result += "\n\n视频主题：" + formData.topic;
    if (formData.count) result += "\n生成句子数量：" + formData.count;
    if (formData.bgmStyle) result += "\nBGM 节奏：" + formData.bgmStyle;
    if (formData.useEmoji) result += "\n含 Emoji：是";
  }

  // douyin_live_opener
  if (subType === "douyin_live_opener") {
    if (formData.liveTheme) result += "\n\n直播主题：" + formData.liveTheme;
    if (formData.products) result += "\n上架商品：" + formData.products;
    if (formData.duration) result += "\n直播时长：" + formData.duration;
    if (formData.welfareHighlight) result += "\n核心福利：" + formData.welfareHighlight;
    if (formData.tone) result += "\n开场风格：" + formData.tone;
  }

  // douyin_live_product
  if (subType === "douyin_live_product") {
    if (formData.products?.length) {
      result += "\n\n商品列表：";
      for (const p of formData.products) {
        result += "\n- " + p.name + "（" + p.price + "）";
        if (p.originalPrice) result += " 原价：" + p.originalPrice;
        if (p.coreSelling) result += "\n  卖点：" + p.coreSelling;
        if (p.highlight) result += "\n  记忆点：" + p.highlight;
      }
    }
    if (formData.speakingSpeed) result += "\n讲解语速：" + formData.speakingSpeed;
    if (formData.tone) result += "\n讲解风格：" + formData.tone;
  }

  // douyin_live_cta
  if (subType === "douyin_live_cta") {
    if (formData.ctaType) result += "\n\n话术类型：" + formData.ctaType;
    if (formData.productName) result += "\n针对商品：" + formData.productName;
    if (formData.remainingCount) result += "\n剩余数量：" + formData.remainingCount;
    if (formData.countdown) result += "\n倒计时：" + formData.countdown;
    if (formData.tone) result += "\n话术强度：" + formData.tone;
  }

  // douyin_live_closer
  if (subType === "douyin_live_closer") {
    if (formData.summaryPoints) result += "\n\n本场回顾：" + formData.summaryPoints;
    if (formData.nextLive) result += "\n下次直播预告：" + formData.nextLive;
    if (formData.tone) result += "\n收尾风格：" + formData.tone;
  }

  // douyin_promotion
  if (subType === "douyin_promotion") {
    if (formData.productName) result += "\n\n商品名称：" + formData.productName;
    if (formData.price) result += "\n价格：" + formData.price;
    if (formData.originalPrice) result += "\n原价：" + formData.originalPrice;
    if (formData.content) result += "\n套餐内容：" + formData.content;
    if (formData.suitableFor) result += "\n适合人群：" + formData.suitableFor;
    if (formData.validPeriod) result += "\n有效期：" + formData.validPeriod;
    if (formData.restrictions) result += "\n使用限制：" + formData.restrictions;
  }

  // douyin_poi
  if (subType === "douyin_poi") {
    if (formData.address) result += "\n\n门店地址：" + formData.address;
    if (formData.landmark) result += "\n附近地标：" + formData.landmark;
    if (formData.trafficInfo) result += "\n交通指引：" + formData.trafficInfo;
    if (formData.storeHighlights?.length) result += "\n门店亮点：" + formData.storeHighlights.join("、");
    if (formData.ownWords) result += "\n自定义补充：" + formData.ownWords;
  }

  // douyin_ad
  if (subType === "douyin_ad") {
    if (formData.adGoal) result += "\n\n投放目标：" + formData.adGoal;
    if (formData.productName) result += "\n推广内容：" + formData.productName;
    if (formData.price) result += "\n价格/利益点：" + formData.price;
    if (formData.targetAudience?.length) result += "\n定向人群：" + formData.targetAudience.join("、");
    if (formData.tone) result += "\n文案风格：" + formData.tone;
  }

  // douyin_hashtag
  if (subType === "douyin_hashtag") {
    if (formData.cuisine) result += "\n\n品类：" + formData.cuisine;
    if (formData.city) result += "\n城市：" + formData.city;
    if (formData.useHotTopics) result += "\n关联热点：是";
    if (formData.customTags) result += "\n自定义标签：" + formData.customTags;
    if (formData.tagCount) result += "\n标签数量：" + formData.tagCount;
  }

  // douyin_reply
  if (subType === "douyin_reply") {
    if (formData.replyType) result += "\n\n回复类型：" + formData.replyType;
    if (formData.userName) result += "\n用户昵称：" + formData.userName;
    if (formData.commentContent) result += "\n评论内容：" + formData.commentContent;
    if (formData.leadTo) result += "\n引导方向：" + formData.leadTo;
    if (formData.useEmoji) result += "\n使用 Emoji：是";
    if (formData.tone) result += "\n回复风格：" + formData.tone;
  }
  return result;
 }

