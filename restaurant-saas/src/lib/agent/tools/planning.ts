import type { AgentTool } from "../types";

export interface PlanningInput {
  days?: number;
  platform?: string;
  contentType?: string;
}

export interface PlanningOutput {
  weekPlan: Array<{ day: string; platform: string; contentType: string; topic: string }>;
}

const planningTool: AgentTool<PlanningInput, PlanningOutput> = {
  name: "create_weekly_plan",
  description: "生成周内容排期",
  parameters: {
    type: "object",
    properties: {
      days: { type: "number" },
      platform: { type: "string" },
      contentType: { type: "string" },
    },
    required: [],
  },
  execute: async (_input, _context) => {
    return { weekPlan: [] };
  },
};

export default planningTool;
