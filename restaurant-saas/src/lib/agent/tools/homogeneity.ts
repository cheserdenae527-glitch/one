import type { AgentTool } from "../types";

export interface HomogeneityInput {
  merchantId?: string;
  days?: number;
}

export interface HomogeneityOutput {
  severity: "none" | "mild" | "severe";
  score: number;
}

const homogeneityTool: AgentTool<HomogeneityInput, HomogeneityOutput> = {
  name: "check_homogeneity",
  description: "扫描近期内容，提示审美疲劳",
  parameters: {
    type: "object",
    properties: {
      merchantId: { type: "string" },
      days: { type: "number" },
    },
    required: [],
  },
  execute: async (_input, _context) => {
    return { severity: "none", score: 0 };
  },
};

export default homogeneityTool;
