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
}
