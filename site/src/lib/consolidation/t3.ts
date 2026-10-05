/**
 * Retired lesson keys for T3 (agentic-systems), merged into `RENAMED` in curriculum.ts.
 * Key: `<moduleSlug>/<lessonSlug>` of a lesson that was published and is now retired.
 * Value: the `<moduleSlug>/<lessonSlug>` that now teaches it, or `null` when withdrawn.
 * next.config.ts turns every entry into a permanent redirect. One file per track keeps
 * parallel consolidation PRs from editing the same lines.
 */
export const RENAMED_T3: Record<string, string | null> = {
  // T3.4 consolidated into seven lessons (canonical-homes spec, "Consolidated modules").
  'memory-and-state/state-memory-sessions': 'memory-and-state/why-agents-need-state',
  'memory-and-state/memory-and-state-interview-tutorial': 'memory-and-state/short-term-memory-and-the-context-window',
  'memory-and-state/ch07-knowledge-memory-retrieval': 'memory-and-state/long-term-memory-write-retrieve-forget',
  'memory-and-state/module-09-memory-databases-caching-for-genai-systems':
    'chunking-and-indexing/module-09-memory-databases-caching-for-genai-systems',
}
