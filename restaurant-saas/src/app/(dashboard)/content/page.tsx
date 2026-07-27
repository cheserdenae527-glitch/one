"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Sparkles, X, Copy, Bookmark, Trash2, RotateCcw } from "lucide-react";
import { FormRenderer } from "@/components/content/form-renderer";
import { DouyinSubTypeSelector } from "@/components/content/DouyinSubTypeSelector";

import { getSubTypeSchema, getSubTypeSchemaDefaults } from "@/components/content/subtype-form-schemas";

 /* ── 顶层类型 ── */
 const CONTENT_TYPES = [
   { id: "dianping", label: "大众点评", desc: "12 种专项文案，覆盖店铺运营全场景" },
   { id: "xiaohongshu", label: "小红书笔记", desc: "种草文案，吸引用户到店" },
   { id: "promotion", label: "促销活动", desc: "节日/新客/老客活动文案" },
   { id: "reply", label: "评价回复", desc: "好评感谢、差评回复" },
   { id: "douyin", label: "抖音脚本", desc: "短视频口播脚本" },
 ];

 /* ── 大众点评子类型 ── */
 interface DianpingSubItem {
   id: string;
   label: string;
   tone: boolean;   // 是否需要语气选择
   length: boolean; // 是否需要长度选择
   ref: boolean;    // 是否需要参考内容输入
 }

 interface DianpingSubGroup {
   group: string;
   items: DianpingSubItem[];
 }

 const DIANPING_SUBTYPES: DianpingSubGroup[] = [
   {
     group: "基础信息类",
     items: [
       { id: "dianping_profile", label: "店铺简介/品牌故事", tone: true, length: true, ref: true },
       { id: "dianping_service", label: "服务设施描述", tone: true, length: false, ref: true },
       { id: "dianping_hours", label: "营业时间温馨提示", tone: false, length: false, ref: false },
     ],
   },
   {
     group: "视觉配文类",
     items: [
       { id: "dianping_hero", label: "头图Slogan", tone: true, length: false, ref: true },
       { id: "dianping_dish", label: "招牌菜描述", tone: true, length: false, ref: true },
       { id: "dianping_ambience", label: "环境照片配文", tone: true, length: false, ref: true },
     ],
   },
   {
     group: "活动营销类",
     items: [
       { id: "dianping_deal", label: "团购/套餐描述", tone: true, length: true, ref: true },
       { id: "dianping_poster", label: "促销海报/灯箱", tone: true, length: false, ref: true },
       { id: "dianping_reply", label: "评价回复模板", tone: true, length: false, ref: true },
     ],
   },
   {
     group: "运营类",
     items: [
       { id: "dianping_branch", label: "分店信息描述", tone: true, length: true, ref: true },
       { id: "dianping_engagement", label: "用户引导内容", tone: true, length: false, ref: true },
       { id: "dianping_kol", label: "种草素材模板", tone: true, length: true, ref: true },
     ],
   },
 ];

 /* ── 获取当前选中子类型的配置 ── */
 function getActiveSubItem(subTypeId: string | null): DianpingSubItem | null {
   if (!subTypeId) return null;
   for (const g of DIANPING_SUBTYPES) {
     for (const item of g.items) {
       if (item.id === subTypeId) return item;
     }
   }
   for (const g of XIAOHONGSHU_SUBTYPES) {
     for (const item of g.items) {
       if (item.id === subTypeId) return item;
     }
   }
   return null;
 }

 /* ── 全局控制选项 ── */
 const TONES = ["轻松自然", "正式专业", "活泼潮流"];
 const LENGTHS = ["短（200字）", "中（500字）", "长（800字）"];
 const MAX_HISTORY = 20;

 /* ── Demo 内容（AI 不可用时的 fallback） ── */
 const DEMO_CONTENTS: Record<string, string> = {
   dianping: "请先选择具体的大众点评文案类型。",
   xiaohongshu: "在上海挖到一家神仙火锅！人均80吃到撑🔥\n\n终于打卡了收藏夹里躺了半年的老码头火锅，果然名不虚传！\n\n🌟推荐必点：\n- 精品鲜毛肚：每日现切，七上八下入口爽脆\n- 手打虾滑：Q弹鲜甜，能吃到整只虾\n- 鲜切黄牛肉：纹理漂亮，涮10秒刚刚好\n\n店里的环境也很有氛围感，适合拍照打卡📸\n\n#上海美食 #火锅 #上海探店 #美食推荐",
   promotion: "【周年庆回馈】全场菜品8折优惠！\n\n活动时间：7月20日 - 8月5日\n\n到店消费满200元赠送招牌毛肚一份\n\n老朋友回来吃顿熟悉的味道，新朋友来尝尝我们的招牌好菜。",
   reply: "感谢您的光临和好评！我们的毛肚确实是每天凌晨去市场现选的，师傅4点就去挑货了。下次来试试我们新出的菌汤锅底，也是最近很受欢迎的新品。期待您再次光临！",
   douyin: "【3秒钩子】在上海吃了10年的火锅店，到底凭什么天天排队？\n\n【店铺故事】老码头火锅开了12年，老板老陈自己就是炒料师傅，每天凌晨4点去市场挑毛肚。\n\n【产品展示】看这锅红油，看这毛肚的纹理，七上八下入口脆嫩。\n\n【用户场景】朋友聚餐来这，情侣约会来这，一个人想吃火锅也来这。\n\n【行动引导】左下角定位在这里，来晚了可要排队哦！",
 };

 const SUBTYPE_DEMOS: Record<string, string> = {
   dianping_profile: "开了12年的老成都火锅，坚持每天现熬牛油锅底。招牌毛肚每日凌晨现切，入口爽脆化渣。\n\n位于人民广场商圈，交通便利，环境宽敞适合聚餐。人均80-120元，性价比超高。\n\n推荐菜品：精品鲜毛肚、手打虾滑、鲜切黄牛肉。适合朋友聚会、情侣约会、家庭聚餐。",
   dianping_service: "🅿️ 门口有停车场，开车来也方便\n📶 全店免费 WiFi，边吃边刷剧\n🎤 3 间主题包厢，生日聚会首选\n👶 提供儿童座椅，带娃不慌",
   dianping_hours: "营业时间：周一至周日 11:00-22:00\n地址：人民路 88 号 B1 层（地铁 2 号线人民广场站 C 口步行 3 分钟）\n💡 提示：晚高峰 18:00-19:30 可能需要等位，建议提前预约",
   dianping_hero: "成都人排队 3 小时，就为这一锅沸腾的老味道",
   dianping_dish: "【精品鲜毛肚】\n每日凌晨 4 点市场现选，七上八下 15 秒，入口爽脆化渣。\n搭配蒜泥香油碟，成都人认证的老味道。\n\n【手打虾滑】\n鲜虾仁手工捶打，能吃到大颗虾肉。\nQ 弹鲜甜，老人小孩都爱。\n\n【鲜切黄牛肉】\n纹理如雪花般分布，涮 10 秒刚刚好。\n牛肉的奶香和锅底的麻辣在嘴里打架，过瘾。",
   dianping_ambience: "暖黄的灯笼灯光，木质的八仙桌，墙上挂着老成都的老照片。\n适合下班后一个人来涮一锅，也适合三五好友围炉夜话。",
   dianping_deal: "【双人经典套餐】原价 268 元 → 团购价 198 元\n包含：锅底（2 选 1）+ 精品毛肚 + 手打虾滑 + 鲜切黄牛肉 + 蔬菜拼盘 + 酸梅汤 2 杯\n适用场景：朋友小聚、情侣约会、工作日午餐\n使用须知：节假日通用，需提前 1 天预约，有效期 30 天",
   dianping_poster: "🔥 周年庆倒计时！全场菜品 8 折，满 200 送招牌毛肚\n限时 7 天，错过等一年",
   dianping_reply: "感谢您的光临和好评！我们的毛肚确实是每天凌晨去市场现选的，师傅4点就去挑货了。下次来试试我们新出的菌汤锅底，也是最近很受欢迎的新品。期待您再次光临！",
   dianping_branch: "【望京店】韩式烤肉 x 川味火锅的融合体验，周边白领的午餐首选。\n主打：午市定食套餐（48 元起）、晚间包场服务。",
   dianping_engagement: "📸 在小红书/大众点评晒出你的招牌菜照片，带定位打卡，下次消费送招牌毛肚一份！",
   dianping_kol: "标题：在上海挖到一家神仙火锅！人均 80 吃到撑🔥\n\n终于打卡了收藏夹里躺了半年的老码头火锅，果然名不虚传！\n\n🌟 推荐必点：\n- 精品鲜毛肚：每日现切，七上八下入口爽脆\n- 手打虾滑：Q 弹鲜甜，能吃到整只虾\n- 鲜切黄牛肉：纹理漂亮，涮 10 秒刚刚好\n\n店里的环境也很有氛围感，暖黄灯光适合拍照打卡📸\n\n位于人民广场商圈，交通方便，人均 80-120 元，性价比超高。\n\n#上海美食 #火锅 #上海探店 #美食推荐",
 };

/* ── 类型定义 ── */

 /* ── 小红书 Demo 内容 ── */
 const XIAOHONGSHU_DEMOS: Record<string, string> = {
   xiaohongshu_bio: "🏠 上海隐藏级川味老火锅｜开了12年的老味道\n🌶️ 坚持每天现熬牛油锅底，毛肚凌晨现切\n📍 人民路88号B1层（人民广场站C口步行3分钟）\n⏰ 周一至周日 11:00-22:00\n❤️ 关注我们，每周更新隐藏菜单不迷路",
   xiaohongshu_slogan: "🔥 火锅脑袋集合地｜不开心的都来涮一锅",
   xiaohongshu_title: "1. 上海火锅Top5｜人均80的隐藏级老店\n2. 周末不知道吃啥？这家藏在巷子里的火锅救了我\n3. 雨天就该来这家暖黄的火锅店，治愈了整周疲惫",
   xiaohongshu_note: "在上海挖到一家开了12年的老火锅！藏在人民广场巷子里😭\n\n🌟 推荐必点：\n【精品鲜毛肚】每天凌晨现挑，七上八下15秒，入口脆到有回响！\n【手打虾滑】能吃到整颗虾肉，Q弹到在嘴里弹跳\n\n🏠 暖黄灯笼、木质八仙桌，适合朋友聚餐、情侣约会\n\n📍 人民路88号B1层\n💰 人均80-120\n\n你们最想试哪一道？评论区告诉我👇\n\n#上海美食 #火锅 #上海探店",
   xiaohongshu_cover: "候选1（大字报）：主标题：百元吃到撑🔥 副标题：人民广场隐藏火锅店\n候选2（美食特写）：主标题：开口脆的毛肚！ 副标题：凌晨现切，就这一家\n候选3（场景氛围）：主标题：雨天治愈火锅 副标题：暖灯下的老味道",
   xiaohongshu_promotion: "🎉 周年庆福利｜全场菜品8折 + 满200送招牌毛肚\n\n📅 活动时间：7月25日 - 8月5日\n📍 人民路88号 B1层\n\n🎁 到店出示本文 → 全场8折\n🎁 消费满200 → 再送精品毛肚一份\n\n限时12天，错过等明年🏃‍♂️",
   xiaohongshu_tags: "策略1-覆盖热门：上海美食 火锅 美食探店 隐藏美食 排队王\n策略2-精准获客：火锅脑袋集合地 一人食火锅 适合聚会的火锅店\n策略3-品牌强化：老码头火锅 火锅天花板 人民广场",
   xiaohongshu_kol: "Hi～我们是老码头火锅，想邀请你做一期真实探店内容！\n\n🎬 必拍：精品鲜毛肚 + 手打虾滑 + 店内环境\n📝 请提及地址和营业时间，带上话题 #老码头火锅\n❌ 避免使用'最好吃''第一名'等极限词\n\n💰 置换双人套餐 / 付费探店（私信详聊）",
   xiaohongshu_reply: "感谢好评！毛肚确实是我们家的灵魂，师傅每天凌晨4点去市场挑的👨‍🍳\n下次试试我们新出的菌汤锅底，也很受欢迎～\n期待你再来！🙌",
   xiaohongshu_ugc: "📸 打卡有礼｜发布笔记@我们，送招牌毛肚一份！\n\n① 到店拍照 ② 发小红书笔记+定位 ③ @老码头火锅 + 话题 #老码头火锅\n\n🎁 凭发布笔记到前台，直接送精品毛肚一份！",
 };
 interface HistoryItem {
   id: string;
   type: string;
   subType?: string;
   content: string;
   time: string;
 }

 interface AppliedAnalysis {
   writingStyle?: string;
   hookType?: string;
   structure?: string[];
   toneTags?: string[];
   promptTemplate?: string;
 }

 /* ── 子类型提示映射 ── */
 const SUBTYPE_TIPS: Record<string, string> = {
   dianping_profile: "突出店铺历史或独特工艺，避免空洞形容词",
   dianping_service: "把设施翻译成顾客利益，如「免费WiFi」→「边吃边追剧不心疼流量」",
   dianping_hero: "控制在15字以内，让顾客一眼记住你的店",
   dianping_dish: "每道菜突出一个核心记忆点，不要面面俱到",
   dianping_ambience: "用场景词营造代入感，如「暖黄灯光」「窗外街景」",
   dianping_reply: "差评回复语气要诚恳但不用过度道歉，重点是解决方案",
   dianping_kol: "标题要有平台感，第一句制造好奇或共鸣",
 };

/* ═══════════════════════ 组件 ═══════════════════════ */

 /* ── 小红书子类型提示 ── */
 const DOUYIN_TIPS: Record<string, string> = {
  douyin_nickname: "昵称要包含城市+品类关键词，提升搜索权重",
  douyin_bio: "前 20 字抓住注意力，一句话说清卖点+地址，控制在 50 字以内",
  douyin_title: "前 5 字决定点击率，用反问/数字/情绪词开头",
  douyin_description: "前 3 秒必须有大钩子，结构：钩子+菜品亮点+故事+地址/优惠+互动引导",
  douyin_subtitle: "配合 BGM 节奏，每句 5-15 字，一屏一句",
  douyin_live_opener: "直播前 15 秒决定留存率，问候+福利预告+留人钩子",
  douyin_live_product: "每道菜突出一个记忆点，价格锚点+稀缺感",
  douyin_live_cta: "短促有力，限时限量+从众心理+明确指令",
  douyin_live_closer: "感谢+回顾福利+预告下次+关注引导",
  douyin_promotion: "标题突出性价比，详情写清楚包含什么、省多少",
  douyin_poi: "写清楚怎么找店+门店特色，含交通关键词提升搜索排名",
  douyin_ad: "强钩子开头+利益点+立即行动",
  douyin_hashtag: "本地话题(2-3个)+品类话题(1-2个)+热点话题(1-2个)+品牌话题(1个)",
  douyin_reply: "短快有梗，先回应情绪再引导行动",
};
const XIAOHONGSHU_TIPS: Record<string, string> = {
   xiaohongshu_bio: "突出店铺独特定位，前 20 字抓住用户注意力，加入地址和引导关注",
   xiaohongshu_slogan: "6-15 字，像品牌标签一样好记，如「轻食界的天花板」「火锅脑袋集合地」",
   xiaohongshu_title: "前 10 字决定点击率，试试数字开头或制造好奇，控制在 20 字以内",
   xiaohongshu_note: "多用真实体验感，避免硬广口吻，每推荐一道菜就写一个记忆点",
   xiaohongshu_cover: "把最核心的卖点放大到封面上，字体要大、对比要强，参考热门封面风格",
   xiaohongshu_promotion: "突出限时/限量的紧迫感，团购文案要写清楚包含什么、省多少",
   xiaohongshu_tags: "热门词(2-3个) + 长尾词(2-3个) + 地域词(1-2个) + 品牌词(1个)",
   xiaohongshu_kol: "给 KOL 的 brief 要写清楚：必须拍的菜、不能说的词、发布节点和标签要求",
   xiaohongshu_reply: "先共情再引导，不要只有'谢谢'，加入推荐菜或福利钩子",
   xiaohongshu_ugc: "降低参与门槛，奖品要诱人，规则要简单到不用动脑",
 };
 export default function ContentPage() {
   const [type, setType] = useState(CONTENT_TYPES[0]);
   const [subType, setSubType] = useState<string | null>(null);
   const [tone, setTone] = useState(TONES[0]);
   const [length, setLength] = useState(LENGTHS[0]);
   const [reference, setReference] = useState("");
   const [analysisData, setAnalysisData] = useState<AppliedAnalysis | null>(null);
   const [loading, setLoading] = useState(false);
   const [content, setContent] = useState("");
   const [isSaved, setIsSaved] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [formValues, setFormValues] = useState<Record<string, any>>({});

   const activeSubItem = getActiveSubItem(subType);
  // 子类型切换时加载 schema 默认值
  useEffect(() => {
    if ((type.id === "dianping" || type.id === "xiaohongshu" || type.id === "douyin") && subType) { const schema = getSubTypeSchema(subType);
      if (schema) {
        const saved = localStorage.getItem("form_values_" + subType);
        if (saved) {
          try { setFormValues(JSON.parse(saved)); return; } catch {}
        }
      }
      setFormValues(getSubTypeSchemaDefaults(subType));
    }
  }, [subType, type.id]);
  // 持久化 formValues
  useEffect(() => {
    if ((type.id === "dianping" || type.id === "xiaohongshu" || type.id === "douyin") && subType && Object.keys(formValues).length > 0) {
      localStorage.setItem("form_values_" + subType, JSON.stringify(formValues));
    }
  }, [formValues, subType, type.id]);

   /* 从右侧热门参考应用分析结果 */
   function handleApplyAnalysis(analysis: AppliedAnalysis, title: string) {
     setReference(title);
     setAnalysisData(analysis);
     toast.success("已应用「" + title + "」的风格参考");
   }

   function handleReferenceChange(value: string) {
     setReference(value);
     if (analysisData) setAnalysisData(null);
   }

   /* 切换顶层类型时清空子类型 */
   function handleTypeChange(t: typeof CONTENT_TYPES[number]) {
     if (t.id === type.id) return;
     setType(t);
     setSubType(null);
     setContent("");
     setIsSaved(false);
   }

   /* 子类型选中 */
   function handleSubTypeSelect(id: string) {
     setSubType(id);
     setContent("");
     setIsSaved(false);
     // 保留已选的语气和长度
   }

   useEffect(() => {
     const saved = localStorage.getItem("content_history");
     if (saved) {
       try { setHistory(JSON.parse(saved)); } catch { /* silent */ }
     }
   }, []);

   useEffect(() => {
     localStorage.setItem("content_history", JSON.stringify(history));
   }, [history]);

   async function handleGenerate() {
     setLoading(true);
     setIsSaved(false);
     try {
       const body: Record<string, unknown> = {
         contentType: type.id,
         platform:
           type.id === "dianping" ? "大众点评" :
           type.id === "xiaohongshu" ? "小红书" :
           type.id === "douyin" ? "抖音" : "",
         tone,
         length: length.includes("短") ? "short" : length.includes("中") ? "medium" : "long",
         referenceContent: reference ? { title: reference, ...(analysisData || {}) } : undefined,
       };
      if (type.id === "dianping") {
       body.subType = subType;
       body.extraParams = { formData: formValues };
      }
      if (type.id === "xiaohongshu" && subType) {
        body.subType = subType;
        body.extraParams = { formData: formValues };
      }
      if (type.id === "douyin" && subType) {
        body.subType = subType;
        body.extraParams = { formData: formValues };
      }
       const res = await fetch("/api/content/generate", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
       });
       if (!res.ok) throw new Error("API 未配置");
       const data = await res.json();
       setContent(data.content || "");
     } catch {
       // Fallback to demo content
       const fallback =
         type.id === "dianping" && subType && SUBTYPE_DEMOS[subType]
           ? SUBTYPE_DEMOS[subType]
           : type.id === "xiaohongshu" && subType && XIAOHONGSHU_DEMOS[subType]
           ? XIAOHONGSHU_DEMOS[subType]
           : DEMO_CONTENTS[type.id] || "";
       setContent(fallback);
       toast.info("AI 服务暂未连接，先展示一段示例文案给你参考");
     } finally {
       setLoading(false);
     }
   }

   function handleSave() {
     if (!content.trim()) return;
     const label =
       type.id === "dianping" && subType
         ? "大众点评 · " + (getActiveSubItem(subType)?.label || subType)
         : type.label;
     setHistory((prev) => [
       { id: "h_" + Date.now(), type: label, subType: subType ?? undefined, content, time: new Date().toLocaleTimeString() },
       ...prev,
     ].slice(0, MAX_HISTORY));
     setIsSaved(true);
     toast.success("已保存到历史内容");
   }

   function handleCopy() {
     navigator.clipboard.writeText(content);
     toast.success("已复制到剪贴板");
   }

   function handleRestore(item: HistoryItem) {
     setContent(item.content);
     setIsSaved(true);
     toast.success("已恢复这段文案，可以继续编辑");
   }

   function handleDeleteHistory(id: string, e: React.MouseEvent) {
     e.stopPropagation();
     setHistory((prev) => prev.filter((h) => h.id !== id));
   }

   /* ── Render ── */
   return (
     <div className="p-6 flex gap-6 max-w-[1400px] mx-auto">
       {/* 左侧主内容区 */}
       <div className="flex-1 space-y-6 min-w-0">
         <h1 className="text-2xl font-bold tracking-tight">内容创作</h1>
         <p className="text-sm text-muted-foreground -mt-4">选择内容类型，AI 自动生成高质量文案</p>

         {/* ── 顶层类型网格 ── */}
         <div className="grid grid-cols-5 gap-3">
           {CONTENT_TYPES.map((t) => (
             <Card
               key={t.id}
               className={
                 "cursor-pointer transition-shadow " +
                 (type.id === t.id ? "ring-2 ring-primary" : "hover:shadow-sm")
               }
               onClick={() => handleTypeChange(t)}
             >
               <CardContent className="p-3 text-center">
                 <div className="text-sm font-medium">{t.label}</div>
                 <div className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</div>
               </CardContent>
             </Card>
           ))}
         </div>

         {/* ── 大众点评子类型选择器 ── */}
         {type.id === "dianping" && (
           <div className="space-y-3">
             <div className="text-xs font-semibold text-muted-foreground">大众点评文案类型</div>
             {DIANPING_SUBTYPES.map((group) => (
               <div key={group.group}>
                 <div className="text-[11px] text-muted-foreground/70 mb-1.5 ml-0.5">{group.group}</div>
                 <div className="flex flex-wrap gap-2">
                   {group.items.map((item) => (
                     <Button
                       key={item.id}
                       variant={subType === item.id ? "default" : "outline"}
                       size="sm"
                       onClick={() => handleSubTypeSelect(item.id)}
                     >
                       {item.label}
                     </Button>
                   ))}
                 </div>
               </div>
             ))}
          </div>
        )}

         {type.id === "xiaohongshu" && (
           <div className="space-y-3">
             <div className="text-xs font-semibold text-muted-foreground">小红书文案类型</div>
             {XIAOHONGSHU_SUBTYPES.map((group) => (
               <div key={group.group}>
                 <div className="text-[11px] text-muted-foreground/70 mb-1.5 ml-0.5">{group.group}</div>
                 <div className="flex flex-wrap gap-2">
                   {group.items.map((item) => (
                     <Button
                       key={item.id}
                       variant={subType === item.id ? "default" : "outline"}
                       size="sm"
                       onClick={() => handleSubTypeSelect(item.id)}
                     >
                       {item.label}
                     </Button>
                   ))}
                 </div>
               </div>
             ))}
           </div>
         )} 
        {type.id === "douyin" && (
          <div className="border-t pt-4 mt-4">
            <div className="text-xs font-semibold text-muted-foreground mb-3">抖音文案类型</div>
            <DouyinSubTypeSelector
              selected={subType}
              onSelect={handleSubTypeSelect}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* ── 控制面板 ── */}
           <Card>
             <CardContent className="p-4 space-y-4">
               {/* 大众点评且未选子类型时提示 */}
               {(type.id === "dianping" || type.id === "xiaohongshu" || type.id === "douyin") && !subType && (
                 <div className="text-sm text-muted-foreground text-center py-6">
                   请先在上方选择一个具体的文案类型
                 </div>
              )}

              {/* 大众点评子类型：FormRenderer */}
              {(type.id === "dianping" || type.id === "xiaohongshu" || type.id === "douyin") && subType && getSubTypeSchema(subType) && (
                <div className="space-y-4">
                  <FormRenderer
                    schema={getSubTypeSchema(subType)!}
                    value={formValues}
                    onChange={(key, val) => setFormValues((prev) => ({ ...prev, [key]: val }))}
                  />
                </div>
              )}

              {/* 隐藏条件：未选子类型时整个控制区隐藏 */}
              {type.id !== "dianping" && (
                 <>
                   {/* 语气 — 根据子类型配置显示 */}
                   {(type.id !== "dianping" || activeSubItem?.tone !== false) && (
                     <div>
                       <label className="text-sm font-medium mb-2 block">语气风格</label>
                       <div className="flex gap-2 flex-wrap">
                         {TONES.map((t) => (
                           <Button key={t} variant={tone === t ? "default" : "outline"} size="sm" onClick={() => setTone(t)}>
                             {t}
                           </Button>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* 长度 — 根据子类型配置显示 */}
                   {(type.id !== "dianping" || activeSubItem?.length !== false) && (
                     <div>
                       <label className="text-sm font-medium mb-2 block">文案长度</label>
                       <div className="flex gap-2 flex-wrap">
                         {LENGTHS.map((l) => (
                           <Button key={l} variant={length === l ? "default" : "outline"} size="sm" onClick={() => setLength(l)}>
                             {l}
                           </Button>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* 参考内容 — 根据子类型配置显示 */}
                   {(type.id !== "dianping" || activeSubItem?.ref !== false) && (
                     <div>
                       <label className="text-sm font-medium mb-2 block">参考内容（选填）</label>
                       {analysisData ? (
                         <div className="rounded-md border bg-muted/30 p-2.5 space-y-1.5">
                           <div className="flex items-start justify-between gap-2">
                             <div className="text-xs font-medium leading-tight">{reference}</div>
                             <button
                               onClick={() => { setReference(""); setAnalysisData(null); }}
                               className="shrink-0 text-muted-foreground hover:text-foreground"
                               aria-label="移除参考"
                             >
                               <X className="h-3.5 w-3.5" />
                             </button>
                           </div>
                           {(analysisData.toneTags?.length || analysisData.writingStyle) && (
                             <div className="flex flex-wrap gap-1">
                               {analysisData.writingStyle && (
                                 <span className="text-[10px] px-1.5 py-0.5 rounded bg-background border text-muted-foreground">
                                   {analysisData.writingStyle}
                                 </span>
                               )}
                               {analysisData.toneTags?.map((tag) => (
                                 <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-background border text-muted-foreground">
                                   {tag}
                                 </span>
                               ))}
                             </div>
                           )}
                           <div className="text-[10px] text-muted-foreground">生成时会参考这条内容的风格和结构</div>
                         </div>
                       ) : (
                         <Input
                           value={reference}
                           onChange={(e) => handleReferenceChange(e.target.value)}
                           placeholder="粘贴参考链接、输入主题，或从右侧热门参考中选择"
                         />
                       )}
                     </div>
                   )}
                 </>
               )}

               {/* 生成按钮 */}
               <Button
                 className="w-full"
                 onClick={handleGenerate}
                 disabled={loading || ((type.id === "dianping" || type.id === "xiaohongshu" || type.id === "douyin") && !subType)}
               >
                 {loading ? (
                   <>
                     <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                     正在生成…
                   </>
                 ) : (
                   <>
                     <Sparkles className="h-4 w-4 mr-1.5" />
                     {(type.id === "dianping" || type.id === "xiaohongshu" || type.id === "douyin") && !subType ? "请先选择文案类型" : "生成文案"}
                   </>
                 )}
               </Button>

               {/* 底部提示 */}
               <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
                 {type.id === "dianping" && subType
                   ? SUBTYPE_TIPS[subType] || "生成大众点评专属文案，模板引擎自动匹配最佳角度"
                   : type.id === "dianping"
                   ? "请先选择具体文案类型，获得更精准的生成结果"
                   : type.id === "xiaohongshu"
                ? XIAOHONGSHU_TIPS[subType] || "生成种草笔记，模拟真实食客口吻"
                : type.id === "douyin"
                ? DOUYIN_TIPS[subType] || "生成抖音短视频文案"
                   : type.id === "promotion"
                   ? "生成节日/新客/老客活动方案"
                   : type.id === "reply"
                   ? "根据评价内容生成有温度的回复"
                   : "生成抖音短视频口播脚本，含钩子+内容+引导"}
               </div>
             </CardContent>
           </Card>

           {/* ── 生成结果 ── */}
           <Card>
             <CardContent className="p-4 space-y-3">
               <div className="flex items-center justify-between">
                 <h3 className="text-sm font-semibold">生成结果</h3>
                 <div className="flex items-center gap-1">
                   {content && (
                     <>
                       <span className="text-[10px] text-muted-foreground mr-1">{content.length} 字</span>
                       <Button size="sm" variant="outline" onClick={handleSave} disabled={isSaved}>
                         <Bookmark className="h-3.5 w-3.5 mr-1" />
                         {isSaved ? "已保存" : "保存"}
                       </Button>
                       <Button size="sm" variant="outline" onClick={handleCopy}>
                         <Copy className="h-3.5 w-3.5 mr-1" />
                         复制
                       </Button>
                       <Button size="sm" variant="outline" onClick={() => { setContent(""); setIsSaved(false); }}>
                         清空
                       </Button>
                     </>
                   )}
                 </div>
               </div>
               <textarea
                 className="w-full min-h-[300px] rounded-md border border-input bg-background p-3 text-sm resize-y leading-relaxed disabled:opacity-70"
                 value={content}
                 onChange={(e) => { setContent(e.target.value); setIsSaved(false); }}
                 disabled={loading}
                 placeholder="点击「生成文案」开始创作，生成后也可以直接在这里修改"
               />
             </CardContent>
           </Card>
         </div>

         {/* ── 历史内容 ── */}
         {history.length > 0 && (
           <Card>
             <CardContent className="p-4">
               <h3 className="text-sm font-semibold mb-3">历史内容 ({history.length})</h3>
               <div className="space-y-2">
                 {history.map((item) => (
                   <div
                     key={item.id}
                     onClick={() => handleRestore(item)}
                     className="flex items-center justify-between p-2.5 bg-muted/20 hover:bg-muted/40 rounded-lg text-sm cursor-pointer group transition-colors"
                   >
                     <div className="flex items-center gap-3 min-w-0">
                       <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
                         {item.type}
                       </span>
                       <span className="text-muted-foreground truncate">{item.content.slice(0, 30)}...</span>
                     </div>
                     <div className="flex items-center gap-2 shrink-0">
                       <span className="text-[10px] text-muted-foreground">{item.time}</span>
                       <RotateCcw className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                       <button
                         onClick={(e) => handleDeleteHistory(item.id, e)}
                         className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                         aria-label="删除这条历史"
                       >
                         <Trash2 className="h-3 w-3" />
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         )}
       </div>

      </div>
   );
 }


 /* ── 小红书子类型 ── */
 const DOUYIN_SUBTYPES: DianpingSubGroup[] = [
  { group: "账号基础类", items: [{ id: "douyin_nickname", label: "账号昵称", tone: true, length: false, ref: false }, { id: "douyin_bio", label: "简介Bio", tone: true, length: false, ref: true }] },
  { group: "短视频内容类", items: [{ id: "douyin_title", label: "视频标题", tone: true, length: false, ref: true }, { id: "douyin_description", label: "视频描述（核心）", tone: true, length: true, ref: true }, { id: "douyin_subtitle", label: "字幕/贴纸文案", tone: false, length: false, ref: false }] },
  { group: "直播类", items: [{ id: "douyin_live_opener", label: "开场白", tone: true, length: false, ref: false }, { id: "douyin_live_product", label: "产品讲解脚本", tone: true, length: false, ref: false }, { id: "douyin_live_cta", label: "催单/互动话术", tone: true, length: false, ref: false }, { id: "douyin_live_closer", label: "结束语", tone: true, length: false, ref: false }] },
  { group: "营销转化类", items: [{ id: "douyin_promotion", label: "团购/商品卡文案", tone: true, length: false, ref: false }, { id: "douyin_poi", label: "POI位置描述", tone: true, length: false, ref: false }, { id: "douyin_ad", label: "投放素材文案", tone: true, length: false, ref: true }, { id: "douyin_hashtag", label: "话题标签组合", tone: false, length: false, ref: false }] },
  { group: "社区运营类", items: [{ id: "douyin_reply", label: "评论回复模板", tone: true, length: false, ref: true }] },
];

const XIAOHONGSHU_SUBTYPES: DianpingSubGroup[] = [
   {
     group: "账号基础类",
     items: [
       { id: "xiaohongshu_bio", label: "账号简介Bio", tone: true, length: false, ref: true },
       { id: "xiaohongshu_slogan", label: "品牌标语/标签语", tone: true, length: false, ref: false },
     ],
   },
   {
     group: "内容创作类",
     items: [
       { id: "xiaohongshu_title", label: "笔记标题", tone: true, length: false, ref: true },
       { id: "xiaohongshu_note", label: "种草笔记（正文）", tone: true, length: true, ref: true },
     ],
   },
   {
     group: "营销转化类",
     items: [
       { id: "xiaohongshu_cover", label: "封面文案", tone: true, length: false, ref: true },
       { id: "xiaohongshu_promotion", label: "促销/团购文案", tone: true, length: true, ref: true },
       { id: "xiaohongshu_tags", label: "话题标签组合", tone: false, length: false, ref: false },
       { id: "xiaohongshu_kol", label: "KOL合作文案", tone: true, length: true, ref: true },
     ],
   },
   {
     group: "社区运营类",
     items: [
       { id: "xiaohongshu_reply", label: "评论回复模板", tone: true, length: false, ref: true },
       { id: "xiaohongshu_ugc", label: "用户引导/UGC激励", tone: true, length: false, ref: true },
     ],
   },
 ];


