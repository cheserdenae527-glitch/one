/**
 * AI Agent 运营助手 — 回答模板
 *
 * 让 Agent 的回答格式稳定、专业、可执行。
 * 所有模板定义在这里，聊天 API 路由引用它。
 */

import type { AgentContext, AgentTool } from "../types";

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
- ✅ 不确定时可以说"这个我建议您查一下平台的最新规则"`;

/**
 * 把 AgentContext 里的店铺信息格式化成 prompt 片段。
 * 这是 3.3 节"事实约束"能生效的关键——之前 buildChatPrompt 只接收一句
 * userMessage，模型没有任何真实店铺数据可用，"禁止编造"只是一句空指令。
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

  const types = [...new Set(suppressed.map(f => f.suppressedType))];
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
- 无法判断意图、置信度低 → 回复"我理解不了你的需求，试试点击上面的快捷按钮"，不要瞎猜着调用工具`;
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
