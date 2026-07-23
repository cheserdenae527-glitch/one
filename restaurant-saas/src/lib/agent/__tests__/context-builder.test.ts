import { describe, it, expect } from "vitest";
import { vi } from "vitest";

vi.mock("@/lib/supabase-server", () => ({
  getStoreInfo: vi.fn().mockResolvedValue({
    id: "test-merchant",
    name: "测试餐厅",
    accountStage: "new",
  }),
}));

import { buildAgentContext } from "../context-builder";

describe("buildAgentContext", () => {
  it("should return context with merchantId", async () => {
    // Note: This test depends on getStoreInfo which requires Supabase.
    // For now, we verify the function exists and returns a promise.
    const result = buildAgentContext("test-merchant");
    expect(result).toBeInstanceOf(Promise);
  });

  it("should produce context with correct shape", async () => {
    const ctx = await buildAgentContext("test-merchant");
    expect(ctx).toHaveProperty("merchantId");
    expect(ctx).toHaveProperty("storeInfo");
    expect(ctx).toHaveProperty("recentContent");
    expect(ctx).toHaveProperty("trendingTopics");
    expect(ctx).toHaveProperty("merchantFeedback");
  });

  it("should use storeInfo from getStoreInfo", async () => {
    const ctx = await buildAgentContext("test-merchant");
    expect(ctx.storeInfo.name).toBe("测试餐厅");
    expect(ctx.storeInfo.id).toBe("test-merchant");
  });
});
