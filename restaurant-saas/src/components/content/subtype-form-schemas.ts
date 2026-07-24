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

const profileSchema: SubTypeFormSchema = { subTypeId: "dianping_profile", sections: [{ title: "段落选择", fields: [{ key: "sections", type: "multiselect", label: "包含段落", options: ["品牌定位句","核心卖点(3-5点)","品牌故事","目标客群","行动呼吁"], defaultValue: ["品牌定位句","核心卖点(3-5点)","目标客群"] }, { key: "keyword", type: "text", label: "主打特色关键词", placeholder: "例如：20年老店、现熬锅底、有机食材", required: true }, { key: "emotion", type: "segmented", label: "情感基调", options: ["专业","温情","烟火气","潮流"], defaultValue: "温情" }] }, { title: "AI参数", fields: [{ key: "targetUser", type: "select", label: "目标用户", options: ["年轻白领","家庭聚餐","情侣约会","朋友聚会","商务宴请","学生党"] }, { key: "platformTone", type: "segmented", label: "平台调性", options: ["真实体验","口碑推荐","专业点评"], defaultValue: "真实体验" }] }] };
const serviceSchema: SubTypeFormSchema = { subTypeId: "dianping_service", sections: [{ title: "设施清单", fields: [{ key: "facilities", type: "multiselect", label: "已有设施", options: ["免费WiFi","免费停车","宝宝椅","包厢","宠物友好","无障碍通道","充电宝","可订座","外卖取餐口","包场服务"], required: true }, { key: "customFacility", type: "textarea", label: "自定义设施", placeholder: "每行一项" }, { key: "atmosphere", type: "segmented", label: "包装风格", options: ["温馨","高端","便捷"], defaultValue: "便捷" }] }] };
const hoursSchema: SubTypeFormSchema = { subTypeId: "dianping_hours", sections: [{ title: "基本信息", fields: [{ key: "openingHours", type: "text", label: "营业时间", readonly: true, helpText: "自动读取" }, { key: "address", type: "text", label: "店铺地址", readonly: true, helpText: "自动读取" }] }, { title: "温馨提示", fields: [{ key: "tipType", type: "select", label: "提示类型", options: ["高峰期提醒","节假日调整","预约建议","深夜食堂"], defaultValue: "高峰期提醒" }] }] };
const heroSchema: SubTypeFormSchema = { subTypeId: "dianping_hero", sections: [{ title: "Slogan设置", fields: [{ key: "style", type: "segmented", label: "风格", options: ["卖点型","氛围型","促销型"], defaultValue: "卖点型" }, { key: "keyword", type: "text", label: "核心关键词", required: true }, { key: "hasUrgency", type: "toggle", label: "加入紧迫感", defaultValue: false }] }] };
const dishSchema: SubTypeFormSchema = { subTypeId: "dianping_dish", sections: [{ title: "菜品列表", fields: [{ key: "dishes", type: "list", label: "菜品", maxItems: 10, fields: [{ key: "name", type: "text", label: "菜名", required: true }, { key: "price", type: "text", label: "价格", placeholder: "88元" }, { key: "tasteTags", type: "multiselect", label: "口感标签", options: ["麻辣鲜香","鲜嫩多汁","外酥里嫩","入口即化","酸甜可口","Q弹爽滑","浓香四溢","清脆爽口"] }, { key: "specialTag", type: "select", label: "特色标签", options: ["招牌","限量","新品","必点","人气","推荐"], defaultValue: "推荐" }] }] }, { title: "AI参数", fields: [{ key: "emotion", type: "segmented", label: "描写风格", options: ["诱人食欲","精致感","家常感"], defaultValue: "诱人食欲" }] }] };
const ambienceSchema: SubTypeFormSchema = { subTypeId: "dianping_ambience", sections: [{ title: "照片信息", fields: [{ key: "photoCategory", type: "segmented", label: "照片类别", options: ["大厅环境","包厢","细节特写","门头","用餐场景"], defaultValue: "大厅环境" }, { key: "vibe", type: "multiselect", label: "氛围关键词", options: ["温馨","高端","复古","现代","网红","私密","热闹","安静"] }, { key: "practical", type: "multiselect", label: "实用性描述", options: ["适合拍照","适合约会","适合谈事","适合宴请","适合一人坐"] }] }] };
const dealSchema: SubTypeFormSchema = { subTypeId: "dianping_deal", sections: [{ title: "套餐信息", fields: [{ key: "dealName", type: "text", label: "套餐名称", required: true }, { key: "dealContents", type: "textarea", label: "包含内容", required: true }, { key: "originalPrice", type: "text", label: "原价" }, { key: "dealPrice", type: "text", label: "团购价", required: true }, { key: "scene", type: "multiselect", label: "适用场景", options: ["朋友小聚","情侣约会","家庭聚餐","工作日午餐","生日聚会"] }, { key: "urgency", type: "toggle", label: "限时活动", defaultValue: false }, { key: "expiry", type: "text", label: "有效期" }, { key: "rules", type: "textarea", label: "使用须知" }] }] };
const posterSchema: SubTypeFormSchema = { subTypeId: "dianping_poster", sections: [{ title: "海报文案", fields: [{ key: "mainTitle", type: "text", label: "主标题", required: true }, { key: "subtitle", type: "text", label: "副标题" }, { key: "activityType", type: "segmented", label: "活动类型", options: ["折扣","满减","赠品","套餐","新品"], defaultValue: "折扣" }, { key: "hasUrgency", type: "toggle", label: "限时提醒", defaultValue: true }, { key: "deadline", type: "text", label: "截止日期" }] }] };
const replySchema: SubTypeFormSchema = { subTypeId: "dianping_reply", sections: [{ title: "评价信息", fields: [{ key: "rating", type: "segmented", label: "评价星级", options: ["1星","2星","3星","4星","5星"], defaultValue: "5星" }, { key: "userName", type: "text", label: "用户昵称" }, { key: "orderContent", type: "textarea", label: "评价内容概要" }, { key: "replyLength", type: "segmented", label: "回复长度", options: ["简短","适中","详细"], defaultValue: "适中" }, { key: "mentionDish", type: "toggle", label: "推荐招牌菜", defaultValue: true }] }] };
const branchSchema: SubTypeFormSchema = { subTypeId: "dianping_branch", sections: [{ title: "分店信息", fields: [{ key: "branchName", type: "text", label: "分店名称", required: true }, { key: "branchDiff", type: "textarea", label: "差异描述" }, { key: "branchFeatures", type: "multiselect", label: "特色标签", options: ["商务简餐","深夜营业","外卖专营","聚会包场","独食友好"] }] }] };
const engagementSchema: SubTypeFormSchema = { subTypeId: "dianping_engagement", sections: [{ title: "引导类型", fields: [{ key: "type", type: "segmented", label: "引导类型", options: ["分享有礼","打卡征集","会员招募","好评引导"], defaultValue: "分享有礼" }, { key: "reward", type: "text", label: "奖励描述", required: true }, { key: "condition", type: "text", label: "参与条件" }] }] };
const kolSchema: SubTypeFormSchema = { subTypeId: "dianping_kol", sections: [{ title: "内容结构", fields: [{ key: "sections", type: "multiselect", label: "包含段落", options: ["吸睛标题","开头代入","环境描写","菜品推荐","价格信息","位置指引","引导话术"], defaultValue: ["吸睛标题","开头代入","环境描写","菜品推荐"] }, { key: "tone", type: "segmented", label: "口吻", options: ["打卡探店","真实感受","攻略型","故事型"], defaultValue: "真实感受" }, { key: "targetPlatform", type: "multiselect", label: "适用平台", options: ["大众点评","小红书","抖音"], defaultValue: ["大众点评","小红书"] }, { key: "mentionDishCount", type: "select", label: "推荐菜数量", options: ["1道","2-3道","4-5道"], defaultValue: "2-3道" }] }] };
const xhsBioSchema: SubTypeFormSchema = {
  subTypeId: "xiaohongshu_bio",
  sections: [
    { title: "账号定位", fields: [
      { key: "positionKeyword", type: "text", label: "定位关键词", placeholder: "如：都市轻食打卡地、老字号传承手作", required: true },
      { key: "features", type: "multiselect", label: "核心卖点标签", options: ["食材新鲜", "手工现做", "性价比高", "环境好", "适合拍照", "老字号", "网红打卡", "隐藏菜单"], defaultValue: ["食材新鲜"] },
      { key: "targetAudience", type: "multiselect", label: "目标人群", options: ["年轻白领", "学生党", "情侣约会", "家庭聚餐", "美食爱好者", "探店达人"] },
    ]},
    { title: "联系信息", fields: [
      { key: "includeAddress", type: "toggle", label: "包含地址", defaultValue: true },
      { key: "includeHours", type: "toggle", label: "包含营业时间", defaultValue: true },
      { key: "includeFollowPrompt", type: "toggle", label: "引导关注", defaultValue: true, helpText: "在简介末尾添加'关注我们'或'欢迎打卡'" },
    ]},
    { title: "AI 参数", fields: [
      { key: "emotion", type: "segmented", label: "情感基调", options: ["治愈温暖", "烟火气", "精致感", "潮流酷感", "真实接地气"], defaultValue: "真实接地气" },
    ]},
  ],
};
const xhsSloganSchema: SubTypeFormSchema = {
  subTypeId: "xiaohongshu_slogan",
  sections: [
    { title: "标语设置", fields: [
      { key: "style", type: "segmented", label: "风格", options: ["卖点型", "氛围型", "潮流型", "亲切型"], defaultValue: "卖点型" },
      { key: "keyword", type: "text", label: "核心词", placeholder: "如：轻食、火锅、甜品、老街味道", required: true },
      { key: "hasEmoji", type: "toggle", label: "加入 Emoji", defaultValue: true },
    ]},
  ],
};
const xhsTitleSchema: SubTypeFormSchema = {
  subTypeId: "xiaohongshu_title",
  sections: [
    { title: "标题类型", fields: [
      { key: "hookType", type: "segmented", label: "主推钩子类型", options: ["痛点型", "数字清单型", "情感场景型", "限定紧迫型", "疑问互动型"], defaultValue: "数字清单型", helpText: "选择你偏好的方向，AI 以此为主生成 1 个，再搭配 2 个其他类型的标题作为对照" },
      { key: "keyword", type: "text", label: "核心关键词", placeholder: "如：隐藏美食、必吃、人均50", required: true },
      { key: "includeNumber", type: "toggle", label: "包含数字", defaultValue: true, helpText: "数字能显著提升点击率，如'Top5''3家''人均50'" },
    ]},
  ],
};
const xhsNoteSchema: SubTypeFormSchema = {
  subTypeId: "xiaohongshu_note",
  sections: [
    { title: "笔记设置", fields: [
      { key: "noteType", type: "segmented", label: "笔记类型", options: ["探店打卡", "深度测评", "攻略指南", "日常分享", "新品首发"], defaultValue: "探店打卡" },
      { key: "sections", type: "multiselect", label: "包含段落", options: ["开头代入", "菜品推荐", "环境描述", "价格/位置", "互动引导", "品牌故事", "小贴士"], defaultValue: ["开头代入", "菜品推荐", "环境描述", "价格/位置", "互动引导"] },
      { key: "dishCount", type: "select", label: "推荐菜数量", options: ["1-2道", "3-4道", "5道+"], defaultValue: "3-4道" },
    ]},
    { title: "菜品信息（选填）", fields: [{
      key: "dishes", type: "list", label: "菜品", maxItems: 5,
      fields: [
        { key: "name", type: "text", label: "菜名", required: true },
        { key: "price", type: "text", label: "价格（选填）", placeholder: "如：68元" },
        { key: "taste", type: "multiselect", label: "口感标签", options: ["麻辣鲜香", "鲜嫩多汁", "外酥里嫩", "入口即化", "酸甜可口", "Q弹爽滑", "浓香四溢", "清爽不腻"] },
        { key: "recommendReason", type: "text", label: "推荐理由（选填）", placeholder: "一句话说明为什么这道菜必点" },
      ],
    }]},
    { title: "互动与标签", fields: [
      { key: "interactionType", type: "multiselect", label: "互动引导方式", options: ["提问互动", "投票选择", "引导收藏", "引导打卡", "抽奖活动"], defaultValue: ["提问互动"] },
      { key: "includeLocationTag", type: "toggle", label: "包含定位标签", defaultValue: true },
      { key: "tagStrategy", type: "segmented", label: "标签策略", options: ["覆盖热门", "精准获客", "品牌强化"], defaultValue: "覆盖热门" },
    ]},
    { title: "AI 参数", fields: [
      { key: "emotion", type: "segmented", label: "情感基调", options: ["治愈温暖", "烟火气", "精致感", "潮流酷感", "真实接地气"], defaultValue: "真实接地气" },
      { key: "targetUser", type: "select", label: "目标用户", options: ["美食爱好者", "年轻白领", "学生党", "家庭主妇", "探店达人", "游客"] },
    ]},
  ],
};
const xhsCoverSchema: SubTypeFormSchema = {
  subTypeId: "xiaohongshu_cover",
  sections: [
    { title: "封面文案设置", fields: [
      { key: "keyword", type: "text", label: "核心卖点关键词", placeholder: "如：人均80吃到撑、凌晨现切毛肚、雨天治愈火锅", helpText: "AI 基于关键词生成完整封面文案，不要写完整的句子", required: true },
      { key: "subtitleHint", type: "text", label: "副标题方向（选填）", placeholder: "如：想体现性价比高，或者氛围感好" },
      { key: "style", type: "segmented", label: "封面风格", options: ["大字报", "美食特写", "场景氛围", "对比图"], defaultValue: "大字报" },
      { key: "fontPreference", type: "select", label: "字体偏好", options: ["粗体醒目", "手写亲切", "细体优雅"], defaultValue: "粗体醒目" },
      { key: "colorTone", type: "select", label: "色彩倾向", options: ["暖色系（食欲感）", "冷色系（高级感）", "高对比（突出）", "柔和（治愈感）"], defaultValue: "暖色系（食欲感）" },
    ]},
  ],
};
const xhsPromotionSchema: SubTypeFormSchema = {
  subTypeId: "xiaohongshu_promotion",
  sections: [
    { title: "活动信息（手动填写）", fields: [
      { key: "promoTitle", type: "text", label: "活动标题", placeholder: "如：周年庆全场8折", required: true },
      { key: "promoDetail", type: "textarea", label: "活动详情", placeholder: "请描述活动内容、优惠幅度、参与方式等", required: true, helpText: "AI 不编造优惠信息，所有具体内容必须在此填写" },
      { key: "promoType", type: "segmented", label: "活动类型", options: ["限时折扣", "团购套餐", "新品上市", "节日限定", "会员活动"], defaultValue: "限时折扣" },
      { key: "hasUrgency", type: "toggle", label: "限时限量", defaultValue: true },
      { key: "deadline", type: "text", label: "截止日期（选填）", placeholder: "如：8月5日" },
    ]},
    { title: "AI 参数", fields: [
      { key: "emotion", type: "segmented", label: "情感基调", options: ["兴奋冲动", "真实推荐", "温馨提醒"], defaultValue: "兴奋冲动" },
    ]},
  ],
};
const xhsTagsSchema: SubTypeFormSchema = {
  subTypeId: "xiaohongshu_tags",
  sections: [
    { title: "标签配置", fields: [
      { key: "strategy", type: "segmented", label: "标签策略", options: ["覆盖热门", "精准获客", "品牌强化"], defaultValue: "覆盖热门" },
      { key: "tagCount", type: "select", label: "标签数量", options: ["3-5个", "6-8个", "9-10个"], defaultValue: "6-8个" },
      { key: "includeBrandTag", type: "toggle", label: "包含品牌标签", defaultValue: true, helpText: "商家名称相关的品牌标签" },
      { key: "includeLocationTag", type: "toggle", label: "包含地域标签", defaultValue: true },
      { key: "customKeyword", type: "text", label: "自定义关键词（选填）", placeholder: "希望出现的特定词，如'隐藏菜单''排队王'" },
    ]},
  ],
};
const xhsKolSchema: SubTypeFormSchema = {
  subTypeId: "xiaohongshu_kol",
  sections: [
    { title: "合作信息", fields: [
      { key: "coopType", type: "segmented", label: "合作类型", options: ["付费探店", "置换合作", "UGC征集", "品牌代言"], defaultValue: "付费探店" },
      { key: "budget", type: "text", label: "预算范围（选填）", placeholder: "如：1000-3000元/篇或置换套餐" },
      { key: "requiredDishes", type: "textarea", label: "必须拍摄的菜品", placeholder: "每行一道菜，博主必须拍这些" },
      { key: "forbiddenWords", type: "textarea", label: "禁止出现的词（选填）", placeholder: "如：不能说'最好吃''绝对'等极限词" },
      { key: "publishDate", type: "text", label: "期望发布时间（选填）", placeholder: "如：8月1日-8月5日之间" },
    ]},
    { title: "内容要求", fields: [
      { key: "tone", type: "segmented", label: "口吻要求", options: ["真实体验感", "精致种草风", "攻略型", "故事型"], defaultValue: "真实体验感" },
      { key: "mustMention", type: "multiselect", label: "必须提及", options: ["店铺地址", "营业时间", "预约方式", "人均价格", "交通指引"] },
      { key: "includeTags", type: "toggle", label: "必须带上品牌话题标签", defaultValue: true },
    ]},
  ],
};
const xhsReplySchema: SubTypeFormSchema = {
  subTypeId: "xiaohongshu_reply",
  sections: [
    { title: "评论信息", fields: [
      { key: "replyType", type: "segmented", label: "回复类型", options: ["感谢好评", "答疑解惑", "引导到店", "UGC激励", "私信引导"], defaultValue: "感谢好评" },
      { key: "userName", type: "text", label: "用户昵称（选填）", placeholder: "将作为变量插入回复" },
      { key: "commentContent", type: "textarea", label: "评论内容概要（选填）", placeholder: "粘贴或概括用户说了什么，帮助AI生成更有针对性的回复" },
      { key: "mentionDish", type: "toggle", label: "推荐招牌菜", defaultValue: true, helpText: "在回复中顺手推荐一道招牌菜" },
      { key: "leadToDm", type: "toggle", label: "引导私信", defaultValue: false, helpText: "如'已私信你优惠码'" },
    ]},
  ],
};
const xhsUgcSchema: SubTypeFormSchema = {
  subTypeId: "xiaohongshu_ugc",
  sections: [
    { title: "活动设置", fields: [
      { key: "ugcType", type: "segmented", label: "活动类型", options: ["打卡有礼", "晒图征集", "评论抽奖", "视频挑战", "笔记征集"], defaultValue: "打卡有礼" },
      { key: "reward", type: "text", label: "奖品描述", placeholder: "如：送招牌毛肚一份 / 免单机会", required: true },
      { key: "condition", type: "textarea", label: "参与条件", placeholder: "如：带定位打卡+3张图以上，@我们账号", required: true },
      { key: "deadline", type: "text", label: "活动截止日期（选填）", placeholder: "如：8月15日" },
      { key: "examplePrompt", type: "toggle", label: "附带示例引导", defaultValue: true, helpText: "给出一个参与示例，降低用户参与门槛" },
    ]},
  ],
};

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




