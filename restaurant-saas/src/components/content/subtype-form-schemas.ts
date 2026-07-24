/** subtype-form-schemas.ts - Form schema definitions */

/* Field type system */
export type FieldType =
  | "text" | "textarea"
  | "select" | "multiselect"
  | "segmented" | "toggle"
  | "list";

export interface FormFieldSchema {
  key: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: string[];
  defaultValue?: any;
  required?: boolean;
  readonly?: boolean;
  helpText?: string;
  fields?: FormFieldSchema[];
  maxItems?: number;
}

export interface SubTypeFormSection {
  title: string;
  fields: FormFieldSchema[];
}

export interface SubTypeFormSchema {
  subTypeId: string;
  sections: SubTypeFormSection[];
}

const profileSchema: SubTypeFormSchema = { subTypeId: "dianping_profile", sections: [{ title: "dianping_profile", fields: [{ key: "dummy", type: "text", label: "dianping_profile" }] }] };
const serviceSchema: SubTypeFormSchema = { subTypeId: "dianping_service", sections: [{ title: "dianping_service", fields: [{ key: "dummy", type: "text", label: "dianping_service" }] }] };
const hoursSchema: SubTypeFormSchema = { subTypeId: "dianping_hours", sections: [{ title: "dianping_hours", fields: [{ key: "dummy", type: "text", label: "dianping_hours" }] }] };
const heroSchema: SubTypeFormSchema = { subTypeId: "dianping_hero", sections: [{ title: "dianping_hero", fields: [{ key: "dummy", type: "text", label: "dianping_hero" }] }] };
const dishSchema: SubTypeFormSchema = { subTypeId: "dianping_dish", sections: [{ title: "dianping_dish", fields: [{ key: "dummy", type: "text", label: "dianping_dish" }] }] };
const ambienceSchema: SubTypeFormSchema = { subTypeId: "dianping_ambience", sections: [{ title: "dianping_ambience", fields: [{ key: "dummy", type: "text", label: "dianping_ambience" }] }] };
const dealSchema: SubTypeFormSchema = { subTypeId: "dianping_deal", sections: [{ title: "dianping_deal", fields: [{ key: "dummy", type: "text", label: "dianping_deal" }] }] };
const posterSchema: SubTypeFormSchema = { subTypeId: "dianping_poster", sections: [{ title: "dianping_poster", fields: [{ key: "dummy", type: "text", label: "dianping_poster" }] }] };
const replySchema: SubTypeFormSchema = { subTypeId: "dianping_reply", sections: [{ title: "dianping_reply", fields: [{ key: "dummy", type: "text", label: "dianping_reply" }] }] };
const branchSchema: SubTypeFormSchema = { subTypeId: "dianping_branch", sections: [{ title: "dianping_branch", fields: [{ key: "dummy", type: "text", label: "dianping_branch" }] }] };
const engagementSchema: SubTypeFormSchema = { subTypeId: "dianping_engagement", sections: [{ title: "dianping_engagement", fields: [{ key: "dummy", type: "text", label: "dianping_engagement" }] }] };
const kolSchema: SubTypeFormSchema = { subTypeId: "dianping_kol", sections: [{ title: "dianping_kol", fields: [{ key: "dummy", type: "text", label: "dianping_kol" }] }] };
const xhsBioSchema: SubTypeFormSchema = { subTypeId: "xiaohongshu_bio", sections: [{ title: "xiaohongshu_bio", fields: [{ key: "dummy", type: "text", label: "xiaohongshu_bio" }] }] };
const xhsSloganSchema: SubTypeFormSchema = { subTypeId: "xiaohongshu_slogan", sections: [{ title: "xiaohongshu_slogan", fields: [{ key: "dummy", type: "text", label: "xiaohongshu_slogan" }] }] };
const xhsTitleSchema: SubTypeFormSchema = { subTypeId: "xiaohongshu_title", sections: [{ title: "xiaohongshu_title", fields: [{ key: "dummy", type: "text", label: "xiaohongshu_title" }] }] };
const xhsNoteSchema: SubTypeFormSchema = { subTypeId: "xiaohongshu_note", sections: [{ title: "xiaohongshu_note", fields: [{ key: "dummy", type: "text", label: "xiaohongshu_note" }] }] };
const xhsCoverSchema: SubTypeFormSchema = { subTypeId: "xiaohongshu_cover", sections: [{ title: "xiaohongshu_cover", fields: [{ key: "dummy", type: "text", label: "xiaohongshu_cover" }] }] };
const xhsPromotionSchema: SubTypeFormSchema = { subTypeId: "xiaohongshu_promotion", sections: [{ title: "xiaohongshu_promotion", fields: [{ key: "dummy", type: "text", label: "xiaohongshu_promotion" }] }] };
const xhsTagsSchema: SubTypeFormSchema = { subTypeId: "xiaohongshu_tags", sections: [{ title: "xiaohongshu_tags", fields: [{ key: "dummy", type: "text", label: "xiaohongshu_tags" }] }] };
const xhsKolSchema: SubTypeFormSchema = { subTypeId: "xiaohongshu_kol", sections: [{ title: "xiaohongshu_kol", fields: [{ key: "dummy", type: "text", label: "xiaohongshu_kol" }] }] };
const xhsReplySchema: SubTypeFormSchema = { subTypeId: "xiaohongshu_reply", sections: [{ title: "xiaohongshu_reply", fields: [{ key: "dummy", type: "text", label: "xiaohongshu_reply" }] }] };
const xhsUgcSchema: SubTypeFormSchema = { subTypeId: "xiaohongshu_ugc", sections: [{ title: "xiaohongshu_ugc", fields: [{ key: "dummy", type: "text", label: "xiaohongshu_ugc" }] }] };

const dyNicknameSchema: SubTypeFormSchema = {
  subTypeId: "douyin_nickname",
  sections: [{ title: "昵称设置", fields: [
    { key: "brandName", type: "text", label: "品牌名称", placeholder: "如：渝味老街火锅", required: true },
    { key: "city", type: "text", label: "城市", placeholder: "如：成都", required: true },
    { key: "category", type: "text", label: "品类关键词", placeholder: "如：火锅/川菜/奶茶", required: true },
    { key: "tagline", type: "segmented", label: "后缀引流词", options: ["本地必打卡", "人均XX", "老字号", "排队王", "本地人推荐"], defaultValue: "本地必打卡" },
    { key: "includeEmoji", type: "toggle", label: "包含 Emoji 分隔符", defaultValue: true },
  ]}],
};
const dyBioSchema: SubTypeFormSchema = {
  subTypeId: "douyin_bio",
  sections: [{ title: "简介设置", fields: [
    { key: "coreSelling", type: "text", label: "核心卖点一句话", placeholder: "如：成都最香的麻辣老火锅", required: true },
    { key: "features", type: "multiselect", label: "特色标签（选2-3个）", options: ["每日空运毛肚", "20年老店", "现炒底料", "甜品免费吃", "营业到凌晨2点", "包厢可订", "排队王", "本地人认证"] },
    { key: "address", type: "text", label: "门店地址", placeholder: "如：春熙路XX号", required: true },
    { key: "highlight", type: "text", label: "想强调的附加信息（选填）", placeholder: "如：每周五会员日8折" },
  ]}],
};
const dyTitleSchema: SubTypeFormSchema = {
  subTypeId: "douyin_title",
  sections: [{ title: "标题设置", fields: [
    { key: "hookType", type: "segmented", label: "钩子类型", options: ["数字冲击", "反问好奇", "利益直给", "地域认同", "情感共鸣", "热词借势"], defaultValue: "数字冲击" },
    { key: "keyword", type: "text", label: "核心关键词", placeholder: "如：火锅/周末/打卡" },
    { key: "includeNumber", type: "toggle", label: "包含数字", defaultValue: true },
    { key: "includeEmoji", type: "toggle", label: "包含 Emoji", defaultValue: true },
    { key: "useHotTopics", type: "toggle", label: "关联热点词（选填）", defaultValue: false, helpText: "Phase 2 自动匹配当日本地热点" },
    { key: "batchCount", type: "segmented", label: "生成数量", options: ["1个", "3个", "5个"], defaultValue: "3个" },
  ]}],
};
const dyDescriptionSchema: SubTypeFormSchema = {
  subTypeId: "douyin_description",
  sections: [
    { title: "视频信息", fields: [
      { key: "videoTopic", type: "textarea", label: "本视频主题", placeholder: "一句话描述视频内容", required: true },
      { key: "dishList", type: "textarea", label: "涉及的菜品（每行一个）", placeholder: "毛肚\\n鸭肠\\n牛肉" },
      { key: "videoType", type: "segmented", label: "视频类型", options: ["探店打卡", "菜品展示", "制作过程", "优惠活动", "故事分享", "对比评测"], defaultValue: "菜品展示" },
    ]},
    { title: "文案策略", fields: [
      { key: "hookType", type: "segmented", label: "开头钩子类型", options: ["感官冲击", "反常识", "利益直给", "悬念好奇", "身份共鸣", "情感触发"], defaultValue: "感官冲击" },
      { key: "hasCoupon", type: "toggle", label: "文末挂载团购链接", defaultValue: true },
      { key: "ctaType", type: "segmented", label: "互动引导方式", options: ["评论区回复地址", "私信领优惠", "点击下单", "带话题发布", "关注领券"], defaultValue: "评论区回复地址" },
      { key: "bgmStyle", type: "segmented", label: "BGM 风格", options: ["快节奏卡点", "温馨舒缓", "热血激昂", "搞笑魔性"], defaultValue: "快节奏卡点" },
      { key: "batchCount", type: "segmented", label: "生成数量", options: ["1个", "3个", "5个"], defaultValue: "1个" },
    ]},
  ],
};
const dySubtitleSchema: SubTypeFormSchema = {
  subTypeId: "douyin_subtitle",
  sections: [{ title: "字幕设置", fields: [
    { key: "topic", type: "text", label: "视频主题概述", placeholder: "如：一个人吃8道菜", required: true },
    { key: "count", type: "segmented", label: "生成句子数量", options: ["3句", "5句", "8句"], defaultValue: "5句" },
    { key: "bgmStyle", type: "segmented", label: "BGM 节奏", options: ["快节奏（每2秒换句）", "中速（每4秒换句）", "舒缓（每6秒换句）"], defaultValue: "快节奏（每2秒换句）" },
    { key: "useEmoji", type: "toggle", label: "包含 Emoji", defaultValue: true },
  ]}],
};
const dyLiveOpenerSchema: SubTypeFormSchema = {
  subTypeId: "douyin_live_opener",
  sections: [{ title: "直播场次信息", fields: [
    { key: "liveTheme", type: "text", label: "直播主题", placeholder: "如：周末火锅福利专场", required: true },
    { key: "products", type: "textarea", label: "本场上架商品（每行一个）", placeholder: "双人火锅套餐 ¥99\\n毛肚半价券 ¥29" },
    { key: "duration", type: "segmented", label: "预估直播时长", options: ["30分钟", "60分钟", "90分钟", "不限"], defaultValue: "60分钟" },
    { key: "welfareHighlight", type: "text", label: "核心福利一句话（选填）", placeholder: "如：本场所有套餐5折" },
    { key: "tone", type: "segmented", label: "开场风格", options: ["热情饱满", "亲切自然", "幽默搞怪", "专业正式"], defaultValue: "热情饱满" },
  ]}],
};
const dyLiveProductSchema: SubTypeFormSchema = {
  subTypeId: "douyin_live_product",
  sections: [{ title: "商品信息", fields: [
    { key: "products", type: "list", label: "讲解商品列表", maxItems: 10, fields: [
      { key: "name", type: "text", label: "商品名称", placeholder: "如：双人火锅套餐" },
      { key: "price", type: "text", label: "价格", placeholder: "如：99元" },
      { key: "originalPrice", type: "text", label: "原价（选填）", placeholder: "如：198元" },
      { key: "coreSelling", type: "text", label: "核心卖点", placeholder: "如：5道招牌菜+2杯饮品" },
      { key: "highlight", type: "text", label: "独家记忆点（选填）", placeholder: "如：毛肚是重庆空运的" },
    ]},
    { key: "speakingSpeed", type: "segmented", label: "讲解语速", options: ["快（每分钟240字）", "正常（每分钟180字）", "慢（每分钟140字）"], defaultValue: "正常（每分钟180字）" },
    { key: "tone", type: "segmented", label: "讲解风格", options: ["专业推荐型", "朋友安利型", "激情叫卖型"], defaultValue: "朋友安利型" },
  ]}],
};
const dyLiveCtaSchema: SubTypeFormSchema = {
  subTypeId: "douyin_live_cta",
  sections: [{ title: "催单设置", fields: [
    { key: "ctaType", type: "segmented", label: "话术类型", options: ["限时倒计时", "限量剩余", "从众热销", "粉丝福利", "互动抽奖"], defaultValue: "限时倒计时" },
    { key: "productName", type: "text", label: "针对商品", placeholder: "如：双人火锅套餐" },
    { key: "remainingCount", type: "text", label: "剩余数量（选填）", placeholder: "如：最后10份" },
    { key: "countdown", type: "text", label: "倒计时（选填）", placeholder: "如：3分钟" },
    { key: "tone", type: "segmented", label: "话术强度", options: ["温和提醒", "中等紧迫", "强烈催促"], defaultValue: "中等紧迫" },
  ]}],
};
const dyLiveCloserSchema: SubTypeFormSchema = {
  subTypeId: "douyin_live_closer",
  sections: [{ title: "收尾设置", fields: [
    { key: "summaryPoints", type: "textarea", label: "本场回顾要点", placeholder: "如：双人套餐可叠加会员折扣" },
    { key: "nextLive", type: "text", label: "下次直播预告（选填）", placeholder: "如：本周五晒8点，新菜品首发" },
    { key: "tone", type: "segmented", label: "收尾风格", options: ["温暖感谢", "激情收尾", "期待再见"], defaultValue: "温暖感谢" },
  ]}],
};
const dyPromotionSchema: SubTypeFormSchema = {
  subTypeId: "douyin_promotion",
  sections: [{ title: "商品信息", fields: [
    { key: "productName", type: "text", label: "商品名称", placeholder: "如：双人火锅套餐", required: true },
    { key: "price", type: "text", label: "价格", placeholder: "如：99元", required: true },
    { key: "originalPrice", type: "text", label: "原价（选填）", placeholder: "如：198元" },
    { key: "content", type: "textarea", label: "套餐内容", placeholder: "每行一项，如：锅底1份（任选）\\n毛肚1份\\n鸭血1份", required: true },
    { key: "suitableFor", type: "text", label: "适合人群（选填）", placeholder: "如：2人用餐/情侣约会" },
    { key: "validPeriod", type: "text", label: "有效期（选填）", placeholder: "如：购买后30天内有效" },
    { key: "restrictions", type: "textarea", label: "使用限制（选填）", placeholder: "如：仅限工作日使用\\n需提前1天预约" },
  ]}],
};
const dyPoiSchema: SubTypeFormSchema = {
  subTypeId: "douyin_poi",
  sections: [{ title: "位置信息", fields: [
    { key: "address", type: "text", label: "门店地址", placeholder: "如：成都市锦江区XX路XX号", required: true },
    { key: "landmark", type: "text", label: "附近地标（选填）", placeholder: "如：太古里对面/地铁2号线A口" },
    { key: "trafficInfo", type: "text", label: "交通指引（选填）", placeholder: "如：地铁3号线A口出步行200米" },
    { key: "storeHighlights", type: "multiselect", label: "门店亮点", options: ["临街门面好找", "有免费停车场", "营业到凌晨", "可订包厢", "有外摆区", "宠物友好", "适合拍照"] },
    { key: "ownWords", type: "textarea", label: "想补充的话（选填）", placeholder: "如：门口有只招财猫，很显眼" },
  ]}],
};
const dyAdSchema: SubTypeFormSchema = {
  subTypeId: "douyin_ad",
  sections: [{ title: "投放信息", fields: [
    { key: "adGoal", type: "segmented", label: "投放目标", options: ["门店引流", "团购下单", "粉丝增长", "品牌曝光"], defaultValue: "门店引流" },
    { key: "productName", type: "text", label: "推广内容", placeholder: "如：双人火锅套餐/招牌毛肚" },
    { key: "price", type: "text", label: "价格/利益点", placeholder: "如：99元/免费领券" },
    { key: "targetAudience", type: "multiselect", label: "定向人群（选填）", options: ["18-25岁", "26-35岁", "36-45岁", "本地居民", "美食爱好者", "情侣"] },
    { key: "tone", type: "segmented", label: "文案风格", options: ["强钩子促点击", "信任感建立", "利益点驱动", "情感共鸣"], defaultValue: "强钩子促点击" },
  ]}],
};
const dyHashtagSchema: SubTypeFormSchema = {
  subTypeId: "douyin_hashtag",
  sections: [{ title: "标签设置", fields: [
    { key: "cuisine", type: "text", label: "品类", placeholder: "如：火锅/川菜/奶茶", required: true },
    { key: "city", type: "text", label: "城市", placeholder: "如：成都", required: true },
    { key: "useHotTopics", type: "toggle", label: "关联近期本地热点", defaultValue: true, helpText: "Phase 2 自动匹配热门话题" },
    { key: "customTags", type: "textarea", label: "自定义标签（选填，每行一个）", placeholder: "如：排队王火锅\\n老字号美食" },
    { key: "tagCount", type: "segmented", label: "标签数量", options: ["3-5个", "5-8个"], defaultValue: "5-8个" },
  ]}],
};
const dyReplySchema: SubTypeFormSchema = {
  subTypeId: "douyin_reply",
  sections: [{ title: "评论信息", fields: [
    { key: "replyType", type: "segmented", label: "回复类型", options: ["感谢好评", "答疑解惑", "引导私信", "引导下单", "互动回应"], defaultValue: "感谢好评" },
    { key: "userName", type: "text", label: "用户昵称（选填）", placeholder: "将作为变量插入回复" },
    { key: "commentContent", type: "textarea", label: "评论内容（选填）", placeholder: "粘贴或概括用户说了什么" },
    { key: "leadTo", type: "segmented", label: "引导方向", options: ["引导到店", "引导私信", "引导下单", "引导关注", "不引导"], defaultValue: "引导到店" },
    { key: "useEmoji", type: "toggle", label: "使用表情符号", defaultValue: true },
    { key: "tone", type: "segmented", label: "回复风格", options: ["热情亲切", "幽默有梗", "官方礼貌"], defaultValue: "热情亲切" },
  ]}],
};
const SCHEMA_MAP: Record<string, SubTypeFormSchema> = {
  dianping_profile: profileSchema,
  dianping_service: serviceSchema,
  dianping_hours: hoursSchema,
  dianping_hero: heroSchema,
  dianping_dish: dishSchema,
  dianping_ambience: ambienceSchema,
  dianping_deal: dealSchema,
  dianping_poster: posterSchema,
  dianping_reply: replySchema,
  dianping_branch: branchSchema,
  dianping_engagement: engagementSchema,
  dianping_kol: kolSchema,
  xiaohongshu_bio: xhsBioSchema,
  xiaohongshu_slogan: xhsSloganSchema,
  xiaohongshu_title: xhsTitleSchema,
  xiaohongshu_note: xhsNoteSchema,
  xiaohongshu_cover: xhsCoverSchema,
  xiaohongshu_promotion: xhsPromotionSchema,
  xiaohongshu_tags: xhsTagsSchema,
  xiaohongshu_kol: xhsKolSchema,
  xiaohongshu_reply: xhsReplySchema,
  xiaohongshu_ugc: xhsUgcSchema,
  douyin_nickname: dyNicknameSchema,
  douyin_bio: dyBioSchema,
  douyin_title: dyTitleSchema,
  douyin_description: dyDescriptionSchema,
  douyin_subtitle: dySubtitleSchema,
  douyin_live_opener: dyLiveOpenerSchema,
  douyin_live_product: dyLiveProductSchema,
  douyin_live_cta: dyLiveCtaSchema,
  douyin_live_closer: dyLiveCloserSchema,
  douyin_promotion: dyPromotionSchema,
  douyin_poi: dyPoiSchema,
  douyin_ad: dyAdSchema,
  douyin_hashtag: dyHashtagSchema,
  douyin_reply: dyReplySchema,
};

export function getSubTypeSchema(subTypeId: string): SubTypeFormSchema | null {
  return SCHEMA_MAP[subTypeId] || null;
}
export function getSubTypeSchemaDefaults(subTypeId: string): Record<string, any> {
  const schema = SCHEMA_MAP[subTypeId];
  if (!schema) return {};
  const defaults: Record<string, any> = {};
  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.defaultValue !== undefined) defaults[field.key] = field.defaultValue;
      if (field.type === "list" && field.fields) {
        const row: Record<string, any> = {};
        for (const sub of field.fields) row[sub.key] = sub.defaultValue ?? (sub.type === "multiselect" ? [] : "");
        defaults[field.key] = [row];
      }
    }
  }
  return defaults;
}