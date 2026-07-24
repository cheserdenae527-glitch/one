/**
 * compliance.ts - AIGC disclaimer management
 */
export const AIGC_DISCLAIMER_WHITELIST: Set<string> = new Set([
  "douyin_description",
  "douyin_promotion",
  "douyin_ad",
  "xiaohongshu_note",
  "xiaohongshu_promotion",
]);
export function shouldAddAIGCDisclaimer(subType: string): boolean {
  return AIGC_DISCLAIMER_WHITELIST.has(subType);
}
export function applyAIGCDisclaimer(content: string, subType: string): string {
  if (!shouldAddAIGCDisclaimer(subType)) return content;
  const disclaimer = "\n\n---\n*\u672c\u6587\u7531 AI \u8f85\u52a9\u751f\u6210\uff0c\u4ec5\u4f9b\u53c2\u8003*";
  if (content.includes(disclaimer.trim())) return content;
  return content + disclaimer;
}
