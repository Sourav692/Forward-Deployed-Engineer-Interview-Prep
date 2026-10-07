'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { JourneyBoundary } from './JourneyBoundary'
import styles from './landing.module.css'

// The renderer stays out of the initial HTML and is requested only near the journey.
const JourneyWorld = dynamic(() => import('./JourneyWorld'), { ssr: false })

const SCENES = [
  { title: 'Understand the problem', body: 'Start with the person, the task, and what cannot go wrong. A useful system begins with a useful question.', href: '/start', cta: 'Choose your path', detail: 'Discovery notes become a clear brief.' },
  { title: 'Design the system', body: 'Follow the request through identity, retrieval, and an answer with evidence. Explain why each part belongs.', href: '/design', cta: 'Explore worked designs', detail: 'The brief becomes a connected architecture.' },
] as const

function Island({ scene, x = 0 }: { scene: 0 | 1; x?: number }) {
  return (
    <g transform={`translate(${x} 0)`} className={styles.island}>
      <ellipse cx="325" cy="435" rx="245" ry="35" fill="var(--text)" opacity="0.04" />
      <path d="M68 314 310 185 578 324 338 454Z" fill="var(--border)" />
      <path d="M68 298 310 169 578 308 338 438Z" fill="var(--surface)" stroke="var(--border-strong)" />
      <path d="M68 298v16l270 140v-16Z" fill="var(--surface-2)" stroke="var(--border-strong)" />
      <path d="M338 438v16l240-130v-16Z" fill="var(--accent-soft)" stroke="var(--border-strong)" />
      <g fill="none" stroke="var(--border)" strokeWidth="1">
        <path d="m125 270 270 140m-213-169 270 140m-213-169 270 140m-209-170 263 136" />
        <path d="m135 333 242-129m-180 160 242-129m-180 161 242-130m-180 162 242-130" />
      </g>
      {scene === 0 ? (
        <>
          <g stroke="var(--border-strong)" strokeLinejoin="round">
            <path d="m163 267 117-63 163 85-117 63Z" fill="var(--accent-soft)" />
            <path d="m163 267v21l163 85v-21Z" fill="var(--surface-2)" />
            <path d="m326 352 117-63v21l-117 63Z" fill="var(--border)" />
            <path d="m186 262 78-42 99 52-78 42Z" fill="var(--surface)" />
            <path d="m217 260 43-23m-28 38 43-23m-28 38 28-15" stroke="var(--accent)" strokeWidth="3" />
            <path d="m294 244 28-15 31 16-28 15Z" fill="var(--accent)" stroke="var(--accent)" />
            <path d="m359 302 33-18 43 23-33 18Z" fill="var(--surface)" />
          </g>
          <g transform="translate(430 135)" stroke="var(--border-strong)" strokeLinejoin="round">
            <path d="m0 0 71 37v95L0 95Z" fill="var(--surface-2)" />
            <path d="m0 0 6-4 71 37-6 4Z" fill="var(--surface)" />
            <path d="m71 37 6-4v95l-6 4Z" fill="var(--border)" />
            <path d="m12 26 46 24m-46-5 34 18m-34 3 43 23" stroke="var(--accent)" strokeWidth="4" />
          </g>
          <g fill="var(--accent)" stroke="var(--accent)">
            <circle cx="171" cy="226" r="12" /><path d="M160 244h22l7 37h-36Z" />
            <circle cx="330" cy="195" r="11" /><path d="M320 212h20l6 33h-32Z" />
          </g>
          <g fill="var(--text-muted)" opacity="0.8">
            <circle cx="311" cy="388" r="12" /><path d="M300 405h22l6 25h-34Z" />
          </g>
          <text x="91" y="477" className={styles.mapCaption}>01 / DISCOVERY</text>
        </>
      ) : (
        <>
          <g fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round">
            <path d="m180 294 117-63 114 59-118 64Z" />
            <path d="m297 231 74-40m40 99 70-39m-188 103 84 44" strokeDasharray="5 7" />
          </g>
          <g stroke="var(--border-strong)" strokeLinejoin="round">
            <path d="m135 256 44-24 47 25-44 24Z" fill="var(--accent-soft)" />
            <path d="m135 256v42l47 25v-42Z" fill="var(--surface-2)" />
            <path d="m182 281 44-24v42l-44 24Z" fill="var(--border)" />
            <path d="m253 191 44-24 47 25-44 24Z" fill="var(--accent-soft)" />
            <path d="m253 191v42l47 25v-42Z" fill="var(--surface-2)" />
            <path d="m300 216 44-24v42l-44 24Z" fill="var(--border)" />
            <path d="m367 250 44-24 47 25-44 24Z" fill="var(--accent)" stroke="var(--accent)" />
            <path d="m367 250v42l47 25v-42Z" fill="var(--accent-soft)" />
            <path d="m414 275 44-24v42l-44 24Z" fill="var(--border)" />
            <path d="m249 319 44-24 47 25-44 24Z" fill="var(--accent-soft)" />
            <path d="m249 319v30l47 25v-30Z" fill="var(--surface-2)" />
            <path d="m296 344 44-24v30l-44 24Z" fill="var(--border)" />
          </g>
          <g stroke="var(--accent)" strokeWidth="3" fill="none">
            <path d="m146 271 23 12m95-77 23 12m-27 116 23 12" />
            <path d="m347 148 35 18v42l-35-18Z" fill="var(--surface)" />
            <path d="m358 172 8 13 13-3" />
            <path d="m457 216 35 18v42l-35-18Z" fill="var(--surface)" />
            <path d="m467 239 14 7m-14 5 14 7" />
          </g>
          <g fill="var(--text-muted)" fontSize="11" fontWeight="550">
            <text x="120" y="347">Identity</text><text x="258" y="157">Retrieval</text>
            <text x="447" y="326">Answer</text><text x="243" y="404">Evidence</text>
          </g>
          <text x="91" y="477" className={styles.mapCaption}>02 / ARCHITECTURE</text>
        </>
      )}
    </g>
  )
}

export function LearningJourney() {
  const root = useRef<HTMLElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const requestRender = useRef<(() => void) | null>(null)
  const [staticView, setStaticView] = useState(false)
  const [eligible, setEligible] = useState(false)
  const [nearViewport, setNearViewport] = useState(false)
  const [ready, setReady] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const handleUnavailable = useCallback(() => { setUnavailable(true); setReady(false) }, [])
  const handleReady = useCallback(() => setReady(true), [])
  const handleInvalidate = useCallback((render: (() => void) | null) => {
    requestRender.current = render
    if (!render) setReady(false)
  }, [])

  useEffect(() => {
    const element = root.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setNearViewport(entry.isIntersecting), { rootMargin: '200px 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const element = root.current
    if (!element) return
    const media = window.matchMedia('(min-width: 960px) and (prefers-reduced-motion: no-preference)')
    let frame = 0
    let enabled = false

    function update() {
      frame = 0
      if (!element || !panel.current || !enabled) return
      const bounds = element.getBoundingClientRect()
      const travel = Math.max(1, bounds.height - panel.current.offsetHeight)
      const next = Math.max(0, Math.min(1, (88 - bounds.top) / travel))
      // Render a frame only when the camera moves. No React renders per scroll frame.
      if (progress.current !== next) { progress.current = next; requestRender.current?.() }
      element.style.setProperty('--journey-progress', String(next))
      const scene = next < 0.5 ? '0' : '1'
      element.dataset.scene = scene
      element.querySelectorAll<HTMLButtonElement>('[data-scene-button]').forEach((button) => {
        if (button.dataset.sceneButton === scene) button.setAttribute('aria-current', 'step')
        else button.removeAttribute('aria-current')
      })
    }
    function schedule() {
      if (!frame && enabled) frame = requestAnimationFrame(update)
    }
    function syncMode() {
      enabled = media.matches && !staticView && !unavailable
      element!.dataset.motion = enabled ? 'true' : 'false'
      setEligible(enabled)
      schedule()
    }
    syncMode()
    media.addEventListener('change', syncMode)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      media.removeEventListener('change', syncMode)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [staticView, unavailable])

  function goToScene(index: number) {
    if (!root.current || !panel.current) return
    const bounds = root.current.getBoundingClientRect()
    const travel = bounds.height - panel.current.offsetHeight
    window.scrollTo({ top: window.scrollY + bounds.top - 88 + travel * index, behavior: 'smooth' })
  }

  return (
    <section aria-labelledby="journey-heading" className="mt-16 sm:mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="journey-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">From a question to a system.</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">Follow one idea from the customer’s desk to the architecture behind the answer.</p>
        </div>
        <a href="#areas" className="inline-flex min-h-11 items-center rounded-md text-sm font-semibold text-accent underline underline-offset-4">Skip journey <span aria-hidden className="ml-2">↓</span></a>
      </div>
      <section ref={root} aria-label="Discovery to architecture journey" className={styles.journeyTrack} data-motion="false" data-scene="0">
        <div ref={panel} className={styles.journeyPanel}>
          <div className={styles.journeyHeader}>
            <p className="text-xs font-medium text-muted">{unavailable ? 'Showing the static journey.' : 'Two scenes. One connected idea.'}</p>
            {!unavailable && <Button variant="ghost" onClick={() => setStaticView(!staticView)} aria-pressed={staticView} className={styles.viewToggle}>
              {staticView ? 'Use 3D view' : 'Use static view'}
            </Button>}
          </div>
          <div className={styles.motionLayout}>
            <div className={styles.journeyCopy}>
              {SCENES.map((scene, index) => (
                <article key={scene.title} className={styles.sceneCopy} data-copy-scene={index}>
                  <h3>
                    <button type="button" data-scene-button={index} onClick={() => goToScene(index)} className={styles.sceneButton}>
                      <span className="font-mono text-xs">0{index + 1}</span>
                      <span className="text-xl font-semibold leading-snug">{scene.title}</span>
                    </button>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{scene.body}</p>
                  <Link href={scene.href} className="mt-3 inline-flex min-h-11 items-center rounded-sm text-sm font-semibold text-accent">{scene.cta} <span aria-hidden className="ml-2">→</span></Link>
                </article>
              ))}
              <p className="mt-7 text-xs text-muted">Scroll to follow the idea, or choose a scene.</p>
              <div className={styles.journeyProgress} aria-hidden><span /></div>
            </div>
            <div className={styles.mapWindow} data-ready={ready && eligible && nearViewport}>
              <svg viewBox="0 0 650 510" aria-hidden="true" className={styles.worldPreview}><Island scene={0} /></svg>
              {eligible && nearViewport && <JourneyBoundary onUnavailable={handleUnavailable}>
                <JourneyWorld progress={progress} onInvalidate={handleInvalidate} onReady={handleReady} onUnavailable={handleUnavailable} />
              </JourneyBoundary>}
            </div>
          </div>
          <div className={styles.staticLayout}>
            {SCENES.map((scene, index) => (
              <article key={scene.title} className={styles.staticScene}>
                <svg viewBox="30 110 580 390" role="img" aria-label={scene.detail} className={styles.staticMap}><Island scene={index as 0 | 1} /></svg>
                <div className="px-5 pb-6">
                  <h3 className="text-xl font-semibold">{scene.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{scene.body}</p>
                  <Link href={scene.href} className="mt-3 inline-flex min-h-11 items-center rounded-sm text-sm font-semibold text-accent">{scene.cta} <span aria-hidden className="ml-2">→</span></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <p className="mt-3 text-xs leading-relaxed text-muted">Next: test the system, practise your explanation, and prepare for the interview.</p>
    </section>
  )
}
