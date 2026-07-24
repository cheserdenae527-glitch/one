import { describe, it, expect } from "vitest";
import { getHotTags, getCityTags } from "@/data/tag-library";
import { shouldAddAIGCDisclaimer, applyAIGCDisclaimer } from "@/services/compliance";

describe("tag-library", () => {
  it("getCityTags returns correct data for Beijing", () => {
    const tags = getCityTags("北京");
    expect(tags).not.toBeNull();
    expect(tags?.hotTags).toContain("#北京美食");
  });

  it("getCityTags returns null for unknown city", () => {
    expect(getCityTags("未知")).toBeNull();
  });

  it("getHotTags returns defaults for unknown city", () => {
    const tags = getHotTags();
    expect(tags.length).toBeGreaterThan(0);
  });
});

describe("compliance - AIGC disclaimer", () => {
  it("should add disclaimer for douyin_description", () => {
    expect(shouldAddAIGCDisclaimer("douyin_description")).toBe(true);
  });

  it("should NOT add disclaimer for douyin_nickname", () => {
    expect(shouldAddAIGCDisclaimer("douyin_nickname")).toBe(false);
  });

  it("should NOT add disclaimer for douyin_live_opener", () => {
    expect(shouldAddAIGCDisclaimer("douyin_live_opener")).toBe(false);
  });

  it("should add disclaimer for xiaohongshu_note", () => {
    expect(shouldAddAIGCDisclaimer("xiaohongshu_note")).toBe(true);
  });

  it("applyAIGCDisclaimer adds disclaimer text", () => {
    const result = applyAIGCDisclaimer("Hello", "douyin_description");
    expect(result).toContain("AI");
    expect(result).toContain("Hello");
  });

  it("applyAIGCDisclaimer does NOT add disclaimer for excluded types", () => {
    const result = applyAIGCDisclaimer("Hello", "douyin_nickname");
    expect(result).toBe("Hello");
  });

  it("applyAIGCDisclaimer avoids double disclaimer", () => {
    const first = applyAIGCDisclaimer("Hello", "douyin_description");
    const second = applyAIGCDisclaimer(first, "douyin_description");
    // The disclaimer should only appear once
    const matches = second.match(/AI/g);
    expect(matches?.length).toBe(1);
  });
});
