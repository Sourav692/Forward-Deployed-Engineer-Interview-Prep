'use client'

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui'
import type { ExplorerData } from '@/lib/explorers/types'
import { ExplorerGraph } from './ExplorerGraph'
import styles from './explorer.module.css'

const views = [['understand', 'Understand the problem'], ['flow', 'Explore flow'], ['revision', 'Interview revision'], ['sources', 'Sources']] as const
type View = typeof views[number][0]
type Detail = 'story' | 'checks' | 'example'
const payload = (value: unknown) => typeof value === 'string' ? value : JSON.stringify(value, null, 2)

export default function Explorer({ data, sourceLinks }: { data: ExplorerData; sourceLinks: Record<string, string> }) {
  const system = data.systems[0]
  const key = `fde:explorer:v1:${system.id}`
  const [view, setView] = useState<View>('understand')
  const [scenarioId, setScenarioId] = useState(system.scenarios[0].id)
  const [step, setStep] = useState(0)
  const [visited, setVisited] = useState([0])
  const [detail, setDetail] = useState<Detail>('story')
  const [playing, setPlaying] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const [ready, setReady] = useState(false)
  const [notice, setNotice] = useState('')
  const root = useRef<HTMLDivElement>(null)
  const scenario = system.scenarios.find((s) => s.id === scenarioId) ?? system.scenarios[0]
  const index = Math.min(step, scenario.stages.length - 1)
  const current = scenario.stages[index]
  const last = scenario.stages.length - 1

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(key) ?? '{}')
        const found = system.scenarios.find((s) => s.id === saved.scenario)
        if (found) {
          setScenarioId(found.id)
          const position = Number.isInteger(saved.step) ? Math.max(0, Math.min(saved.step, found.stages.length - 1)) : 0
          setStep(position)
          setVisited(Array.isArray(saved.visited) ? saved.visited.filter((n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < found.stages.length) : [0])
        }
        if (views.some(([id]) => id === saved.view)) setView(saved.view)
        setReviewed(saved.reviewed === true)
      } catch { /* Storage may be blocked or the saved record malformed. */ }
      setReady(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [key, system.scenarios])

  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem(key, JSON.stringify({ scenario: scenarioId, step: index, visited, view, reviewed })) } catch { /* Browsing still works without storage. */ }
  }, [key, scenarioId, index, visited, view, reviewed, ready])

  const choose = useCallback((value: number, automatic = false) => {
    const next = Math.max(0, Math.min(value, last))
    setStep(next)
    setVisited((old) => old.includes(next) ? old : [...old, next])
    setDetail('story')
    if (!automatic || next === last) setPlaying(false)
  }, [last])

  useEffect(() => {
    if (!playing || view !== 'flow') return
    const timer = setTimeout(() => choose(index + 1, true), 4500)
    return () => clearTimeout(timer)
  }, [playing, view, index, choose])

  useEffect(() => {
    const pause = () => { if (document.hidden) setPlaying(false) }
    document.addEventListener('visibilitychange', pause)
    return () => document.removeEventListener('visibilitychange', pause)
  }, [])

  const changeView = (next: View) => { setPlaying(false); setView(next) }
  const switchScenario = (id: string) => { setPlaying(false); setScenarioId(id); setStep(0); setVisited([0]); setDetail('story') }
  const keyboard = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey || (e.target as HTMLElement).closest('input,select,textarea,[role="tablist"],[contenteditable="true"]')) return
    if (view === 'flow' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); choose(index + (e.key === 'ArrowRight' ? 1 : -1)) }
    if (e.key.toLowerCase() === 'r') changeView('revision')
    if (e.key.toLowerCase() === 'e') changeView('flow')
  }

  return (
    <div ref={root} className={styles.root} onKeyDown={keyboard} data-explorer={system.id}>
      <header className={styles.hero}>
        <div><p className={styles.eyebrow}><span className={styles.liveDot} /> INTERACTIVE WALKTHROUGH</p>
          <h2>{system.headline}</h2>
          <p>Follow the request. See what runs, what waits, and what stops.</p>
          <div className={styles.heroMeta}><span>{system.scenarios.length} guided scenarios</span><span>Based on the original lesson</span><span>No live business actions</span></div>
        </div>
        <button type="button" aria-pressed={reviewed} onClick={() => setReviewed(!reviewed)} className={`${styles.review} ${reviewed ? styles.reviewed : ''}`}>
          {reviewed ? '✓ Explorer reviewed' : '○ Mark explorer reviewed'}
        </button>
      </header>

      <div className={styles.viewTabs} role="tablist" aria-label="Explorer sections">
        {views.map(([id, label], i) => <button key={id} type="button" role="tab" id={`explorer-tab-${id}`}
          aria-controls={`explorer-${id}`} aria-selected={view === id} tabIndex={view === id ? 0 : -1}
          onClick={() => changeView(id)} onKeyDown={(e) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
            e.preventDefault()
            const next = e.key === 'Home' ? 0 : e.key === 'End' ? views.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + views.length) % views.length
            changeView(views[next][0]); document.getElementById(`explorer-tab-${views[next][0]}`)?.focus()
          }}><span className={styles.tabNumber} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{label}</button>)}
      </div>

      {view === 'understand' && <section id="explorer-understand" role="tabpanel" aria-labelledby="explorer-tab-understand" className={styles.panel}>
        <div className={styles.brief}>
          <div><p className={styles.eyebrow}>THE CASE BRIEF</p><h3>{system.name}</h3><p>{system.description}</p><p>{system.question}</p></div>
          <Button onClick={() => changeView('flow')}>Explore the request <span aria-hidden>→</span></Button>
        </div>
        <div className={styles.requirements}>{system.revision.requirements.map(([label, text]) => <div key={label} className={styles.card}><p className={styles.eyebrow}>{label} requirements</p><p>{text}</p></div>)}</div>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>ASK BEFORE YOU DESIGN</p><h3>Questions that shape this design.</h3></div>{sourceLinks[system.discoverySection] && <a href={sourceLinks[system.discoverySection]}>Read the original section ↗</a>}</div>
        <div className={styles.discovery}>{system.discovery.map((item, i) => <section className={styles.discoveryCard} key={item.question}>
          <span className={styles.questionNumber}>{String(i + 1).padStart(2, '0')}</span>
          <div><h4>{item.question}</h4><div className={styles.discoveryColumns}><div><span className={styles.smallLabel}>THE ANSWER</span><p>{item.answer}</p></div><div><span className={styles.smallLabel}>WHAT IT CHANGES</span><p>{item.decision}</p></div></div></div>
        </section>)}</div>
        <div className={styles.callout}><strong>The boundary to remember</strong><p>{system.revision.remember}</p><p>{system.scope}</p></div>
      </section>}

      {view === 'flow' && <section id="explorer-flow" role="tabpanel" aria-labelledby="explorer-tab-flow" className={styles.panel}>
        <div className={styles.flowToolbar}><div><p className={styles.eyebrow}>FOLLOW ONE REQUEST</p><h3>Choose an outcome. Trace the decisions.</h3></div>
          <label className={styles.scenarioLabel}>Scenario<select value={scenario.id} onChange={(e) => switchScenario(e.target.value)}>{system.scenarios.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
        </div>
        <div className={styles.request}><span className={styles.smallLabel}>{system.requestLabel}</span><p>{payload(scenario.stages[0].input && typeof scenario.stages[0].input === 'object' ? (scenario.stages[0].input as Record<string, unknown>).message ?? (scenario.stages[0].input as Record<string, unknown>).question ?? (scenario.stages[0].input as Record<string, unknown>).request ?? system.question : system.question)}</p></div>
        <div className={styles.flowGrid}>
          <section className={styles.architecture} aria-labelledby="native-map-title">
            <div className={styles.cardHeading}><div><h4 id="native-map-title">The architecture</h4><p>Select a component to see its role.</p></div><button type="button" className={styles.iconButton} aria-label="Reset walkthrough" onClick={() => { setPlaying(false); setStep(0); setVisited([0]); setDetail('story') }}>↺</button></div>
            <ExplorerGraph system={system} scenario={scenario} step={index} visited={visited} select={choose} />
            <div className={styles.legend}><span><i className={styles.currentDot} />Current</span><span><i className={styles.visitedDot} />Visited</span><span><i />Skipped</span><span>Scroll the map sideways ↔</span></div>
            <div className={styles.player}><button type="button" aria-pressed={playing} onClick={() => { if (index === last) choose(0); setPlaying(!playing) }}>{playing ? 'Ⅱ Pause' : '▷ Run flow'}</button><div><div className={styles.playerLabels}><span>Stage {index + 1} / {scenario.stages.length}</span><span>{visited.length} visited</span></div><progress max={scenario.stages.length} value={visited.length} aria-label="Stages visited" /></div></div>
          </section>
          <section className={styles.stageCard} aria-labelledby="native-stage-title">
            <div className={styles.stageTop}><span className={styles.eyebrow}>STAGE {String(index + 1).padStart(2, '0')} OF {String(scenario.stages.length).padStart(2, '0')}</span><span className={styles.stageNumber}>{String(index + 1).padStart(2, '0')}</span></div>
            <h3 id="native-stage-title">{current.title}</h3><p className={styles.component}>{current.component}</p>
            <div role="tablist" aria-label="Stage details" className={styles.detailTabs}>{([['story', 'What & why'], ['checks', 'Checks'], ['example', 'Example']] as const).map(([id, label], i) => <button key={id} type="button" id={`native-detail-${id}`} role="tab" aria-controls="native-stage-detail" aria-selected={detail === id} tabIndex={detail === id ? 0 : -1} onClick={() => setDetail(id)} onKeyDown={(e) => {
              if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
              e.preventDefault(); const ids: Detail[] = ['story', 'checks', 'example']; const next = ids[(i + (e.key === 'ArrowRight' ? 1 : -1) + 3) % 3]; setDetail(next); document.getElementById(`native-detail-${next}`)?.focus()
            }}>{label}</button>)}</div>
            <div id="native-stage-detail" role="tabpanel" aria-labelledby={`native-detail-${detail}`} className={styles.detailContent}>
              {detail === 'story' && <><div><span className={styles.smallLabel}>WHAT IT DOES</span><p>{current.what}</p></div><div><span className={styles.smallLabel}>WHY IT EXISTS</span><p>{current.why}</p></div><div className={styles.nextNote}><span className={styles.smallLabel}>WHAT HAPPENS NEXT</span><p>{current.next}</p></div></>}
              {detail === 'checks' && <>{current.checks.map((c, i) => <div key={i} className={styles.check}><span>{c.kind}</span><p>{c.text}</p></div>)}<p className={styles.caption}>Exact controls and semantic evaluation are different checks.</p></>}
              {detail === 'example' && <><span className={styles.smallLabel}>INPUT / REQUEST</span><pre>{payload(current.input)}</pre><span className={styles.smallLabel}>OUTPUT / RESULT</span><pre>{payload(current.output)}</pre><p className={styles.caption}>Illustrative payloads, not live customer data.</p></>}
            </div>
            <div className={styles.stageActions}><Button variant="secondary" disabled={index === 0} onClick={() => choose(index - 1)}>← Previous</Button><Button onClick={() => index === last ? changeView('revision') : choose(index + 1)}>{index === last ? 'Review the system' : 'Next stage'} →</Button></div>
          </section>
        </div>
        <div className={styles.outcome} role="status"><span className={styles.smallLabel}>{index === last ? 'SCENARIO OUTCOME' : 'CURRENT POSITION'}</span><p>{index === last ? scenario.outcome : `${current.short} · ${current.component}`}</p><span className={styles.caption}>← → step · R revision · E explore</span></div>
        <div className={styles.stagePicker} role="group" aria-label="Numbered stages">{scenario.stages.map((s, i) => <button type="button" key={i} aria-current={index === i ? 'step' : undefined} onClick={() => choose(i)}><span>{visited.includes(i) && index !== i ? '✓ ' : ''}{String(i + 1).padStart(2, '0')}</span>{s.short}</button>)}</div>
      </section>}

      {view === 'revision' && <section id="explorer-revision" role="tabpanel" aria-labelledby="explorer-tab-revision" className={`${styles.panel} ${styles.revision}`}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>RAPID RECALL</p><h3>The answer you can say out loud.</h3></div><div className={styles.revisionActions}><Button variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(system.revision.pitch); setNotice('Interview answer copied.') } catch { setNotice('Copy is unavailable in this browser. Select the spoken answer to copy it.') } }}>Copy answer</Button><Button variant="secondary" onClick={() => window.print()}>Print revision</Button></div></div>
        <div className={styles.pitch}><span className={styles.eyebrow}>THE 60–90 SECOND ANSWER</span><p>{system.revision.pitch}</p></div>
        <div className={styles.revisionFlow}>{system.revision.flow}</div>
        <div className={styles.requirements}>{system.revision.requirements.map(([label, text]) => <div key={label} className={styles.card}><span className={styles.smallLabel}>{label} requirements</span><p>{text}</p></div>)}</div>
        <div className={styles.revisionGrid}><div className={styles.card}><h4>Ask before you design</h4><ol>{system.revision.discovery.map((q) => <li key={q}>{q}</li>)}</ol></div><div className={styles.card}><h4>One trade-off</h4><p>{system.revision.tradeoff}</p><h4 className={styles.subheading}>One failure to handle</h4><p>{system.revision.failure}</p></div></div>
        <div className={styles.opsGrid}>{system.revision.ops.map(([label, text]) => <div key={label} className={styles.card}><span className={styles.smallLabel}>{label}</span><p>{text}</p></div>)}</div>
        <div className={styles.callout}><strong>{system.revision.remember}</strong></div>
      </section>}

      {view === 'sources' && <section id="explorer-sources" role="tabpanel" aria-labelledby="explorer-tab-sources" className={styles.panel}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>CONTENT & SOURCES</p><h3>From the original lesson to this explorer.</h3></div><a href={`/explorers/${system.id}.html`} download>Download standalone HTML ↓</a></div>
        <div className={styles.callout}><strong>Source-grounded architecture, labelled teaching examples.</strong><p>{system.provenance}</p></div>
        <div className={styles.sourceMap}>{system.sourceMap.map((item) => <div key={item.section}>{sourceLinks[item.section] ? <a href={sourceLinks[item.section]}>{item.section} ↗</a> : <h4>{item.section}</h4>}<span>{item.where}</span><p>{item.note}</p></div>)}</div>
        <div className={styles.card}><h4>Scope and added design choices</h4><ul>{system.limitations.map((line) => <li key={line}>{line}</li>)}</ul></div>
        {data.sources.map((source) => <div className={styles.sourceNote} key={source.id}><h4>{source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a> : source.title}</h4><p>{source.note}</p>{source.file && <code>{source.file}</code>}</div>)}
      </section>}
      {views.filter(([id]) => id !== view).map(([id]) => <div key={id} id={`explorer-${id}`} role="tabpanel" aria-labelledby={`explorer-tab-${id}`} hidden />)}
      <footer className={styles.footer}><span>Illustrative walkthrough · no live model or tool calls</span><button type="button" onClick={() => changeView('sources')}>Content & sources ↗</button></footer>
      <p className={styles.notice} role="status" aria-live="polite">{notice}</p>
    </div>
  )
}
