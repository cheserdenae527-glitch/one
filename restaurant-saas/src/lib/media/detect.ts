/** Detects whether a chunk of text contains a direct image/video URL or a
 *  抖音 (Douyin) share link. Pure regex, no env vars or Node APIs — safe to
 *  import from both client components and server routes. */
export function hasMediaContent(text: string): boolean {
  return /(?:https?:\/\/[^\s"<>]+\.(?:jpe?g|png|gif|webp|bmp|mp4|mov|avi|wmv|flv)|https?:\/\/(?:v\.douyin\.com|www\.douyin\.com)\/[^\s"<>]+)/i.test(text);
}

/** Pulls the first matching media URL out of a message so it can be handed
 *  to the video/image analysis endpoints. Returns null if none found. */
export function extractMediaUrl(text: string): string | null {
  const match = text.match(
    /https?:\/\/[^\s"<>]+\.(?:jpe?g|png|gif|webp|bmp|mp4|mov|avi|wmv|flv)|https?:\/\/(?:v\.douyin\.com|www\.douyin\.com)\/[^\s"<>]+/i
  );
  return match ? match[0] : null;
}
