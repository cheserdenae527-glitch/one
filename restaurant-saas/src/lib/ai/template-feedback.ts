type UserAction = "save" | "publish" | "edit_publish" | "regenerate" | "reject_thrice";

const ACTION_WEIGHTS: Record<UserAction, number> = {
  save: 0.1,
  publish: 0.3,
  edit_publish: 0.2,
  regenerate: -0.1,
  reject_thrice: -1,
};

export function updateTemplateWeight(template: { weight: number }, action: UserAction): number {
  const delta = ACTION_WEIGHTS[action];
  return Math.max(0, Math.min(1, template.weight + delta));
}

export function getDeprecatedTemplates(templates: { weight: number; updatedAt: number; usageCount: number }[]) {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return templates.filter(
    (t) => t.weight < 0.1 || (t.updatedAt < thirtyDaysAgo && t.usageCount === 0)
  );
}
