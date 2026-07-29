/**
 * 运营 Skill 加载器 & Agent 类型映射
 *
 * 读取 .agents/skills/ 目录下的 SKILL.md 文件，
 * 解析元数据并提供给 Agent Chat API 注入使用。
 *
 * 使用方式（server-side only）:
 *   import { loadSkill, listSkills, getSkillsForAgent } from "@/lib/skills";
 */

import fs from "fs/promises";
import path from "path";

const SKILLS_DIR = path.resolve(process.cwd(), "../../.agents/skills");

export interface SkillMeta {
  name: string;
  description: string;
  triggers: string[];
}

export interface SkillPkg {
  id: string;
  name: string;
  meta: SkillMeta;
  content: string;
}

export const AGENT_SKILL_MAP: Record<string, string[]> = {
  dianping: ["content-creation", "restaurant-consulting"],
  xiaohongshu: [
    "viral-writer-skill",
    "xiaohongshu-skills",
    "xiaohongshu-comment-reply",
    "xiaohongshu-conversion-path",
    "guizang-social-card-skill",
    "content-creation",
  ],
  douyin: ["viral-writer-skill", "content-creation", "guizang-social-card-skill"],
  marketing: ["content-creation", "content-planning", "distribb-skill"],
};

export const SUBTYPE_SKILL_MAP: Record<string, string[]> = {
  reply: ["linkedin-skills", "xiaohongshu-comment-reply"],
  promotion: ["content-creation", "content-planning"],
  dish: ["content-creation"],
  cover: ["guizang-social-card-skill"],
};

let cachedSkills: Map<string, SkillPkg> | null = null;

export async function listSkillIds(): Promise<string[]> {
  try {
    const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
    return entries
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
}

export async function loadSkill(skillId: string): Promise<SkillPkg | null> {
  const skillPath = path.join(SKILLS_DIR, skillId, "SKILL.md");
  try {
    const raw = await fs.readFile(skillPath, "utf-8");
    return {
      id: skillId,
      name: parseName(raw),
      meta: parseMeta(raw),
      content: raw,
    };
  } catch {
    return null;
  }
}

export async function loadAllSkills(): Promise<SkillPkg[]> {
  if (cachedSkills) {
    return Array.from(cachedSkills.values());
  }
  const ids = await listSkillIds();
  const results: SkillPkg[] = [];
  for (const id of ids) {
    const skill = await loadSkill(id);
    if (skill) results.push(skill);
  }
  cachedSkills = new Map(results.map((s) => [s.id, s]));
  return results;
}

export function clearSkillCache(): void {
  cachedSkills = null;
}

export async function getSkillsForAgent(agentId: string): Promise<SkillPkg[]> {
  const skillIds = AGENT_SKILL_MAP[agentId] ?? [];
  const results: SkillPkg[] = [];
  for (const id of skillIds) {
    const skill = cachedSkills?.get(id) ?? (await loadSkill(id));
    if (skill) results.push(skill);
  }
  return results;
}

export function buildSkillSystemPrompt(skills: SkillPkg[]): string {
  if (skills.length === 0) return "";
  const blocks = skills.map(
    (s) =>
      `## 【${s.name}】专业能力\n\n${s.meta.description}\n\n以下是该领域的具体操作指引：\n${s.content.replace(/---[\s\S]*?---/, "").trim()}`,
  );
  return `\n\n## 以下是你额外掌握的专业能力（Skill 增强）\n你可以结合这些专业知识来提供更精准的回答。\n\n${blocks.join("\n\n---\n\n")}`;
}

function parseName(raw: string): string {
  const m = raw.match(/^name:\s*(.+)$/m);
  return m ? m[1].trim() : "";
}

function parseMeta(raw: string): SkillMeta {
  const name = parseName(raw);
  const descMatch = raw.match(/^description:\s*(.+)$/m);
  const description = descMatch ? descMatch[1].trim() : "";
  const triggers: string[] = [];
  const triggerSection = raw.match(/当用户提到(.*?)(?:。|\.|触发)/s);
  if (triggerSection) {
    const rawTriggers = triggerSection[1]
      .split(/[、，,、\/]/)
      .map((s) => s.trim())
      .filter(Boolean);
    triggers.push(...rawTriggers);
  }
  const metaTrigger = raw.match(/trigger:\s*(.+)$/m);
  if (metaTrigger) triggers.push(metaTrigger[1].trim());
  return { name, description, triggers };
}
