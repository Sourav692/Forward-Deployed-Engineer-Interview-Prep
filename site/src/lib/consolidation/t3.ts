/**
 * Retired lesson keys for T3 (agentic-systems), merged into `RENAMED` in curriculum.ts.
 * Key: `<moduleSlug>/<lessonSlug>` of a lesson that was published and is now retired.
 * Value: the `<moduleSlug>/<lessonSlug>` that now teaches it, or `null` when withdrawn.
 * next.config.ts turns every entry into a permanent redirect. One file per track keeps
 * parallel consolidation PRs from editing the same lines.
 */
export const RENAMED_T3: Record<string, string | null> = {
  // T3.4 consolidated into seven lessons (canonical-homes spec, "Consolidated modules").
  'memory-and-state/state-memory-sessions': 'conversation-memory-and-conversational-rag/why-llms-forget-classic-memory-classes',
  'memory-and-state/memory-and-state-interview-tutorial': 'conversation-memory-and-conversational-rag/trimming-windowing-and-summary-memory',
  'memory-and-state/ch07-knowledge-memory-retrieval': 'memory-and-state/episodic-semantic-stack-and-multi-hop-graph-memory',
  'memory-and-state/module-09-memory-databases-caching-for-genai-systems':
    'vector-stores-and-index-operations/managed-stores-astra-db-and-pinecone',
  // T3.1–T3.3
  // T3.1 consolidated into four lessons.
  'the-tool-calling-loop/tool-calling-loop-from-scratch': 'the-agent-loop-and-tool-calling/the-manual-tool-loop-and-the-augmented-llm-in-langgraph',
  'the-tool-calling-loop/what-an-agent-actually-is': 'the-agent-loop-and-tool-calling/agentic-patterns-from-scratch-reflection-tool-use-react-planning',
  'the-tool-calling-loop/agent-fundamentals-and-advanced-agentic-systems-interview-tutorial':
    'the-agent-loop-and-tool-calling/the-agent-loop-and-tool-calling-interview-questions',
  // T3.2 consolidated into seven lessons.
  'tool-design-mcp-a2a/ch05-tool-use-agent-computer-interface': 'tool-design-mcp-a2a/the-agent-computer-interface',
  // T3.3 consolidated into seven lessons.
  'context-engineering/ch06-orchestration-context-engineering': 'context-engineering/control-placement',
  // T3.5–T3.7
  // T3.5 consolidated into six lessons; observability-for-tool-calls and
  // the-eight-guard-checks keep their slugs.
  'robust-agents/retry-fallback-memo-confirm': 'robust-agents/retries-and-fallbacks',
  'robust-agents/parallel-vs-sequential': 'collaboration-control-and-parallel-agents/parallel-agents-async-nodes-and-streaming',
  'robust-agents/guarding-tool-calls': 'robust-agents/the-eight-guard-checks',
  // T3.6 consolidated into eight lessons; when-multi-agent-is-justified,
  // multi-agent-coordination-patterns and failure-isolation-and-evaluation keep their slugs.
  'multi-agent-systems/reference-architecture-handoffs': 'multi-agent-architectures/handoffs-and-swarms',
  'multi-agent-systems/case-study-research-platform': 'agentops/anatomy-of-a-deployed-multi-agent-platform',
  'multi-agent-systems/case-study-supervisor-to-deep-agent': 'coding-computer-use-and-deep-agents/deep-agents-orchestrator-sub-agents-skills-and-long-term-memory',
  'multi-agent-systems/multi-agent-systems-interview-tutorial': 'multi-agent-architectures/multi-agent-architectures-interview-questions',
  // T3.7 consolidated into seven lessons; determinism-over-free-text and
  // durability-and-idempotency keep their slugs.
  'agentic-workflow-platforms/the-problem-in-plain-english':
    'agentic-workflow-platforms/why-workflow-automation-is-a-trust-problem',
  'agentic-workflow-platforms/canonical-events-and-channels': 'agentic-workflow-platforms/canonical-events-and-routing',
  'agentic-workflow-platforms/approvals-spend-caps-staged-rollout': 'agentic-workflow-platforms/approvals-and-spend-caps',
  // 2026-10-31: replaced by the RAG & Agents Engineering course (AI Engineering integration).
  'the-tool-calling-loop/what-an-agent-is': 'the-agent-loop-and-tool-calling/agentic-patterns-from-scratch-reflection-tool-use-react-planning',
  'the-tool-calling-loop/the-tool-calling-loop-from-scratch': 'the-agent-loop-and-tool-calling/the-manual-tool-loop-and-the-augmented-llm-in-langgraph',
  'the-tool-calling-loop/loop-guards-and-termination': 'react-agents-and-langchain-create-agent/react-with-langchain-create-agent',
  'the-tool-calling-loop/practise-agent-loop-interview-questions': 'the-agent-loop-and-tool-calling/the-agent-loop-and-tool-calling-interview-questions',
  'tool-design-mcp-a2a/the-model-context-protocol': 'mcp-foundations/from-a-tool-calling-chatbot-to-mcp',
  'context-engineering/orchestration-topologies': 'agentic-workflow-patterns/prompt-chaining-with-quality-gates',
  'context-engineering/planning-and-self-correction-patterns': 'planning-reflection-and-reasoning-patterns/plan-and-execute-vs-react-decompose-execute-replan',
  'memory-and-state/why-agents-need-state': 'conversation-memory-and-conversational-rag/why-llms-forget-classic-memory-classes',
  'memory-and-state/types-of-memory': 'memory-and-state/session-semantic-episodic-and-procedural-memory-on-sqlite',
  'memory-and-state/short-term-memory-and-the-context-window': 'conversation-memory-and-conversational-rag/trimming-windowing-and-summary-memory',
  'memory-and-state/long-term-memory-write-retrieve-forget': 'memory-and-state/episodic-semantic-stack-and-multi-hop-graph-memory',
  'memory-and-state/advanced-memory-architectures': 'memory-and-state/memgpt-tiers-voyager-skill-library-agent-workflow-memory',
  'memory-and-state/memory-in-production': 'memory-and-state/cross-thread-memory-with-a-store',
  'memory-and-state/practise-memory-and-state': 'memory-and-state/memory-and-state-interview-questions',
  'robust-agents/parallel-and-sequential-tool-calls': 'collaboration-control-and-parallel-agents/parallel-agents-async-nodes-and-streaming',
  'multi-agent-systems/when-multi-agent-is-justified': 'multi-agent-architectures/monolithic-vs-multi-agent-a-crew-from-scratch',
  'multi-agent-systems/multi-agent-coordination-patterns': 'multi-agent-architectures/the-five-multi-agent-architectures-and-agent-communication',
  'multi-agent-systems/shared-state-routing-and-termination': 'multi-agent-architectures/supervisors-and-hierarchical-teams',
  'multi-agent-systems/handoffs-and-permission-scope': 'multi-agent-architectures/handoffs-and-swarms',
  'multi-agent-systems/failure-isolation-and-evaluation': 'multi-agent-applied-builds-and-deep-agents/hardening-edge-cases-testing-and-system-wide-error-handling',
  'multi-agent-systems/from-supervisor-to-deep-agent': 'coding-computer-use-and-deep-agents/deep-agents-orchestrator-sub-agents-skills-and-long-term-memory',
  'multi-agent-systems/practise-multi-agent-systems': 'multi-agent-architectures/multi-agent-architectures-interview-questions',
  'multi-agent-systems/anatomy-of-a-deployed-multi-agent-platform': 'agentops/anatomy-of-a-deployed-multi-agent-platform',
}
