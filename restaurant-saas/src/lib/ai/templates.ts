export async function extractTemplateFromContent(content: {
  title: string;
  body: string;
  likesCount: number;
  platform: string;
  cuisineType: string;
}) {
  // TODO: Call OpenAI with extraction prompt
  return {
    angle: "\u6A2A\u8BC4\u5BF9\u6BD4",
    format: "\u5408\u96C6\u4F53",
    structure: ["\u94A9\u5B50", "\u9010\u5E97\u5BF9\u6BD4", "\u603B\u7ED3"],
    hook: "\u95EE\u9898\u5F0F",
    tone: ["\u4E13\u4E1A\u8BC4\u6D4B"],
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
