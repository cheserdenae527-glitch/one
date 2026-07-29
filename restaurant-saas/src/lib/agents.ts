export interface AgentSubType {
  id: string; label: string; desc: string;
}

export interface Agent {
  id: string; label: string; icon: string; desc: string; color: string;
  subTypes: AgentSubType[];
  /** 推荐的 Skill ID 列表（与 src/lib/skills.ts 的 AGENT_SKILL_MAP 对应） */
  skillIds?: string[];
}

export const AGENTS: Agent[] = [
  {
    id: "dianping", label: "大众点评", icon: "D",
    desc: "店铺基础建设与转化页面优化", color: "from-orange-500 to-red-500",
    skillIds: ["content-creation", "restaurant-consulting"],
    subTypes: [
      { id: "dianping", label: "店铺简介", desc: "首页文案，3秒建立第一印象" },
      { id: "reply", label: "评价回复", desc: "好评回复、差评处理" },
      { id: "dish", label: "菜品文案", desc: "标题优化与描述撰写" },
      { id: "promotion", label: "团购套餐", desc: "套餐包装与卖点提炼" },
    ],
  },
  {
    id: "xiaohongshu", label: "小红书", icon: "S",
    desc: "种草笔记与探店内容", color: "from-pink-500 to-purple-500",
    skillIds: ["viral-writer-skill", "xiaohongshu-skills", "xiaohongshu-comment-reply", "xiaohongshu-conversion-path", "guizang-social-card-skill", "content-creation"],
    subTypes: [
      { id: "xiaohongshu", label: "种草笔记", desc: "真实食客口吻，吸引到店" },
      { id: "cover", label: "封面文案", desc: "标题+封面文字优化" },
    ],
  },
  {
    id: "douyin", label: "抖音", icon: "D2",
    desc: "短视频脚本与口播文案", color: "from-emerald-500 to-teal-500",
    skillIds: ["viral-writer-skill", "content-creation", "guizang-social-card-skill"],
    subTypes: [
      { id: "douyin", label: "短视频脚本", desc: "3秒钩子+内容+引导" },
    ],
  },
  {
    id: "marketing", label: "营销活动", icon: "M",
    desc: "节日促销与新老客活动", color: "from-blue-500 to-indigo-500",
    skillIds: ["content-creation", "content-planning", "distribb-skill"],
    subTypes: [
      { id: "promotion", label: "节日活动", desc: "节日促销方案与文案" },
    ],
  },
];
