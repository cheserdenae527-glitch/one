import { describe, it, expect } from "vitest";
import { getTrendUrgency } from "../hot-urgency";
import type { TrendingTopicRecord } from "../types";

describe("getTrendUrgency", () => {
  it("should return not urgent when no topics", () => {
    const result = getTrendUrgency([]);
    expect(result.hasUrgent).toBe(false);
  });

  it("should return not urgent when no fetchedAt timestamp", () => {
    const topics: TrendingTopicRecord[] = [
      { platform: "小红书", title: "热门", likesCount: 100 },
    ];
    const result = getTrendUrgency(topics);
    expect(result.hasUrgent).toBe(false);
  });

  it("should sort by likesCount and pick top", () => {
    const topics: any[] = [
      { platform: "小红书", title: "低热度", likesCount: 10, fetchedAt: new Date().toISOString() },
      { platform: "小红书", title: "高热度", likesCount: 1000, fetchedAt: new Date().toISOString() },
    ];
    const result = getTrendUrgency(topics);
    expect(result.topic?.title).toBe("高热度");
  });
});
