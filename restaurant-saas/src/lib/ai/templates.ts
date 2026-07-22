export async function extractTemplateFromContent(content: {
  title: string;
  body: string;
  likesCount: number;
  platform: string;
  cuisineType: string;
}) {
  // TODO: Call OpenAI with extraction prompt
  return {
    angle: "横评对比",
    format: "合集体",
    structure: ["钩子", "逐店对比", "总结"],
    hook: "问题式",
    tone: ["专业评测"],
    cuisines: [content.cuisineType],
    platforms: [content.platform],
  };
}

export function calculateInitialWeight(likesCount: number, maxLikes: number): number {
  return Math.min(likesCount / maxLikes, 1);
}

export function deduplicateTemplates(templates: any[]) {
  const seen = new Set<string>();
  return templates.filter((t) => {
    const key = `${t.angle}-${t.format}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
