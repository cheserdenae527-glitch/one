const VISION_PROMPT = `你是一个专业的餐饮图片视觉分析师。
分析步骤：
1. 先识别这是什么菜、有哪些食材
2. 再分析构图、色彩、光线
3. 最后给出优化建议
只输出JSON：
{
  "dish_name": "这道菜的名称（如：水煮牛肉、酸菜鱼）",
  "ingredients": ["主要食材1", "主要食材2"],
  "anchor_details": ["碗沿有蓝色花纹"],
  "composition": { "quality": "good|fair|needs_improvement", "issues": [] },
  "color": { "palette": ["#hex1"], "warmth": "warm|neutral|cool", "saturation": "high|mid|low" },
  "lighting": { "quality": "good|fair|poor", "issues": [] },
  "food_appeal": 7.5,
  "background": "clean|slightly_cluttered|cluttered",
  "overall_score": 7.0,
  "improvement_priority": [],
  "detailed_description": "详细描述这道菜的视觉特征"
}`;

export interface AnalysisResult {
  dish_name: string;
  ingredients: string[];
  anchor_details: string[];
  composition: { quality: string; issues: string[] };
  color: { palette: string[]; warmth: string; saturation: string };
  lighting: { quality: string; issues: string[] };
  food_appeal: number;
  background: string;
  overall_score: number;
  improvement_priority: string[];
  detailed_description: string;
}

function extractResponseText(response: any): string {
  try {
    if (response?.output?.choices?.[0]?.message?.content) {
      return response.output.choices[0].message.content;
    }
  } catch {}
  return "";
}

export async function analyzeDishImage(
  imageDataUrl: string,
  anchorImages?: string[],
  platform?: string
): Promise<AnalysisResult> {
  const apiKey = process.env.VOLC_API_KEY;
  if (!apiKey) throw new Error("VOLC_API_KEY 未配置");

  const model = "doubao-seed-2-0-lite-260428";
  const platformHint = platform ? " 目标平台：" + platform : "";
  const content: any[] = [{ type: "input_image", image_url: imageDataUrl }];
  if (anchorImages) {
    for (const url of anchorImages) {
      content.push({ type: "input_image", image_url: url });
    }
  }
  content.push({ type: "input_text", text: VISION_PROMPT + platformHint });

  const res = await fetch("https://ark.cn-beijing.volces.com/api/v3/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model,
      input: [{ role: "user", content }],
      temperature: 0.3,
      max_output_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error("视觉API失败: " + res.status + " " + errText.substring(0, 200));
  }

  const data = await res.json();
  const text = extractResponseText(data);
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned) as AnalysisResult;
}

