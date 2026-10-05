/**
 * Retired lesson keys for T8 (interview-practice), merged into `RENAMED` in curriculum.ts.
 * Key: `<moduleSlug>/<lessonSlug>` of a lesson that was published and is now retired.
 * Value: the `<moduleSlug>/<lessonSlug>` that now teaches it, or `null` when withdrawn.
 * next.config.ts turns every entry into a permanent redirect. One file per track keeps
 * parallel consolidation PRs from editing the same lines.
 */
export const RENAMED_T8: Record<string, string | null> = {
  // T8.2 consolidated into a how-to lesson and five scenario mocks (site/specs/consolidation/T7-T8.md).
  'mock-interviews/short-practice-mocks': 'mock-interviews/running-and-scoring-a-mock-interview',
  'mock-interviews/full-mock-interviews': 'mock-interviews/running-and-scoring-a-mock-interview',
}
