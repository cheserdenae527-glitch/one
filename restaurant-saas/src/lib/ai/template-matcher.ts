export interface MatchInput {
  cuisine: string;
  platform: string;
  personaTone?: string;
  recentAngles: string[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  tone: string[];
  cuisines: string[];
  platforms: string[];
  weight: number;
  isActive: boolean;
}

export function selectTemplates(input: MatchInput, allTemplates: Template[]) {
  let candidates = allTemplates.filter(
    (t) => t.cuisines.includes(input.cuisine) && t.platforms.includes(input.platform) && t.isActive
  );

  candidates = candidates.filter((t) => !input.recentAngles.includes(t.name));

  if (input.personaTone) {
    candidates = candidates.map((t) => ({
      ...t,
      weight: input.personaTone && t.tone.includes(input.personaTone) ? t.weight * 1.2 : t.weight,
    }));
  }

  candidates.sort((a, b) => b.weight - a.weight);
  const top3 = ensureDiversity(candidates.slice(0, 10), 3);

  return { candidates: top3, selected: top3[0] || null };
}

function ensureDiversity(candidates: Template[], count: number): Template[] {
  const result: Template[] = [];
  const usedAngles = new Set<string>();
  for (const c of candidates) {
    if (!usedAngles.has(c.name) && result.length < count) {
      result.push(c);
      usedAngles.add(c.name);
    }
  }
  return result;
}

