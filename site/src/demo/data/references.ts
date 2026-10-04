/**
 * Reference list cited by sample lessons. Public, well-known sources only; the
 * `internal` entries point at the blueprint's planned canonical folders and are
 * placeholders, not links to real lesson text.
 */
import type { Reference } from '../types'

export const REFERENCES: Reference[] = [
  {
    id: 'ref-rag-paper',
    title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
    kind: 'paper',
    source: 'Lewis et al., 2020',
    note: 'The paper that named the pattern; read the architecture section.',
  },
  {
    id: 'ref-bm25',
    title: 'The Probabilistic Relevance Framework: BM25 and Beyond',
    kind: 'paper',
    source: 'Robertson and Zaragoza, 2009',
    note: 'Why lexical retrieval still wins on exact terms and identifiers.',
  },
  {
    id: 'ref-rerank',
    title: 'Passage Re-ranking with BERT',
    kind: 'paper',
    source: 'Nogueira and Cho, 2019',
    note: 'The cross-encoder rerank step most retrieval stacks now copy.',
  },
  {
    id: 'ref-lost-middle',
    title: 'Lost in the Middle: How Language Models Use Long Contexts',
    kind: 'paper',
    source: 'Liu et al., 2023',
    note: 'Evidence that position in the context window changes recall.',
  },
  {
    id: 'ref-react',
    title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
    kind: 'paper',
    source: 'Yao et al., 2022',
    note: 'The reason-act loop behind most single-agent designs.',
  },
  {
    id: 'ref-mcp',
    title: 'Model Context Protocol specification',
    kind: 'docs',
    source: 'modelcontextprotocol.io',
    note: 'Tool and resource exposure for agents; read the transport section.',
  },
  {
    id: 'ref-owasp-llm',
    title: 'OWASP Top 10 for Large Language Model Applications',
    kind: 'docs',
    source: 'OWASP Foundation',
    note: 'Prompt injection, insecure output handling and excessive agency.',
  },
  {
    id: 'ref-sre',
    title: 'Site Reliability Engineering',
    kind: 'book',
    source: 'Beyer et al., 2016',
    note: 'Chapters on SLOs and error budgets apply directly to AI services.',
  },
  {
    id: 'ref-ddia',
    title: 'Designing Data-Intensive Applications',
    kind: 'book',
    source: 'Kleppmann, 2017',
    note: 'Idempotency, replication and stream processing fundamentals.',
  },
  {
    id: 'ref-accelerate',
    title: 'Accelerate',
    kind: 'book',
    source: 'Forsgren, Humble and Kim, 2018',
    note: 'Delivery metrics that translate to AI rollout gates.',
  },
  {
    id: 'ref-mom-test',
    title: 'The Mom Test',
    kind: 'book',
    source: 'Fitzpatrick, 2013',
    note: 'Discovery questions that surface real behaviour, not opinions.',
  },
  {
    id: 'ref-ragas',
    title: 'RAGAS: Automated Evaluation of Retrieval Augmented Generation',
    kind: 'paper',
    source: 'Es et al., 2023',
    note: 'Faithfulness and context-relevance metrics; validate before trusting.',
  },
  {
    id: 'ref-canonical-handbook',
    title: 'Planned canonical lesson (placeholder)',
    kind: 'internal',
    source: 'See the module’s “Canonical source” field',
    note: 'The production lesson will be synced from the canonical source path.',
  },
]
