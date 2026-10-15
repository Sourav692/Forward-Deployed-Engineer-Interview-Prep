'use client'

import { useEffect, useId, useRef } from 'react'
import type { ExplorerData, ExplorerEdge, ExplorerNode } from '@/lib/explorers/types'
import styles from './explorer.module.css'

type System = ExplorerData['systems'][number]
function points(edge: ExplorerEdge, nodes: ExplorerNode[]) {
  if (edge.points) return edge.points
  const a = nodes.find((n) => n.id === edge.from)!, b = nodes.find((n) => n.id === edge.to)!
  const aw = a.w ?? 178, ah = a.h ?? 70, bw = b.w ?? 178, bh = b.h ?? 70
  const ax = a.x + aw / 2, ay = a.y + ah / 2, bx = b.x + bw / 2, by = b.y + bh / 2
  if (Math.abs(bx - ax) > Math.abs(by - ay)) {
    const x1 = bx > ax ? a.x + aw : a.x, x2 = bx > ax ? b.x : b.x + bw, mid = (x1 + x2) / 2
    return [[x1, ay], [mid, ay], [mid, by], [x2, by]]
  }
  const y1 = by > ay ? a.y + ah : a.y, y2 = by > ay ? b.y : b.y + bh, mid = (y1 + y2) / 2
  return [[ax, y1], [ax, mid], [bx, mid], [bx, y2]]
}

export function ExplorerGraph({ system, scenario, step, visited, select }: {
  system: System; scenario: System['scenarios'][number]; step: number; visited: number[]; select: (step: number) => void
}) {
  const id = useId().replace(/:/g, '')
  const scroll = useRef<HTMLDivElement>(null)
  const active = new Set(scenario.stages[step].nodeIds)
  const seen = new Set(visited.flatMap((i) => scenario.stages[i]?.nodeIds ?? []))
  const nodes = system.diagram.nodes.map((n) => ({ ...n, ...scenario.nodeOverrides?.[n.id] }))
  const skipped = new Set(scenario.skipNodes)
  const first = nodes.find((n) => active.has(n.id))
  const center = first ? first.x + (first.w ?? 178) / 2 : 0
  useEffect(() => {
    const element = scroll.current
    if (!element) return
    const position = () => {
      const width = Math.max(944, system.diagram.width * .8, element.clientWidth)
      element.scrollTo({ left: Math.max(0, center * width / system.diagram.width - element.clientWidth / 2), behavior: 'auto' })
    }
    position()
    const observer = new ResizeObserver(position)
    observer.observe(element)
    return () => observer.disconnect()
  }, [center, system.diagram.width])

  const colors = { flow: 'var(--border-strong)', data: 'var(--success)', branch: 'var(--warning-text)', observation: 'var(--text-subtle)', active: 'var(--accent)' }
  return (
    <div ref={scroll} className={styles.mapScroll} role="region" aria-label="Scrollable architecture map" tabIndex={0}>
      <svg className={styles.map} style={{ minWidth: Math.max(944, system.diagram.width * .8) }} viewBox={`0 0 ${system.diagram.width} ${system.diagram.height}`} role="group" aria-label={`${system.name} architecture. Select a component to open its stage.`}>
        <defs>{Object.entries(colors).map(([kind, color]) => <marker key={kind} id={`${id}-${kind}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10Z" fill={color} /></marker>)}</defs>
        {(scenario.edges ?? system.diagram.edges).map((edge, index) => {
          const p = points(edge, nodes), kind = edge.kind ?? 'flow'
          const highlighted = active.has(edge.to)
          return <g key={index} aria-hidden="true">
            <path d={p.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')} fill="none" stroke={colors[highlighted ? 'active' : kind]} strokeWidth={highlighted ? 2.2 : 1.5} strokeDasharray={kind === 'observation' ? '3 5' : kind === 'branch' ? '5 5' : undefined} markerEnd={`url(#${id}-${highlighted ? 'active' : kind})`} />
            {edge.label && <text x={edge.labelX ?? p[Math.floor(p.length / 2)][0]} y={edge.labelY ?? p[Math.floor(p.length / 2)][1] - 9} textAnchor="middle" className={styles.edgeLabel}>{edge.label}</text>}
          </g>
        })}
        {nodes.map((node) => {
          const stage = scenario.stages.findIndex((s) => s.nodeIds.includes(node.id))
          const off = skipped.has(node.id), on = active.has(node.id), done = seen.has(node.id)
          const labelX = node.role === 'component' && !off ? 38 : 13
          const font = Math.min(15, Math.max(10, ((node.w ?? 178) - labelX - 10) / (node.label.length * .53)))
          return <g key={node.id} transform={`translate(${node.x} ${node.y})`} data-node-id={node.id}
            role={off ? 'img' : 'button'} tabIndex={off ? undefined : 0} aria-disabled={off || undefined}
            aria-label={`${off ? 'Skipped' : `Stage ${stage + 1}`}: ${node.label}`} aria-pressed={off ? undefined : on}
            onClick={off ? undefined : () => select(stage)}
            onKeyDown={off ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(stage) } }}
            className={[styles.node, on ? styles.nodeActive : done ? styles.nodeVisited : '', off ? styles.nodeSkipped : ''].join(' ')}>
            <rect width={node.w ?? 178} height={node.h ?? 70} rx={10} className={styles.nodeBox} />
            {labelX === 38 && <text x="13" y="28" className={styles.nodeNumber}>{String(stage + 1).padStart(2, '0')}</text>}
            <text x={labelX} y="28" fontSize={font} className={styles.nodeTitle}>{node.label}</text>
            <text x="13" y="49" className={styles.nodeSub}>{off ? 'Not used in this scenario' : node.sub}</text>
          </g>
        })}
      </svg>
    </div>
  )
}
