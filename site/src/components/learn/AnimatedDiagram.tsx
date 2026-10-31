'use client'

import { useEffect, useRef } from 'react'

/** How long each step shows while playing. */
const STEP_MS = 2200
/** Ticks the finished frame holds before playing starts over. */
const HOLD_TICKS = 2

/**
 * An animated diagram in a lesson (Phase 3, FE-13): the course's SVG figure (`.anim`), stepped
 * through by the controller the course's own pages use (scripts/site/theory-anim.js there).
 * The server renders the figure in its finished frame with its controls hidden, so a reader
 * without script sees the whole diagram and the numbered step list. Once script runs, the
 * controls show; the figure plays while at least half of it is on screen and stops when it
 * leaves, until the reader uses a control, after which only the reader plays it. With reduced
 * motion it never plays by itself. Styles: `.anim` in editorial.css.
 */
export function AnimatedDiagram({ html }: { html: string }) {
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fig = box.current?.querySelector<HTMLElement>('.anim')
    return fig ? animate(fig) : undefined
  }, [html])

  return <div ref={box} dangerouslySetInnerHTML={{ __html: html }} />
}

/** Wires one figure's controls; returns the cleanup, which restores the server's markup. */
function animate(fig: HTMLElement): () => void {
  const steps = [...fig.querySelectorAll<HTMLButtonElement>('.anim__steps button')]
  const controls = fig.querySelector<HTMLElement>('.anim__controls')
  const play = fig.querySelector<HTMLButtonElement>('[data-act="play"]')
  const prev = fig.querySelector<HTMLButtonElement>('[data-act="prev"]')
  const next = fig.querySelector<HTMLButtonElement>('[data-act="next"]')
  const tok = fig.querySelector<SVGElement>('.tok')
  const n = steps.length
  if (!controls || !play || !prev || !next || n === 0) return () => {}

  const off = new AbortController()
  const on = (el: Element, fn: () => void) => el.addEventListener('click', fn, { signal: off.signal })
  let cur = n
  let timer: ReturnType<typeof setInterval> | undefined
  let chosen = false

  const show = (k: number) => {
    cur = k
    fig.dataset.step = String(k)
    for (let i = 1; i <= n; i++) fig.classList.toggle(`s${i}`, i <= k)
    steps.forEach((b, i) => (i + 1 === k ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')))
    const at = steps[k - 1]?.dataset.tok
    if (tok && at) tok.style.transform = `translate(${at.split(',').map((v) => `${v}px`).join(', ')})`
  }
  const stop = () => {
    clearInterval(timer)
    timer = undefined
    play.setAttribute('aria-pressed', 'false')
    play.textContent = 'Play'
  }
  const start = () => {
    if (timer) return
    if (cur >= n) show(1)
    play.setAttribute('aria-pressed', 'true')
    play.textContent = 'Pause'
    let rest = 0
    timer = setInterval(() => {
      if (cur < n) show(cur + 1)
      else if (++rest > HOLD_TICKS) {
        rest = 0
        show(1)
      }
    }, STEP_MS)
  }
  const take = (fn: () => void) => () => {
    chosen = true
    fn()
  }

  fig.classList.add('is-anim')
  controls.hidden = false
  show(n)
  on(play, take(() => (timer ? stop() : start())))
  on(prev, take(() => (stop(), show(Math.max(1, cur - 1)))))
  on(next, take(() => (stop(), show(Math.min(n, cur + 1)))))
  steps.forEach((b, i) => on(b, take(() => (stop(), show(i + 1)))))

  let seen: IntersectionObserver | undefined
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    seen = new IntersectionObserver(
      ([e]) => {
        if (chosen) return
        if (e.isIntersecting) start()
        else stop()
      },
      { threshold: 0.5 },
    )
    seen.observe(fig)
  }

  return () => {
    off.abort()
    seen?.disconnect()
    stop()
    delete fig.dataset.step
    fig.classList.remove('is-anim', ...steps.map((_, i) => `s${i + 1}`))
    steps.forEach((b) => b.removeAttribute('aria-current'))
    tok?.style.removeProperty('transform')
    controls.hidden = true
  }
}
