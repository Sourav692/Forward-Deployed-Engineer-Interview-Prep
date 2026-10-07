/**
 * Retired lesson keys for T7 (communication-and-behavioural), merged into `RENAMED` in curriculum.ts.
 * Key: `<moduleSlug>/<lessonSlug>` of a lesson that was published and is now retired.
 * Value: the `<moduleSlug>/<lessonSlug>` that now teaches it, or `null` when withdrawn.
 * next.config.ts turns every entry into a permanent redirect. One file per track keeps
 * parallel consolidation PRs from editing the same lines.
 */
export const RENAMED_T7: Record<string, string | null> = {
  // T7.1 consolidated into six lessons (site/specs/consolidation/T7-T8.md).
  'telling-the-build-story/deep-dive-and-conversational-formats': 'telling-the-build-story/three-formats-for-one-project',
  'telling-the-build-story/proof-vs-cheat-sheet-honesty': 'telling-the-build-story/proof-versus-knowledge',
  // 2026-10-08: reordered to prepare-then-deliver; the honesty lessons merged.
  'telling-the-build-story/offered-honesty-and-war-stories': 'telling-the-build-story/proof-versus-knowledge',
  // 2026-10-08: T7.3 and T7.4 retired (RETIRED_MODULES in curriculum.ts). Their worksheets
  // live under /modules/14-behavioural-and-leadership-round, redirected in next.config.ts.
  'leadership-principle-answers/customer-obsession': null,
  'leadership-principle-answers/ownership': null,
  'leadership-principle-answers/attracts-and-retains-talent': null,
  'leadership-principle-answers/communicates-with-clarity': null,
  'leadership-principle-answers/sets-high-standards': null,
  'leadership-principle-answers/focuses-on-outcomes': null,
  'leadership-principle-answers/resourceful': null,
  'leadership-principle-answers/makes-good-decisions-quickly': null,
  'leadership-principle-answers/develops-people': null,
  'leadership-principle-answers/creates-a-culture-of-accountability': null,
  'leadership-principle-answers/engenders-trust': null,
  'leadership-principle-answers/embraces-adversity': null,
  'leadership-principle-answers/never-stops-learning-and-growing': null,
  'leadership-principle-answers/staff-level-and-cross-cutting': null,
  'hiring-manager-round/ambiguity-and-discovery': null,
  'hiring-manager-round/stakeholder-influence': null,
  'hiring-manager-round/delivery-under-pressure': null,
  'hiring-manager-round/pushback-and-saying-no': null,
  'hiring-manager-round/scale-beyond-self': null,
}
