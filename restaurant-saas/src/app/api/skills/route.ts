import { NextResponse } from "next/server";
import { loadAllSkills, AGENT_SKILL_MAP, getSkillsForAgent } from "@/lib/skills";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");

    if (agentId) {
      const skills = await getSkillsForAgent(agentId);
      return NextResponse.json({
        agentId,
        skills: skills.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.meta.description,
          triggers: s.meta.triggers,
        })),
      });
    }

    const all = await loadAllSkills();
    return NextResponse.json({
      skills: all.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.meta.description,
        triggers: s.meta.triggers,
      })),
      agentMap: AGENT_SKILL_MAP,
    });
  } catch (error) {
    console.error("Skills API error:", error);
    return NextResponse.json(
      { error: "Failed to load skills" },
      { status: 500 },
    );
  }
}
