/**
 * Retired lesson keys for T6 (forward-deployed), merged into `RENAMED` in curriculum.ts.
 * Key: `<moduleSlug>/<lessonSlug>` of a lesson that was published and is now retired.
 * Value: the `<moduleSlug>/<lessonSlug>` that now teaches it, or `null` when withdrawn.
 * next.config.ts turns every entry into a permanent redirect. One file per track keeps
 * parallel consolidation PRs from editing the same lines.
 */
export const RENAMED_T6: Record<string, string | null> = {
  // T6.1 consolidated into five lessons from the decomposition bank.
  'customer-discovery/fde-problem-decomposition-question-bank': 'customer-discovery/the-discovery-conversation',
  // T6.2 consolidated into seven lessons; Module 5 of the guide moved to T6.5.
  'scoping-an-fde-project/scoping-an-fde-project-complete-guide':
    'scoping-an-fde-project/problem-goal-and-definition-of-done',
  // T6.3 consolidated into eight lessons.
  'delivery-stages-and-gates/readme': 'delivery-stages-and-gates/delivery-as-a-repeatable-process',
  'delivery-stages-and-gates/theory': 'delivery-stages-and-gates/delivery-as-a-repeatable-process',
  'delivery-stages-and-gates/architecture-end-to-end': 'delivery-stages-and-gates/delivery-as-a-repeatable-process',
  'delivery-stages-and-gates/scoping-to-production-in-two-weeks':
    'delivery-stages-and-gates/delivery-as-a-repeatable-process',
  'delivery-stages-and-gates/gates-risks-metrics': 'delivery-stages-and-gates/role-gated-stage-gates',
  'delivery-stages-and-gates/security-gate-depth-and-tenant-scale':
    'delivery-stages-and-gates/securing-the-delivery-process',
  'delivery-stages-and-gates/interview-script': 'delivery-stages-and-gates/practise-the-two-week-delivery-round',
  // The senior FDE's day is taught once, in T0.2.
  'delivery-stages-and-gates/a-day-in-the-life': 'the-fde-role/a-senior-fdes-day',
  'delivery-stages-and-gates/end-to-end-ai-delivery-six-stages':
    'delivery-stages-and-gates/telling-a-delivery-story-in-six-stages',
  'delivery-stages-and-gates/cross-team-collaboration': 'delivery-stages-and-gates/cross-team-ownership-and-cadence',
  // T6.5: the scoping guide's Module 5 slice, now three lessons.
  'adoption-and-impact/scoping-roll-out-and-prove-the-result': 'adoption-and-impact/rolling-out-with-a-way-back',
}
