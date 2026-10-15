export type ExplorerEdge = {
  from: string; to: string; kind?: 'flow' | 'data' | 'branch' | 'observation'
  points?: number[][]; label?: string; labelX?: number; labelY?: number
}
export type ExplorerNode = {
  id: string; label: string; sub: string; x: number; y: number; w?: number; h?: number
  role?: 'component' | 'data' | 'branch' | 'observation'
}
export type ExplorerStage = {
  title: string; component: string; short: string; what: string; why: string; next: string
  input: unknown; output: unknown; checks: { kind: string; text: string }[]; nodeIds: string[]
}
export type ExplorerData = {
  title: string; subtitle?: string
  readingLinks?: Record<string, string>
  sources: { id: string; title: string; file?: string; url?: string; note: string }[]
  systems: {
    id: string; name: string; description: string; question: string; scope: string; provenance: string
    headline: string; requestLabel: string; discoverySection: string
    discovery: { question: string; answer: string; decision: string }[]
    sourceMap: { section: string; where: string; note: string }[]
    limitations: string[]
    diagram: { width: number; height: number; nodes: ExplorerNode[]; edges: ExplorerEdge[] }
    scenarios: {
      id: string; label: string; outcome: string; stages: ExplorerStage[]; edges?: ExplorerEdge[]
      skipNodes?: string[]; nodeOverrides?: Record<string, Partial<ExplorerNode>>
    }[]
    revision: {
      pitch: string; flow: string; requirements: string[][]; discovery: string[]
      tradeoff: string; failure: string; ops: string[][]; remember: string
    }
  }[]
}
