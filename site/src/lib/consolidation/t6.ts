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
  // T20.1 practice: parts 1 and 2 merged into one page (19 Nov 2026); part 1 keeps its slug.
  'customer-discovery/practise-discovery-questions-2': 'customer-discovery/practise-discovery-questions-1',
  // T20.2: Estimating AI Work merged into Sizing the Work a Demo Hides (19 Nov 2026), which keeps the screens slug.
  'scoping-an-fde-project/estimating-ai-work-as-a-product': 'scoping-an-fde-project/the-system-behind-the-screens',
  // T20.3 practice: parts 1 and 2 merged into one page (19 Nov 2026); part 1 keeps its slug.
  'requirements-and-solution-design/practise-requirements-and-design-2':
    'requirements-and-solution-design/practise-requirements-and-design-1',
  // T21.5 practice: "AI engineering in the field" parts 1 and 2 merged into one page (20 Nov 2026); part 1 keeps its slug.
  'ai-delivery-in-customer-estates/practise-ai-engineering-in-the-field-2':
    'ai-delivery-in-customer-estates/practise-ai-engineering-in-the-field-1',
  // T20.6: Realised Versus Estimated Value merged into Proving Business Impact (19 Nov 2026).
  'adoption-and-impact/realised-versus-estimated-value': 'adoption-and-impact/proving-business-impact',
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
