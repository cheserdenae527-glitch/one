import { describe, it, expect } from "vitest";
import { createToolRegistry, wrapContentGenerator, wrapPersonaGenerator } from "../tools/index";

describe("Tool registry", () => {
  const registry = createToolRegistry();

  it("should register all tools after init", async () => {
    await registry.init();
    const toolNames = registry.listTools().map(t => t.name);
    expect(toolNames).toContain("analyze_trending_content");
    expect(toolNames).toContain("analyze_hot_topics");
    expect(toolNames).toContain("create_weekly_plan");
    expect(toolNames).toContain("check_homogeneity");
    expect(toolNames).toContain("calculate_reference_weight");
    expect(toolNames).toContain("generate_content");
    expect(toolNames).toContain("generate_persona");
  });

  it("should get tool by name", () => {
    const tool = registry.getTool("analyze_trending_content");
    expect(tool).toBeDefined();
    expect(tool!.description).toBeTruthy();
  });

  it("should return null for unknown tool", () => {
    expect(registry.getTool("nonexistent")).toBeNull();
  });
});

describe("Tool wrappers", () => {
  it("wrapContentGenerator should return valid AgentTool", () => {
    const tool = wrapContentGenerator();
    expect(tool.name).toBe("generate_content");
    expect(tool.description).toContain("内容");
    expect(tool.parameters).toBeDefined();
  });

  it("wrapPersonaGenerator should return valid AgentTool", () => {
    const tool = wrapPersonaGenerator();
    expect(tool.name).toBe("generate_persona");
  });
});

