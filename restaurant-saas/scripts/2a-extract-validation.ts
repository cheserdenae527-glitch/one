/**
 * 2a 阶段验证脚本
 *
 * 目的：用 5-10 条人工标注的真实热榜内容，手动跑一遍 LLM 提取，
 *       验证输出是否稳定落入 8.1 的 schema 字段。
 *
 * 明确不做的事：
 *  - 不写数据库（避免脏数据混进 content_templates，2a 只看 prompt 质量）
 *  - 不做批量/去重/权重归一化（那是 2b 的事）
 *  - 不接定时任务
 *
 * 用法：
 *  1. 把 5-10 条真实热榜内容填进 ./sample-hot-content.example.json
 *     （按 SampleContent 类型格式填写，保留原始口语化和 emoji）
 *  2. 设置环境变量 OPENAI_API_KEY
 *  3. cd restaurant-saas && npx tsx scripts/2a-extract-validation.ts
 *  4. 人工核对终端输出的每条结果：cuisines/structure/hook 是否都有值，
 *     extracted_at 是否被正确写入，JSON 是否可解析（不需要清洗）
 */

import { readFileSync } from "node:fs";

// ---- 输入数据结构：对应你人工标注的真实热榜内容 ----
interface SampleContent {
  id: string;
  platform: "大众点评" | "小红书" | "抖音";
  title: string;
  body: string;
  likes: number;
  cuisine_hint?: string; // 人工标注时可选填，帮助你事后核对 LLM 判断是否准确
}

// ---- 输出结构：对齐 8.1 schema，新增 extracted_at ----
interface ExtractedTemplate {
  id: string;
  type: "angle";
  name: string;
  desc: string;
  hook: string;
  tone: string[];
  structure: string[];
  cuisines: string[];
  platforms: string[];
  weight: number;
  used: number;
  source: string;
  extracted_at: string; // ISO 8601, UTC
}

const EXTRACTION_PROMPT = `你是一个内容结构分析助手。给你一条餐饮类社交媒体热门内容，请提取其切入角度和结构特征，只返回 JSON，不要任何其他文字或代码块标记。

输出字段说明：
- type: 固定为 "angle"
- name: 4-8字的角度名称，例如"横评对比"
- desc: 一句话描述这个角度的核心逻辑
- hook: 钩子类型，例如"问题式"、"悬念式"、"数据式"
- tone: 语气标签数组，例如["专业评测", "本地人视角"]
- structure: 内容结构步骤数组，例如["钩子", "逐店对比", "总结推荐"]
- cuisines: 适用菜系数组，从内容本身判断，无法判断则给空数组
- platforms: 适用平台数组

不要编造字段之外的内容，无法判断的字段给合理的空值（空数组或空字符串），不要跳过字段。

内容如下：
标题：{{title}}
正文：{{body}}
平台：{{platform}}
点赞数：{{likes}}`;

async function extractOne(content: SampleContent): Promise<ExtractedTemplate | { error: string; raw: string }> {
  const prompt = EXTRACTION_PROMPT
    .replace("{{title}}", content.title)
    .replace("{{body}}", content.body)
    .replace("{{platform}}", content.platform)
    .replace("{{likes}}", String(content.likes));

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: "OPENAI_API_KEY 未设置，请在运行前 export OPENAI_API_KEY=sk-...", raw: "" };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3, // 提取任务要稳定，不需要创造性
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "（无法读取错误体）");
    return {
      error: `API 返回 ${response.status}: ${errorBody}`,
      raw: "",
    };
  }

  const data = await response.json();
  const rawText: string = data.choices?.[0]?.message?.content ?? "";

  try {
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const extracted: ExtractedTemplate = {
      id: `tpl_2a_${content.id}`,
      type: "angle",
      name: parsed.name ?? "",
      desc: parsed.desc ?? "",
      hook: parsed.hook ?? "",
      tone: parsed.tone ?? [],
      structure: parsed.structure ?? [],
      cuisines: parsed.cuisines ?? [],
      platforms: parsed.platforms ?? [],
      weight: 0, // 2a 阶段不计算权重，留空值供后续 2b 处理
      used: 0,
      source: `2a验证_${content.platform}`,
      extracted_at: new Date().toISOString(),
    };
    return extracted;
  } catch (e) {
    // 解析失败本身就是重要信号——说明 prompt 没有稳定产出可解析 JSON
    return { error: String(e), raw: rawText };
  }
}

// ---- 字段完整性核查：不阻断输出，只是标出可能有问题的字段 ----
function checkCompleteness(t: ExtractedTemplate): string[] {
  const warnings: string[] = [];
  if (!t.name) warnings.push("name 为空");
  if (!t.hook) warnings.push("hook 为空");
  if (t.structure.length === 0) warnings.push("structure 为空数组");
  if (t.cuisines.length === 0) warnings.push("cuisines 为空数组（可能是合理的通用模板，也可能是LLM漏判）");
  if (t.platforms.length === 0) warnings.push("platforms 为空数组");
  return warnings;
}

async function main() {
  const samples: SampleContent[] = JSON.parse(
    readFileSync("./sample-hot-content.example.json", "utf-8")
  );

  // 环境变量检查
  if (!process.env.OPENAI_API_KEY) {
    console.error("错误：OPENAI_API_KEY 未设置。运行前请执行:");
    console.error("  export OPENAI_API_KEY=sk-...");
    process.exit(1);
  }

  if (samples.length < 5 || samples.length > 10) {
    console.warn(`\\u26a0 当前样本数为 ${samples.length}，2a 阶段建议保持在 5-10 条之间（太少不够验证稳定性，太多超出2a的低成本试错定位）`);
  }

  console.log(`开始验证 ${samples.length} 条样本...\\n`);

  let parseFailures = 0;
  let fieldWarnings = 0;

  for (const sample of samples) {
    const result = await extractOne(sample);

    console.log(`--- ${sample.id} (${sample.platform}) ---`);

    if ("error" in result) {
      parseFailures++;
      console.log(`\\u274c JSON 解析失败: ${result.error}`);
      if (result.raw) {
        console.log(`原始输出: ${result.raw}`);
      }
    } else {
      console.log(JSON.stringify(result, null, 2));
      const warnings = checkCompleteness(result);
      if (warnings.length > 0) {
        fieldWarnings++;
        console.log(`\\u26a0 字段警告: ${warnings.join("; ")}`);
      } else {
        console.log(`\\u2705 字段完整`);
      }
    }
    console.log("");
  }

  console.log("=== 汇总 ===");
  console.log(`总样本数: ${samples.length}`);
  console.log(`JSON 解析失败: ${parseFailures}`);
  console.log(`字段不完整: ${fieldWarnings}`);
  console.log(
    parseFailures > 0 || fieldWarnings > samples.length / 3
      ? "\\n建议：先调整 prompt 再进入 2b 批量验证。"
      : "\\n结果看起来稳定，可以进入 2b（50-100 条批量验证）。"
  );
}

main().catch(console.error);
