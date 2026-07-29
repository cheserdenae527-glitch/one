
import type { ContentStrategyType, MerchantClassification, ContentPillar, PlatformSuggestion } from "./types";
import { STRATEGY_LABELS } from "./types";

// ── 8 大战略类型的内容模板 ─────────────────────

interface PillarDef {
  name: string; purpose: string; ratio: number;
  format_suggestions: string[]; examples: string[];
}
interface PlatformDef {
  platform: "dianping" | "xiaohongshu" | "douyin";
  priority: number; reason: string; contentFocus: string;
}

interface TypeDef {
  oneLinePositioning: string;
  description: string;
  persona: { position: string; personality: string[]; tone: string; contentDirections: string[]; examplePosts: string[] };
  pillars: PillarDef[];
  platforms: PlatformDef[];
  differentiationStrategy: string;
  initialTopics: string[];
}

type TemplateDict = Record<ContentStrategyType, (cuisine: string, city: string) => TypeDef>;

const STRATEGY_TEMPLATES: TemplateDict = {
  scene_experience: (c, city) => ({
    oneLinePositioning: `我是${c}领域的氛围专家，帮助想在${city}组局的朋友找到最合适的聚会场所，通过展示真实的聚餐场景和社交体验，解决「去哪儿吃、和谁吃、什么氛围吃」的决策问题。`,
    description: `你的店铺天然适合社交场景。内容核心不是「菜有多好吃」，而是「在这里吃饭有多爽」。用热闹氛围、大分量摆盘、朋友聚餐画面来吸引那些正在找地方聚会的用户。`,
    persona: {
      position: `${city}最懂氛围的${c}老餮`,
      personality: ["热闹", "懂吃", "社交达人"],
      tone: "热情洋溢，像是朋友推荐好馆子时的语气",
      contentDirections: ["聚餐场景", "氛围展示", "社交美食"],
      examplePosts: [
        `在${city}一周吃了三次的${c}，每次带不同朋友都被夸`,
        `聚会不知道去哪？这家${c}连老板都亲自给每桌加汤`,
      ],
    },
    pillars: [
      { name: "聚餐氛围", purpose: "种草聚餐场景", ratio: 0.35, format_suggestions: ["15s卡点视频", "多图合集"], examples: [`带朋友来吃${c}的快乐晚餐`] },
      { name: "招牌产品", purpose: "促进到店消费", ratio: 0.25, format_suggestions: ["特写展示", "吃播"], examples: [`这道菜一上桌，整桌人都安静了`] },
      { name: "环境体验", purpose: "展示空间价值", ratio: 0.20, format_suggestions: ["环境空镜", "探店Vlog"], examples: [`这家${c}店的环境也太适合约会了吧`] },
      { name: "促销活动", purpose: "引导即时到店", ratio: 0.20, format_suggestions: ["倒计时海报", "朋友圈文案"], examples: [`周三${c}半价，懂的都懂`] },
    ],
    platforms: [
      { platform: "xiaohongshu", priority: 1, reason: "种草属性最强，适合场景化内容", contentFocus: "氛围感图文+多图合集" },
      { platform: "dianping", priority: 2, reason: "本地用户主动搜索场景", contentFocus: "店铺页优化+套餐展示" },
      { platform: "douyin", priority: 3, reason: "适合视频化的聚餐记录", contentFocus: "卡点氛围视频+同城流量" },
    ],
    differentiationStrategy: `不拍菜，拍「一群人因为这家${c}聚在一起」的瞬间。同品类都在展示食材时，你展示社交价值。`,
    initialTopics: [
      `第一次来${c}店怎么点菜（避坑指南）`,
      "3个人来吃点什么最划算",
      "这家店连餐具都很有讲究",
      `带外地朋友来吃${c}被夸了一整晚`,
      "老板推荐的最强搭配套餐",
    ],
  }),

  value_for_money: (c, city) => ({
    oneLinePositioning: `我是${city}的打工人食堂，帮助每天纠结「吃什么」的上班族找到实惠又好吃的选择，通过展示真实的分量和价格，解决「花最少的钱吃最好的」的日常难题。`,
    description: `你的核心竞争力是性价比。内容核心是「这个价格吃到这些，值了」。用真实的食客反馈、分量对比、价格透明来建立「便宜又好吃」的口碑。`,
    persona: {
      position: `${city}打工人私藏的${c}性价比之王`,
      personality: ["实惠", "实在", "接地气"],
      tone: "实在人说话，不玩虚的，直接说价格和分量",
      contentDirections: ["性价比实测", "打工人场景", "隐藏菜单"],
      examplePosts: [
        `在${city}打工人一顿饭不到30，吃到了什么水平？`,
        `这家${c}我连续吃了7天，今天终于忍不住拍了`,
      ],
    },
    pillars: [
      { name: "性价比实测", purpose: "建立实惠认知", ratio: 0.35, format_suggestions: ["对比视频", "开箱实测"], examples: [`30块钱在${city}能吃到什么水平`] },
      { name: "出餐效率", purpose: "突出便利性", ratio: 0.20, format_suggestions: ["时间线视频", "后厨快剪"], examples: ["从点单到上菜只用了8分钟"] },
      { name: "打工人故事", purpose: "情感共鸣拉近距离", ratio: 0.25, format_suggestions: ["客人采访", "老板日常"], examples: ["一个在这吃了3年的老顾客说……"] },
      { name: "隐藏吃法", purpose: "增加复购频次", ratio: 0.20, format_suggestions: ["教程类", "攻略类"], examples: ["服务员都不知道的5种隐藏吃法"] },
    ],
    platforms: [
      { platform: "dianping", priority: 1, reason: "性价比内容天然适合本地生活平台的搜索场景", contentFocus: "套餐/团购展示+评价维护" },
      { platform: "douyin", priority: 2, reason: "适合展示实物分量和价格的视频形式", contentFocus: "同城流量+实拍展示" },
      { platform: "xiaohongshu", priority: 3, reason: "适合图文形式的探店攻略", contentFocus: "平价探店攻略" },
    ],
    differentiationStrategy: "不玩虚的。直接拍：称重、数数量、算人均。同品类强调好吃时，你强调花最少的钱吃到最好。",
    initialTopics: [
      `${c}人均不到30，到底能吃到什么`,
      "打工人午饭新发现，量也太大了",
      `对比了3家${c}，这家性价比完胜`,
      "一个套餐够两个人吃，老板确定不亏钱吗",
      "附近上班族的秘密食堂",
    ],
  }),

  boss_ip: (c, city) => ({
    oneLinePositioning: `我是${c}老板，帮助想做餐饮或热爱美食的朋友了解真实的餐饮经营，通过记录我的创业经历和日常，解决「餐饮到底怎么做」的信息差问题。`,
    description: `你最大的资产不是菜，是你这个人。内容核心是「一个有故事的老板在经营一家什么样的店」。用真实的人物经历、价值观输出、经营日常来建立信任和追随。`,
    persona: {
      position: `一个坚持${c}初心的倔强老板`,
      personality: ["真实", "有故事", "有态度"],
      tone: "真诚、有温度、偶尔自嘲，像朋友聊天一样分享",
      contentDirections: ["创业故事", "后厨纪实", "经营理念"],
      examplePosts: [
        "为什么我坚持每天凌晨4点去菜市场？",
        `经营${c}店第1000天，我想说点什么`,
      ],
    },
    pillars: [
      { name: "老板故事", purpose: "建立人设信任", ratio: 0.35, format_suggestions: ["口播", "日常记录"], examples: [`开${c}店之前，我其实是个程序员`] },
      { name: "后厨透明", purpose: "建立品质信任", ratio: 0.25, format_suggestions: ["纪实风", "科普"], examples: [`今天带大家看看我们的${c}后厨`] },
      { name: "经营思考", purpose: "行业影响力", ratio: 0.20, format_suggestions: ["观点输出", "问答"], examples: ["餐饮老板最怕的不是生意差，而是……"] },
      { name: "顾客故事", purpose: "情感共鸣", ratio: 0.20, format_suggestions: ["采访", "讲述"], examples: ["一个吃了5年的老顾客搬家前特意来告别"] },
    ],
    platforms: [
      { platform: "douyin", priority: 1, reason: "口播和纪实类内容天然适合抖音", contentFocus: "老板日常+经营故事" },
      { platform: "xiaohongshu", priority: 2, reason: "适合图文分享创业故事和经营感悟", contentFocus: "创业复盘+图文故事" },
      { platform: "dianping", priority: 3, reason: "作为本地口碑承接平台", contentFocus: "店铺页口碑维护" },
    ],
    differentiationStrategy: `不拍菜，拍人。你卖的不只是${c}，更是一个灵魂。同品类展示产品时，你展示「这家店为什么值得被喜欢」。`,
    initialTopics: [
      `我为什么决定开这家${c}店`,
      "开店30天踩了多少坑",
      "一个老顾客今天跟我说了一句话，让我破防了",
      "餐饮老板一天的真实工作时间",
      "今天有客人问我：老板你赚不赚钱？",
    ],
  }),

  chef_expertise: (c, city) => ({
    oneLinePositioning: `我是${c}领域的手艺人，帮助追求品质的食客真正理解${c}这门手艺，通过展示食材溯源、工艺细节和品鉴知识，解决「吃什么才算吃对了」的品质焦虑。`,
    description: `你的核心竞争力是专业度。内容核心不是「好吃」，而是「为什么好吃」。用食材溯源、工艺解析、品鉴知识来建立「最懂行」的认知。`,
    persona: {
      position: `用${c}说话的手艺人`,
      personality: ["专业", "极致", "有态度"],
      tone: "专业但不说教，像懂行的朋友在讲解",
      contentDirections: ["食材溯源", "工艺展示", "品鉴知识"],
      examplePosts: [
        `一块好${c}食材，从产地到餐桌要走多少路`,
        `不是所有${c}都配叫这个名字——我的标准`,
      ],
    },
    pillars: [
      { name: "食材故事", purpose: "建立品质认知", ratio: 0.30, format_suggestions: ["纪录片风", "科普"], examples: [`为什么我们只用这种${c}食材`] },
      { name: "工艺展示", purpose: "建立专业认知", ratio: 0.30, format_suggestions: ["过程记录", "时间线"], examples: [`一道${c}从备菜到上桌的全过程`] },
      { name: "品鉴教学", purpose: "教育用户", ratio: 0.20, format_suggestions: ["教程", "评测"], examples: [`真正懂${c}的人是这样吃的`] },
      { name: "行业观点", purpose: "确立专家地位", ratio: 0.20, format_suggestions: ["观点输出", "行业分析"], examples: [`现在很多${c}店的问题不是价格，是诚意`] },
    ],
    platforms: [
      { platform: "xiaohongshu", priority: 1, reason: "深度的图文科普内容在小红书很受欢迎", contentFocus: "食材知识+工艺图文" },
      { platform: "douyin", priority: 2, reason: "适合展示工艺过程的短视频", contentFocus: "手艺过程+幕后记录" },
      { platform: "dianping", priority: 3, reason: "承接本地用户的到店转化", contentFocus: "店铺品质展示" },
    ],
    differentiationStrategy: "别人说好吃，你说「为什么好吃」。用专业度建立信息差，让用户觉得在你这里学到了东西。",
    initialTopics: [
      `真正懂${c}的人，进店第一眼看什么`,
      `为了找一块好${c}食材我跑了三个城市`,
      `这道${c}做了8年，今天公开配方`,
      `市面上80%的${c}都不合格，这是我的标准`,
      `一个人怎么吃${c}才是正确的打开方式`,
    ],
  }),

  lifestyle: (c, city) => ({
    oneLinePositioning: `我是${city}的生活美学发现者，帮助在${city}忙碌生活中寻找片刻宁静的人找到属于自己的治愈角落，通过分享空间美学和真实体验，解决「想找一个有温度的地方待一会儿」的精神需求。`,
    description: `你卖的不只是产品，是一个空间和一种生活方式。内容核心围绕「在这里的感觉」。用氛围感、美学构图、情绪价值来吸引那些追求生活品质的用户。`,
    persona: {
      position: `在${city}找到属于你的${c}时光`,
      personality: ["温暖", "有品位", "懂得生活"],
      tone: "温柔、治愈，像在写一篇生活日记",
      contentDirections: ["空间美学", "生活方式", "情绪内容"],
      examplePosts: [
        `下雨天，一杯${c}，一本书`,
        `在${city}发现一家藏在巷子里的${c}小店`,
      ],
    },
    pillars: [
      { name: "空间美学", purpose: "种草到店体验", ratio: 0.30, format_suggestions: ["氛围视频", "视觉图文"], examples: [`这家${c}的每个角落都能拍出大片`] },
      { name: "产品故事", purpose: "促进消费", ratio: 0.25, format_suggestions: ["制作过程", "特写展示"], examples: [`为什么这杯${c}让老顾客每天都要来喝`] },
      { name: "生活方式", purpose: "建立品牌调性", ratio: 0.25, format_suggestions: ["Vlog", "日常记录"], examples: [`在${city}一个治愈的周末下午`] },
      { name: "顾客故事", purpose: "情感连接", ratio: 0.20, format_suggestions: ["采访", "文字+图片"], examples: ["一个每周都来坐一下午的客人"] },
    ],
    platforms: [
      { platform: "xiaohongshu", priority: 1, reason: "生活方式内容在小红书转化率最高", contentFocus: "空间美学+氛围图文" },
      { platform: "douyin", priority: 2, reason: "适合氛围类短视频", contentFocus: "治愈系短片+同城推荐" },
      { platform: "dianping", priority: 3, reason: "本地搜索承接", contentFocus: "环境展示+评价维护" },
    ],
    differentiationStrategy: `不卖产品，卖感觉。别人展示多好喝，你展示在这里坐一下午有多舒服。用氛围感拉开差距。`,
    initialTopics: [
      `藏在${city}巷子里的一家${c}，只有本地人知道`,
      `一个人的${c}时光`,
      `这家${c}店的老板是个有故事的人`,
      "治愈系空间：适合发呆的角落",
      "为什么这家店不做外卖？老板说……",
    ],
  }),

  local_buzz: (c, city) => ({
    oneLinePositioning: `我是${city}街坊邻居的${c}食堂，帮助在${city}寻找真正好吃又不贵小店的人发现宝藏，通过真实的记录和街坊的真实评价，解决「哪里有好吃的」这个永恒问题。`,
    description: `你的口碑是最大的资产。内容核心是「街坊邻居都说好」的真实口碑。用老顾客的真实评价、复购理由、邻里故事来建立「本地人都认可」的信任背书。`,
    persona: {
      position: `${city}人吃了都说好的${c}`,
      personality: ["靠谱", "实在", "有人情味"],
      tone: "朴实真诚，像邻家小店老板的日常聊天",
      contentDirections: ["真实评价", "街坊故事", "日常记录"],
      examplePosts: [
        `在这家${c}店吃了8年的老顾客说……`,
        `不做广告，不做推广，为什么这家${c}天天排队`,
      ],
    },
    pillars: [
      { name: "顾客口碑", purpose: "建立信任背书", ratio: 0.35, format_suggestions: ["采访", "评价截图"], examples: ["一个带父母来吃了3年的儿子"] },
      { name: "日常经营", purpose: "展示真实感", ratio: 0.25, format_suggestions: ["纪实记录", "后厨花絮"], examples: [`一个普通${c}店的普通一天`] },
      { name: "隐藏菜单", purpose: "增加话题性", ratio: 0.20, format_suggestions: ["揭秘", "攻略"], examples: ["老顾客才知道的隐藏菜单"] },
      { name: "邻里故事", purpose: "情感连接", ratio: 0.20, format_suggestions: ["故事讲述", "图文"], examples: ["这条街开了20年，这家店占了15年"] },
    ],
    platforms: [
      { platform: "dianping", priority: 1, reason: "本地口碑的核心平台", contentFocus: "真实评价+店铺页优化" },
      { platform: "xiaohongshu", priority: 2, reason: "适合图文形式的本地宝藏店安利", contentFocus: "本地探店+口碑传播" },
      { platform: "douyin", priority: 3, reason: "适合展示排队/日常的真实场景", contentFocus: "同城推荐+本地流量" },
    ],
    differentiationStrategy: `不请探店博主。真实的街坊评价胜过100个付费推广。别人看起来很好，你「吃过的人都说好」。`,
    initialTopics: [
      `不靠广告只靠口碑，这家${c}店活了10年`,
      "附近上班族的第二食堂",
      `偶然路过发现的宝藏${c}，已经连吃了3天`,
      "为什么老顾客宁愿排队也不去别家",
      `老板说：我们不做营销，做好每一碗${c}就够了`,
    ],
  }),

  emotional_comfort: (c, city) => ({
    oneLinePositioning: `我是${city}城市里的温暖驿站，帮助在${city}感到疲惫或孤独的人找到一个可以安静待一会儿的小角落，通过展示小店里的温暖瞬间和人间烟火，解决「想要被治愈一下」的情绪需求。`,
    description: `你是一个有温度的避风港。内容核心是「治愈感」——一个人的晚餐、雨天的一碗热汤、老板的一句关心。用真实的人情味来建立情感连接。`,
    persona: {
      position: `${city}城市角落里的温暖${c}小店`,
      personality: ["温暖", "治愈", "有人情味"],
      tone: "温柔、细腻，像在写日记一样记录小店里的温暖瞬间",
      contentDirections: ["温暖瞬间", "小店故事", "人间烟火"],
      examplePosts: [
        `一个女孩加班后独自来吃${c}，老板默默加了一个蛋`,
        `深夜11点，最后一桌客人走后的${c}店`,
      ],
    },
    pillars: [
      { name: "治愈瞬间", purpose: "建立情绪共鸣", ratio: 0.35, format_suggestions: ["短视频", "图文"], examples: [`雨天一个人来吃${c}被老板暖到了`] },
      { name: "小店故事", purpose: "品牌温度", ratio: 0.25, format_suggestions: ["故事片", "口播"], examples: ["一个客人在我们店求婚成功了"] },
      { name: "产品治愈", purpose: "促进消费", ratio: 0.20, format_suggestions: ["特写", "制作过程"], examples: [`不开心的时候，来一碗热腾腾的${c}`] },
      { name: "老板日常", purpose: "拉近关系", ratio: 0.20, format_suggestions: ["日常记录", "幕后"], examples: ["老板今天做了一件事，让我想在这工作一辈子"] },
    ],
    platforms: [
      { platform: "xiaohongshu", priority: 1, reason: "情绪类内容在小红书共鸣最高", contentFocus: "温暖图文+治愈故事" },
      { platform: "douyin", priority: 2, reason: "适合治愈类短视频", contentFocus: "温暖口播+治愈短片" },
      { platform: "dianping", priority: 3, reason: "本地搜索承接", contentFocus: "环境展示+评价积累" },
    ],
    differentiationStrategy: `不卖${c}，卖「被在乎的感觉」。别人比装修时，你比人情味。用真实的温暖打败一切营销套路。`,
    initialTopics: [
      `深夜${c}店，老板给每个独自来的客人送了一份小菜`,
      "一个在这里吃了5年晚餐的单身女孩",
      `下雨天的${c}店，比平时多了一份温度`,
      "老板记住每个常客的口味，这就是这家店的意义",
      `不是最好的${c}，但是最治愈的${c}`,
    ],
  }),

  cuisine_expert: (c, city) => ({
    oneLinePositioning: `我是${c}行业的深度研究者，帮助热爱${c}的人真正懂${c}，通过深度的行业知识、品鉴标准和前沿洞察，解决「什么样的${c}才是真的好」的认知问题。`,
    description: `你对这个品类有深度的理解。内容核心是「建立品类标准」——什么是好${c}，怎么判断好${c}，行业里不为人知的秘密。用认知差来建立权威。`,
    persona: {
      position: `不是所有${c}都叫${c}`,
      personality: ["专业", "有观点", "敢说真话"],
      tone: "自信、有洞察，像一个行业老炮在分享真知灼见",
      contentDirections: ["行业科普", "品鉴标准", "深度测评"],
      examplePosts: [
        `很多人不知道，80%的${c}店都不达标`,
        `一份真正合格的${c}，需要满足这3个标准`,
      ],
    },
    pillars: [
      { name: "行业科普", purpose: "建立专业认知", ratio: 0.30, format_suggestions: ["科普视频", "深度图文"], examples: [`${c}行业不为人知的5个真相`] },
      { name: "品鉴标准", purpose: "设立行业标准", ratio: 0.25, format_suggestions: ["评测", "对比"], examples: [`真正懂${c}的人是怎么判断好坏的`] },
      { name: "产品深度", purpose: "展示自家品质", ratio: 0.25, format_suggestions: ["工艺展示", "溯源"], examples: [`我们家的${c}为什么不一样`] },
      { name: "行业观点", purpose: "输出价值观", ratio: 0.20, format_suggestions: ["观点输出", "行业分析"], examples: [`${c}行业的暴利真相`] },
    ],
    platforms: [
      { platform: "xiaohongshu", priority: 1, reason: "深度的知识类内容在小红书粘性高", contentFocus: "行业知识+深度科普图文" },
      { platform: "douyin", priority: 2, reason: "观点输出类口播适合抖音传播", contentFocus: "行业观点+知识短视频" },
      { platform: "dianping", priority: 3, reason: "承接本地转化", contentFocus: "品质展示+差异化定位" },
    ],
    differentiationStrategy: `建立认知标准，让用户用你的标准去评判所有同类店铺。当用户认同你的标准时，你的店就是最好的选择。`,
    initialTopics: [
      `真正会吃${c}的人，进店第一件事不是看菜单`,
      `为什么便宜的${c}不能吃？算一笔成本账`,
      `我走遍${city}100家${c}店，发现了一个规律`,
      `一个${c}行业的内部人告诉你该怎么选`,
      `你家楼下的${c}店合格吗？用这个标准判断`,
    ],
  }),
};

// ── 构建完整的分类结果 ────────────────────────────────

function renderTypeDef(tpl: TypeDef): Pick<MerchantClassification, "oneLinePositioning" | "description" | "differentiationStrategy"> {
  return {
    oneLinePositioning: tpl.oneLinePositioning,
    description: tpl.description,
    differentiationStrategy: tpl.differentiationStrategy,
  };
}

export function getStrategyTemplate(
  type: ContentStrategyType,
  cuisine: string,
  city: string,
): MerchantClassification {
  const tpl = STRATEGY_TEMPLATES[type](cuisine || "美食", city || "本地");
  return {
    primaryType: type,
    oneLinePositioning: tpl.oneLinePositioning,
    description: tpl.description,
    recommendedPersona: tpl.persona,
    contentPillars: tpl.pillars.map((p) => ({
      name: p.name,
      purpose: p.purpose,
      ratio: p.ratio,
      format_suggestions: p.format_suggestions,
      examples: p.examples,
    })),
    platformPriority: tpl.platforms.map((p) => ({
      platform: p.platform,
      priority: p.priority,
      reason: p.reason,
      contentFocus: p.contentFocus,
    })),
    differentiationStrategy: tpl.differentiationStrategy,
    initialTopics: tpl.initialTopics,
  };
}

export function getAllStrategySummaries(): Array<{ type: ContentStrategyType; label: string; oneLine: string }> {
  return (Object.keys(STRATEGY_TEMPLATES) as ContentStrategyType[]).map((type) => {
    const tpl = STRATEGY_TEMPLATES[type]("（品类）", "（城市）");
    return {
      type,
      label: STRATEGY_LABELS[type],
      oneLine: tpl.oneLinePositioning,
    };
  });
}
