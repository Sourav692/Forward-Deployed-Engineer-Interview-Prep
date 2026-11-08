/**
 * The nine topic groups on /learn (site structure decided 30 October 2026; see "Site
 * structure (groups)" in CLAUDE.md). Navigation only: track URLs, requirements and
 * progress never depend on them. A group with no tracks yet shows as a Coming soon card
 * with its `planned` topics and has no page of its own.
 */
export type LearnGroup = {
  slug: string
  title: string
  summary: string
  tracks: string[]
  /** What the group will teach, shown on its Coming soon card while `tracks` is empty. */
  planned?: string
}

export const LEARN_STAGES: LearnGroup[] = [
  {
    slug: 'start-here',
    title: 'Start here',
    summary: 'Understand the FDE role, then fill gaps in programming, APIs, data and deployment.',
    tracks: ['orientation', 'engineering-foundations'],
  },
  {
    slug: 'ai-engineering',
    title: 'AI Engineering',
    summary: 'Build LLM applications, retrieval pipelines and agents, from the first prompt to multi-agent systems.',
    tracks: [
      'ai-engineering-foundations',
      'prompt-and-context-engineering',
      'langchain-and-langgraph-fundamentals',
      'llm-and-retrieval',
      'retrieval-quality-engineering',
      'agentic-systems',
      'advanced-agents',
      'agentic-and-self-correcting-rag',
      'memory-and-multi-agent-rag',
      'multi-agent-systems',
      'agent-protocols-mcp-and-a2a',
      'hierarchical-memory-and-graph-rag',
      'fine-tuning-and-model-adaptation',
      'architecture-synthesis-and-capstone',
    ],
  },
  {
    slug: 'production-ai-engineering',
    title: 'Production AI Engineering',
    summary: 'Prove an AI system works, keep it safe and run it in production.',
    tracks: ['production-ai'],
  },
  {
    slug: 'harness-engineering',
    title: 'Harness Engineering',
    summary: 'Build the runtime around an agent: the loop, its tools and the checks that keep it on task.',
    tracks: [],
    planned: 'The agent loop, tool execution, permissions and sandboxing, context management and agent evals.',
  },
  {
    slug: 'inference-engineering',
    title: 'Inference Engineering',
    summary: 'Serve models quickly and cheaply on real hardware.',
    tracks: [],
    planned: 'Serving engines, GPUs and memory, batching and the KV cache, quantization and speculative decoding.',
  },
  {
    slug: 'ai-system-design',
    title: 'AI System Design',
    summary: 'Turn a vague brief into an architecture you can defend in an interview.',
    tracks: ['ai-systems-design', 'staff-ai-system-design'],
  },
  {
    slug: 'forward-deployed-engineering',
    title: 'Forward Deployed Engineering',
    summary: 'Scope the work with a customer, deliver it and get it adopted.',
    tracks: ['forward-deployed'],
  },
  {
    slug: 'coding',
    title: 'Coding',
    summary: 'Pass the coding rounds, including the AI-assisted format.',
    tracks: [],
    planned: 'Python patterns, the AI-assisted coding round, from-scratch builds, and code review and debugging drills.',
  },
  {
    slug: 'career',
    title: 'Career',
    summary: 'Tell your stories, show your work and land the offer.',
    tracks: ['communication-and-behavioural', 'capstone-and-portfolio'],
  },
]

export const groupHref = (slug: string) => `/learn/topics/${slug}`
export const liveGroups = () => LEARN_STAGES.filter((group) => group.tracks.length > 0)
export const groupOfTrack = (trackSlug: string) => LEARN_STAGES.find((group) => group.tracks.includes(trackSlug))
