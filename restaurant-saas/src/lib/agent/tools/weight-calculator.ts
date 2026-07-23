import type { AgentTool, WeightedCandidate } from "../types";

export interface WeightCalculatorInput {
  candidates?: WeightedCandidate[];
}

export interface WeightCalculatorOutput {
  candidates: WeightedCandidate[];
  selectedIndex: number;
}

const weightCalculatorTool: AgentTool<WeightCalculatorInput, WeightCalculatorOutput> = {
  name: "calculate_reference_weight",
  description: "跑权重系统，返回最佳方案",
  parameters: {
    type: "object",
    properties: {
      candidates: {
        type: "array",
        items: { type: "object" },
      },
    },
    required: [],
  },
  execute: async (_input, _context) => {
    return { candidates: [], selectedIndex: -1 };
  },
};

export default weightCalculatorTool;
