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
  // T3.1–T3.3
  // T3.1 consolidated into four lessons.
  'the-tool-calling-loop/tool-calling-loop-from-scratch': 'the-tool-calling-loop/the-tool-calling-loop-from-scratch',
  'the-tool-calling-loop/what-an-agent-actually-is': 'the-tool-calling-loop/what-an-agent-is',
  'the-tool-calling-loop/agent-fundamentals-and-advanced-agentic-systems-interview-tutorial':
    'the-tool-calling-loop/practise-agent-loop-interview-questions',
  // T3.2 consolidated into seven lessons.
  'tool-design-mcp-a2a/ch05-tool-use-agent-computer-interface': 'tool-design-mcp-a2a/the-agent-computer-interface',
  // T3.3 consolidated into seven lessons.
  'context-engineering/ch06-orchestration-context-engineering': 'context-engineering/control-placement',
  // T3.5–T3.7
  // T3.5 consolidated into six lessons; observability-for-tool-calls and
  // the-eight-guard-checks keep their slugs.
  'robust-agents/retry-fallback-memo-confirm': 'robust-agents/retries-and-fallbacks',
  'robust-agents/parallel-vs-sequential': 'robust-agents/parallel-and-sequential-tool-calls',
  'robust-agents/guarding-tool-calls': 'robust-agents/the-eight-guard-checks',
  // T3.6 consolidated into eight lessons; when-multi-agent-is-justified,
  // multi-agent-coordination-patterns and failure-isolation-and-evaluation keep their slugs.
  'multi-agent-systems/reference-architecture-handoffs': 'multi-agent-systems/handoffs-and-permission-scope',
  'multi-agent-systems/case-study-research-platform': 'multi-agent-systems/anatomy-of-a-deployed-multi-agent-platform',
  'multi-agent-systems/case-study-supervisor-to-deep-agent': 'multi-agent-systems/from-supervisor-to-deep-agent',
  'multi-agent-systems/multi-agent-systems-interview-tutorial': 'multi-agent-systems/practise-multi-agent-systems',
  // T3.7 consolidated into seven lessons; determinism-over-free-text and
  // durability-and-idempotency keep their slugs.
  'agentic-workflow-platforms/the-problem-in-plain-english':
    'agentic-workflow-platforms/why-workflow-automation-is-a-trust-problem',
  'agentic-workflow-platforms/canonical-events-and-channels': 'agentic-workflow-platforms/canonical-events-and-routing',
  'agentic-workflow-platforms/approvals-spend-caps-staged-rollout': 'agentic-workflow-platforms/approvals-and-spend-caps',
}
