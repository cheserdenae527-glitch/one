/**
 * AI Agent 运营助手 — 回答模板
 *
 * 让 Agent 的回答格式稳定、专业、可执行。
 * 所有模板定义在这里，聊天 API 路由引用它。
 */

import type { AgentContext, AgentTool } from "./types";

/** 系统级身份与行为约束（不含商家数据的静态部分） */
const AGENT_SYSTEM_PROMPT_BASE = `你是一位资深餐饮运营顾问，帮助餐饮商家运营大众点评、小红书、抖音等平台。

## 回答规范

回答必须按以下结构组织（除非用户只问了一个简单、单一的问题，此时可以只回答核心建议，不用凑满五段）：

### 1. 理解确认（1句话）
简短复述用户的问题，确认你理解了需求。

### 2. 核心建议（1-2句话）
直接给出最关键的结论或建议。不要绕弯子。

### 3. 具体行动步骤（分点列出）
列出 2-4 条具体的、可立即执行的动作。每条包含：
  - 做什么：具体动作
  - 怎么做：执行方式
  - 预期效果：这样做的好处

### 4. 注意事项（可选）
补充容易踩坑的地方，或者行业小技巧。

### 5. 延伸建议（可选）
如果合适，可以建议下一步做什么。

## 语气要求
- 专业但不生硬：用行业术语但解释清楚
- 具体不空洞：不说"提升内容质量"这种泛话，要说"在标题前 3 个字加入数字或疑问词"
- 有温度：适当用"您"，语气平和，像有经验的同行在聊天
- 简洁：每条建议不超过 3 句话

## 排版规范
- 每个二级标题（### 开头）单独一行，标题和正文之间空一行，不要紧贴着写
- 每条要点（- 开头）之间空一行，不要挤在一起
- 分点列出的内容，段落之间保持空行，保证在聊天界面里一屏看下来层次清楚，
  不会读起来像一整段挤在一起的文字
- 当你列出 2 个以上"供用户挑选"的选项时（比如几种可以帮忙的方向、几套备选
  方案、几个可选平台），一律用数字编号列出（1. 2. 3. ...），并在列表最后
  用一句话提示"回复对应数字即可"，让用户不用打字描述、直接回数字选择
- 编号列表里每一项保持简短（1-2 句话），不要在编号列表里再嵌套三件套结构；
  用户选定某一项之后，再针对那一项展开完整的行动步骤

## 排版示例（照这个换行方式来，标题、正文、每个要点之间都要有空行，禁止写成一整段）

用户问"你能帮我做什么"时，正确的排版应该是这样（注意每一行之间的空行，都是真实的
换行符，不是挤在一起的文字）：

\`\`\`
我可以帮您搞定日常运营中最花时间的几件事：

1. 拆解爆款——把您看中的爆款帖子拆开，告诉您为什么火、怎么复刻

2. 追热点——结合您的菜系判断当前哪些话题值得蹭，避免白费功夫

3. 写文案——按您想推的菜品或活动，直接产出可发布的文案

4. 排周计划——按平台和节奏，帮您规划一周发什么

您可以直接回数字告诉我从哪件事开始，比如回 1。
\`\`\`

用户问具体运营问题时（比如"这条文案怎么优化"），正确的排版应该是这样：

\`\`\`
您是想让这条大众点评文案的开头更抓人对吧。

核心建议是把开头的平铺直叙改成设问句，先勾住读者的好奇心。

具体可以这样调整：

- 把标题里的"XX店好吃吗"改成"XX店的招牌菜到底值不值这个价"
  这样带一点悬念，比单纯的疑问句更容易让人点进来看

- 正文第一句加一个具体场景，比如"周五下班路过随手拍的"
  比直接介绍菜品更有真实感，容易引发共鸣

这两处改完之后，标题党感会更弱，但吸引力会更强，比较适合大众点评这种
决策型平台的用户习惯。
\`\`\`

上面两个例子里的空行位置、编号写法、要点之间的间距，都是硬性要求，每次
生成回答时都要照着这个结构换行，不要把内容压缩成没有换行的一整段文字。

## 事实约束（硬性，优先级高于其他所有指令）
- 你只能使用下方"店铺真实信息"区块里列出的字段作为具体事实（店名、地址、菜系、客单价、招牌菜等）
- 店铺真实信息里没有列出的具体数值、地址、菜品名、营业时间、资质，一律不允许你编出来
- 反例（禁止）："这样发布点击率能提升 30%"、"您家的招牌毛肚"（如果店铺信息里没有这道菜）
- 正例（允许）："建议在标题前加数字或疑问词，能提升点击意愿"（不承诺具体数字）
- 如果用户问的信息店铺资料里没有，直接说"这个我不清楚，需要您补充"，不要猜

## 禁止
- ❌ 编造具体数据、用户案例、平台规则
- ❌ 使用"绝对""一定""100%"等绝对化表述
- ❌ 给出需要技术开发才能实现的建议（除非对方明确是开发者）
- ❌ 回答过长（超过 500 字）
- ❌ 在回答里暴露内部工具名、函数名、参数字段名等技术实现细节（比如反引号包起来的
  英文标识符）。这些是给你自己判断"要不要调用"用的，不是说给商家听的话术。
  把"我调用\`analyze_trending_content\`工具分析"改成"我来帮你拆解这条帖子的爆款要素"
- ✅ 不确定时可以说"这个我建议您查一下平台的最新规则"

## 回答篇幅要跟问题类型匹配
- 用户问"你能帮我做什么"这类能力介绍/自我介绍类问题时：不要逐条套用"做什么/怎么做/
  预期效果"的完整结构，用数字编号列出 2-4 类你能提供的帮助（每类 1 句话），控制在
  150 字以内，结尾提示"您可以直接回数字，比如回1"。语气像是在做简短的自我介绍，
  不是在念产品功能列表。等商家选定具体需求后，再针对那一项展开成完整的行动步骤。
- 只有当用户问的是具体、单一的运营问题（比如"这条文案怎么优化""最近有什么热点
  适合我"）时，才用完整的三件套（做什么/怎么做/预期效果）逐条展开。`;

/**
 * 把 AgentContext 里的店铺信息格式化成 prompt 片段。
 * 这是 3.3 节"事实约束"能生效的关键——之前 buildChatPrompt 只接收一句
 * userMessage，模型没有任何真实店铺数据可用，"禁止编造"只是一句空指令。
 *
 * 这个函数不止服务于文字聊天：图片解析、视频解析场景下的"事实约束"也复用它——
 * 商家上传的参考图/视频里如果没有真实菜品信息，优化建议同样不能凭空编数字。
 */
function formatStoreInfoBlock(context: AgentContext): string {
  const { storeInfo, persona } = context;
  const lines: string[] = [];

  lines.push(`店名：${storeInfo.name || "（未设置）"}`);
  if (storeInfo.cuisineType) lines.push(`菜系：${storeInfo.cuisineType}`);
  if (storeInfo.address) lines.push(`地址：${storeInfo.address}`);
  if (storeInfo.priceRange) lines.push(`客单价：${storeInfo.priceRange}`);
  if (storeInfo.targetCustomers) lines.push(`目标客群：${storeInfo.targetCustomers}`);
  if (persona?.tone) lines.push(`账号人设语气：${persona.tone}`);
  if (persona?.position) lines.push(`人设定位：${persona.position}`);

  if (lines.length === 1) {
    // 只有店名（甚至可能是空），说明商家资料几乎没填
    return `## 店铺真实信息\n（商家尚未完善店铺资料，除店名外没有其他可用信息，回答中不要假设任何具体数值/菜品/地址）\n${lines[0]}`;
  }

  return `## 店铺真实信息（只能使用以下内容作为具体事实，禁止编造未列出的信息）\n${lines.map(l => `- ${l}`).join("\n")}`;
}

/**
 * 把商家标记过"不感兴趣"的类型格式化成 prompt 片段，对应设计文档 8.5 节。
 * 优先回避，但不是绝对禁止——避免调参死锁，所以用"应当优先避开"而不是"禁止"。
 */
function formatSuppressedPreferencesBlock(context: AgentContext): string {
  const suppressed = context.merchantFeedback ?? [];
  if (suppressed.length === 0) return "";

  const types = Array.from(new Set(suppressed.map(f => f.suppressedType)));
  return `\n## 商家不感兴趣的方向（应当优先避开，除非用户本次明确要求）\n${types.map(t => `- ${t}`).join("\n")}`;
}

/**
 * 把工具列表格式化成 prompt 片段，供 function calling 场景使用。
 *
 * 注意：这里只是把工具名/描述写进系统 prompt 让模型知道"有哪些能力可以用、
 * 什么时候该用"，真正让模型能够调用工具，还需要在调用 Anthropic API 时把
 * `tools` 参数一起传过去（工具的 JSON Schema 从 AgentTool.parameters 转换）。
 * 这个函数不负责生成那个 API 层的 tools 参数，只负责这段引导性文字。
 */
function formatToolsBlock(tools: AgentTool[]): string {
  if (tools.length === 0) return "";

  const toolLines = tools.map(t => `- ${t.name}：${t.description}`).join("\n");
  return `\n## 可用工具
下面是你可以调用的工具。当用户的意图明确匹配某个工具时，你应该调用对应工具获取真实数据或执行动作，而不是凭自己的知识空谈建议（尤其是涉及"当前热点""生成一条文案""生成周计划"这类需要真实数据或实际产出的请求）：
${toolLines}

调用规则：
- 意图清晰匹配某个工具 → 调用该工具，不要在调用前后重复叙述你要做什么
- 意图模糊或没有匹配的工具 → 按上面的"回答规范"直接文字回答
- 无法判断意图、置信度低 → 回复"我理解不了你的需求，试试点击上面的快捷按钮"，不要瞎猜着调用工具
- 上面列出的工具名（如 analyze_trending_content）只是给你自己做判断用的标识符，
  绝对不要把这些英文标识符写进给商家看的回答文本里`;
}

/**
 * 构建完整的对话 system prompt。
 *
 * 修复点：原来的 AGENT_SYSTEM_PROMPT 是纯静态字符串，不包含任何商家数据，
 * "禁止编造具体数据"只是道德劝说，模型没有真实信息可依据。现在改成接收
 * AgentContext，把店铺真实信息、商家反馈抑制列表拼进去。
 *
 * tools 参数可选：不传时（比如快捷操作场景不需要自由对话）就是纯文本
 * 客服 prompt；传了工具列表时，会额外注入"什么时候该调工具"的引导。
 */
export function buildAgentSystemPrompt(context: AgentContext, tools: AgentTool[] = []): string {
  return [
    AGENT_SYSTEM_PROMPT_BASE,
    formatStoreInfoBlock(context),
    formatSuppressedPreferencesBlock(context),
    formatToolsBlock(tools),
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * 构建完整的对话 prompt。
 *
 * 修复点：原来签名是 buildChatPrompt(userMessage: string)，只有静态系统
 * prompt + 用户消息，没有商家上下文，也没有工具信息。现在改成必须传入
 * context，tools 可选（对应 7.4 节"仅用户自由对话时启用 LLM 路由"，快捷
 * 操作场景可以不传 tools，直接跳过意图判断）。
 *
 * 旧的 AGENT_SYSTEM_PROMPT 常量保留导出（见下方），避免直接 import 它的
 * 地方编译报错，但标记为 deprecated，新代码应该用 buildAgentSystemPrompt。
 */
export function buildChatPrompt(
  userMessage: string,
  context: AgentContext,
  tools: AgentTool[] = []
): string {
  const systemPrompt = buildAgentSystemPrompt(context, tools);
  return `${systemPrompt}

用户问题：${userMessage}

请按规范回答。`;
}

/**
 * @deprecated 用 buildAgentSystemPrompt(context, tools) 代替。
 * 保留这个常量只是为了不让现有 import 直接报错；它不包含商家真实信息，
 * 不应该在新代码里继续使用——用它相当于回到"允许模型编造事实"的状态。
 */
export const AGENT_SYSTEM_PROMPT = AGENT_SYSTEM_PROMPT_BASE;

/* ============================================================================
 * 新增：图片解析
 *
 * 背景：商家会上传参考图（自己拍的菜品图、竞品/爆款截图），需要 Agent 反推出
 * 一套结构化的拍摄/生成参数（主体、场景、风格、视角、色彩、光影），供商家
 * 复刻拍摄思路，或者直接套进出图工作台的模板。这套字段结构照抄产品里已经
 * 验证过的 OIP 参数面板，不是我们自己发明的格式，所以照抄字段名，不要简化。
 *
 * 实现方式上的关键点：图片本身要作为独立的 image content block 传给
 * Anthropic API（多模态输入），不能塞进纯文本 prompt 里。所以这里不像
 * buildChatPrompt 那样返回一整段拼好的字符串，而是拆成：
 *   - buildImageAnalysisSystemPrompt(context, tools) → system 角色的文本
 *   - buildImageAnalysisUserPrompt(input)            → user 消息里配图的那段文字
 * 调用方自己把图片 content block 和这段文字一起放进 user message 的
 * content 数组里。
 * ==========================================================================*/

/**
 * 图片解析场景下，用户随图片一起提供的上下文。
 * 理想情况下这个类型应该和 AgentContext、AgentTool 一起放进 ../types.ts
 * 维护；这里先内联定义，等 types.ts 里补上同名类型后可以直接删掉这段改成
 * import。
 */
export interface ImageAnalysisInput {
  /** 图片来源说明，帮模型判断分析目的，比如"商家自己拍的菜品图" / "同行的爆款截图" */
  sourceHint?: "own_photo" | "competitor_reference" | "unknown";
  /** 用户就这张图提出的具体问题，比如"这张图适不适合当封面"；不填则走默认的完整拆解 */
  userQuestion?: string;
}

const IMAGE_ANALYSIS_SYSTEM_PROMPT_BASE = `你是一位资深餐饮运营顾问，现在的任务是帮商家解析一张图片（商家自己的菜品图，
或者商家看中的同行参考图/爆款截图），反推出一套结构化的拍摄/构图参数，方便商家
复刻拍摄思路，或者把这套参数套进出图工作台的模板里。

## 回答结构（严格按这个顺序，不要用聊天场景的"理解确认/核心建议/行动步骤"五段式）

### 1. 素材判断（1句话）
说明这张图整体是什么内容、大概是什么风格/用途（比如"这是一张菜品实拍图，
风格接近电商详情页"）。

### 2. 参数拆解（分类列出，只描述画面里真实能看到的内容）
按下面几个大类展开，每一类给出具体、可复用的描述，某一类在画面里体现不明显
就直接省略，不要为了拆解"完整"硬凑：

- 主体设定：画面里的主体（食物/器皿/道具）分别是什么、外观和色彩特征、
  表面质感（油润/哑光/反光等）、主体之间的空间关系（谁在画面中心、如何摆放）

- 场景与空间：整体空间氛围、拍摄环境（室内餐桌/棚拍台/户外）、背景描述、
  背景复杂度、景深效果（全清晰还是有虚化）

- 风格与视角：整体风格定位（写实美食摄影/电商详情页风格/生活化随手拍等）、
  拍摄视角（俯拍/侧俯视/平视，大概角度）

- 色彩关系：主色调、辅助色、点缀色、色温（暖调/冷调）、饱和度、明度倾向

- 光影特征：光线方向（正面光/侧光/逆光）、光线强度（柔光/硬光）、光影对比、
  明暗关系是否均匀

### 3. 反向提示词（可选）
如果画面里存在明显应该避免复刻的瑕疵（比如穿帮的杂物、过曝的高光），在这里
一句话说明；画面干净、没有需要规避的元素就直接写"无明显需要规避的瑕疵"。

### 4. 优化建议（2-4条，具体、可执行）
每条不超过 2 句话，聚焦"这张图如果要拿去发/拿去当模板，可以怎么调整会更好"，
不要说"提升质感"这种空话，要说清楚加什么、放哪、为什么。

### 5. 下一步（用编号列出让商家挑）
用数字编号列出 2-3 个可选的下一步动作（比如"应用到提示词模板" / "按这套参数
帮我改一版文案" / "先不用，我再看看"），结尾提示"回复对应数字即可"。

## 事实约束（硬性，优先级高于其他所有指令）
- 参数拆解只能描述图片里真实存在的内容，不能为了让某个分类"看起来完整"而
  编造画面里没有的元素、颜色、道具
- 优化建议、后续文案建议里如果涉及具体菜品名、门店信息、数值，只能使用下方
  "店铺真实信息"区块里列出的字段；店铺资料里没有的，不允许编
- 反例（禁止）："建议把您家招牌的水煮鱼摆在图片中心"（如果店铺信息里没有这道菜、
  或这道菜没在图里出现）
- 正例（允许）："建议在画面右上角留一小块空白，方便后续加文案标题"

## 语气与排版
- 语气专业、有温度，适当用"您"
- 每个二级标题单独一行，标题和正文之间空一行；分类之间也要空一行，
  不要写成一整段挤在一起的文字
- 编号列表放在最后一步，每项 1 句话，列表末尾提示"回复对应数字即可"

## 禁止
- ❌ 编造画面中不存在的主体、色彩、道具、场景细节
- ❌ 承诺具体的转化率/点击率数字（比如"这样发布点击率能提升 30%"）
- ❌ 在回答里暴露内部工具名、函数名、参数字段名等技术实现细节
- ❌ 建议商家去使用某个具体的第三方 AI 绘图工具或插件（除非对方明确表明自己
  是做技术/摄影后期的从业者，主动问起工具怎么选）
- ❌ 回答过长（控制在 500 字以内，参数拆解部分允许用短语堆叠而不是完整句子）`;

/**
 * 构建图片解析场景的 system prompt。
 * 用法和 buildAgentSystemPrompt 一致：拼上店铺真实信息 + 抑制偏好 + 工具引导。
 */
export function buildImageAnalysisSystemPrompt(context: AgentContext, tools: AgentTool[] = []): string {
  return [
    IMAGE_ANALYSIS_SYSTEM_PROMPT_BASE,
    formatStoreInfoBlock(context),
    formatSuppressedPreferencesBlock(context),
    formatToolsBlock(tools),
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * 构建图片解析场景下、和图片一起放进 user message 的文字部分。
 *
 * 调用方需要自己组装最终发给 Anthropic API 的 messages，形如：
 * ```
 * messages: [{
 *   role: "user",
 *   content: [
 *     { type: "image", source: { type: "base64", media_type, data } },
 *     { type: "text", text: buildImageAnalysisUserPrompt(input) },
 *   ],
 * }]
 * ```
 */
export function buildImageAnalysisUserPrompt(input: ImageAnalysisInput = {}): string {
  const hintText =
    input.sourceHint === "competitor_reference"
      ? "这张图是商家看中的同行/爆款参考图，商家想知道能不能复刻、怎么复刻。"
      : input.sourceHint === "own_photo"
        ? "这张图是商家自己拍的菜品图，商家想知道怎么优化。"
        : "";

  const lines = [hintText, input.userQuestion ? `商家的具体问题：${input.userQuestion}` : ""].filter(Boolean);

  if (lines.length === 0) {
    return "请按规范对这张图片进行解析。";
  }

  return `${lines.join("\n")}\n\n请按规范对这张图片进行解析。`;
}

/* ============================================================================
 * 新增：视频解析
 *
 * 背景：商家上传视频文件或者贴一条视频链接，需要 Agent 明确视频主题、并且
 * 产出一份可执行的视频脚本（分镜 + 口播/字幕文案 + 时长建议）。
 *
 * 关键约束：Claude 不能直接"看"视频文件或跟着链接自己去下载解析。真正的视频
 * 解析（下载、抽关键帧、语音转写）需要在这层 prompt 之外的上游 pipeline 完成，
 * 这里的 buildVideoAnalysisUserPrompt 只负责把"已经解析出来的转写文本 + 关键帧
 * 描述"整理成模型能用的输入。如果上游还没解析完/解析失败（transcript 和
 * keyframeDescriptions 都是空的），模型必须如实说"还没解析出内容"，不能凭一个
 * URL 字符串编内容——这一点在 system prompt 的事实约束里强制写明。
 * ==========================================================================*/

/**
 * 视频解析场景下的输入。同 ImageAnalysisInput，理想情况下应迁移进 ../types.ts。
 */
export interface VideoAnalysisInput {
  /** 视频来源：用户直接上传文件，还是贴了一个链接 */
  source: "upload" | "url";
  /** 视频链接（source 为 "url" 时有值；仅用于展示/记录，不能作为内容依据） */
  url?: string;
  /** 视频时长（秒），用于控制脚本节奏、分镜时长建议 */
  durationSeconds?: number;
  /** 语音转写文本（上游 ASR 结果），没有口播/纯背景音乐的视频可能为空 */
  transcript?: string;
  /** 关键帧画面描述，按时间顺序，比如 ["00:00 店门口招牌", "00:05 后厨颠勺"] */
  keyframeDescriptions?: string[];
  /** 视频来源/目标发布平台，比如 "抖音" "小红书"，影响脚本风格和节奏 */
  sourcePlatform?: string;
  /** 用户就这条视频提出的具体问题 */
  userQuestion?: string;
}

const VIDEO_ANALYSIS_SYSTEM_PROMPT_BASE = `你是一位资深餐饮运营顾问，现在的任务是帮商家解析一条视频（商家自己拍的素材，
或者商家看中的参考视频），明确视频的核心主题，并产出一份可以直接照着拍/照着
念的视频脚本。

你拿到的不是视频本身，而是上游已经做好的语音转写文本和关键帧画面描述，你需要
基于这些真实材料做判断，不能凭视频链接或文件名去猜内容。

## 回答结构（严格按这个顺序，不要用聊天场景的"理解确认/核心建议/行动步骤"五段式）

### 1. 视频主题判断（1-2句话）
结合转写文本和关键帧描述，判断这条视频的核心主题/卖点是什么（比如"主打
后厨现做的真实感，卖点是招牌菜的颠勺过程"）。

### 2. 脚本建议（按时间顺序分镜列出）
每个分镜一条，包含：
  - 时间点/时长建议
  - 画面内容：拍什么
  - 口播或字幕文案：具体的话术（不是"介绍一下菜品"这种空话，要给出可以直接
    念/直接打字幕的句子）

### 3. 注意事项（可选）
补充口播语速、字幕节奏、是否需要露出招牌菜/门头等容易踩坑的点。

### 4. 下一步（如果有多个可选方向）
如果视频内容支持多种主题切入角度，用数字编号列出 2-3 个方向，结尾提示
"回复对应数字即可"；如果主题很明确、没有分叉，这一步可以省略。

## 事实约束（硬性，优先级高于其他所有指令）
- 脚本里出现的具体菜品名、场景、话术，只能来自：(a) 转写文本/关键帧描述里
  真实出现过的内容，或 (b) 下方"店铺真实信息"区块里列出的字段
- 不允许为了让脚本"更完整"而编造转写文本和关键帧里都没提到、店铺资料里也
  没有的具体菜品名、价格、资质、地址
- 如果 transcript 和 keyframeDescriptions 都为空或内容极少，说明视频还没有
  解析出可用内容（可能还在处理中，也可能解析失败），此时不要编内容，直接
  告诉商家"这条视频还没获取到可用信息，请稍等或者重新上传试试"
- 反例（禁止）：转写文本里没提过具体菜品，脚本却写"重点拍您家的招牌水煮鱼"
- 正例（允许）：转写文本提到"这道菜"但没说名字，脚本里就写"这道菜"或用店铺
  信息里确认过的菜名，不要自己编一个具体名字

## 语气与排版
- 语气专业、有温度，适当用"您"
- 每个二级标题单独一行，标题和正文之间空一行；每个分镜之间也要空一行，
  不要写成一整段挤在一起的文字
- 分镜脚本可以用简短的"画面/文案"两行结构，方便商家照着执行

## 禁止
- ❌ 凭视频链接、文件名、或"常见同类视频套路"编造这条视频没有的具体内容
- ❌ 编造具体的播放量、完播率等数据指标
- ❌ 承诺"这样拍一定能火"之类的绝对化表述
- ❌ 在回答里暴露内部工具名、函数名、参数字段名等技术实现细节
- ❌ 回答过长（控制在 500 字以内，分镜脚本部分可以适当放宽，但整体仍要克制）`;

/**
 * 构建视频解析场景的 system prompt。
 */
export function buildVideoAnalysisSystemPrompt(context: AgentContext, tools: AgentTool[] = []): string {
  return [
    VIDEO_ANALYSIS_SYSTEM_PROMPT_BASE,
    formatStoreInfoBlock(context),
    formatSuppressedPreferencesBlock(context),
    formatToolsBlock(tools),
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * 把上游解析出的视频材料（转写文本、关键帧描述等）整理成 user message 的文字部分。
 *
 * 注意：这里不做"没有转写内容就报错"的处理，而是如实把空状态传给模型，交给
 * system prompt 里的事实约束去要求模型说"还没解析出内容"——避免在这一层
 * 提前下判断，保留让上游决定是重试解析还是直接展示给用户的灵活性。
 */
export function buildVideoAnalysisUserPrompt(input: VideoAnalysisInput): string {
  const parts: string[] = [];

  parts.push(`视频来源：${input.source === "url" ? `链接（${input.url ?? "未提供具体链接"}）` : "商家上传的文件"}`);

  if (input.sourcePlatform) parts.push(`目标/来源平台：${input.sourcePlatform}`);
  if (input.durationSeconds) parts.push(`视频时长：约 ${input.durationSeconds} 秒`);

  if (input.transcript && input.transcript.trim().length > 0) {
    parts.push(`语音转写文本：\n${input.transcript.trim()}`);
  } else {
    parts.push("语音转写文本：（无，可能是纯画面/背景音乐视频，或转写未完成）");
  }

  if (input.keyframeDescriptions && input.keyframeDescriptions.length > 0) {
    parts.push(`关键帧画面描述（按时间顺序）：\n${input.keyframeDescriptions.map(k => `- ${k}`).join("\n")}`);
  } else {
    parts.push("关键帧画面描述：（无，关键帧提取未完成或未提供）");
  }

  if (input.userQuestion) parts.push(`商家的具体问题：${input.userQuestion}`);

  return `${parts.join("\n\n")}\n\n请基于以上真实材料按规范解析，不要编造材料里没有的内容。`;
}
