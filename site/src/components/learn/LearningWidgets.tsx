'use client'

import { useEffect, useRef } from 'react'

/**
 * A prose chunk that holds the course's learning widgets (a walkthrough, `[data-stepper]`, or an
 * architectural comparison, `[data-comparison]`), ported from the course's
 * `.claude/skills/course-content/standalone/assets/reader.js`; the markup contract is that
 * skill's references/components.md. The server renders every panel with the controls `hidden`,
 * so a reader without script reads all of it. Once script runs, the controls show and one stage
 * or mode shows at a time. A widget that does not match the contract stays static. The cleanup
 * restores the server's markup, so a re-run (new html, Strict Mode) starts clean.
 * Styles: `.learning-widget` in editorial.css.
 */
export function WidgetProse({ html, className }: { html: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = box.current
    if (!root) return
    const off = new AbortController()
    const undo: (() => void)[] = []
    root.querySelectorAll<HTMLElement>('[data-stepper], .walkthrough').forEach((w) => undo.push(stepper(w, off.signal)))
    root.querySelectorAll<HTMLElement>('[data-comparison], .evidence-switcher').forEach((c) => undo.push(comparison(c, off.signal)))
    return () => {
      off.abort()
      undo.forEach((fn) => fn())
    }
  }, [html])

  return <div ref={box} className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

/** Buttons matched one-to-one to panels through aria-controls, or null when the markup breaks the contract. */
function pair(widget: HTMLElement, buttonSel: string, panelSel: string) {
  const buttons = [...widget.querySelectorAll<HTMLButtonElement>(buttonSel)]
  const panels = [...widget.querySelectorAll<HTMLElement>(panelSel)]
  const targets = buttons.map((b) => panels.find((p) => p.id === b.getAttribute('aria-controls')))
  if (!panels.length || buttons.length !== panels.length || targets.some((p) => !p) || new Set(targets).size !== panels.length) return null
  return { buttons, panels, targets: targets as HTMLElement[] }
}

/** Puts back the static fallback: controls hidden, every panel shown, no selection. */
function restore(hide: (HTMLElement | null)[], panels: HTMLElement[], buttons: HTMLButtonElement[], status: HTMLElement) {
  hide.forEach((el) => el && (el.hidden = true))
  panels.forEach((p) => (p.hidden = false))
  buttons.forEach((b) => b.setAttribute('aria-pressed', 'false'))
  status.textContent = ''
}

function stepper(walk: HTMLElement, signal: AbortSignal): () => void {
  const pairs = pair(walk, '[data-step]', '.step-panel')
  const controls = walk.querySelector<HTMLElement>('.step-controls')
  const footer = walk.querySelector<HTMLElement>('.step-footer')
  const previous = walk.querySelector<HTMLButtonElement>('[data-walk="previous"]')
  const next = walk.querySelector<HTMLButtonElement>('[data-walk="next"]')
  const status = walk.querySelector<HTMLElement>('.step-status')
  if (!pairs || !controls || !footer || !previous || !next || !status) return () => {}
  const { buttons, panels, targets } = pairs
  const asked = Number(controls.dataset.columns)
  const columns = Number.isInteger(asked) && asked >= 1 && asked <= 4 ? asked : buttons.length === 4 ? 2 : Math.min(3, buttons.length)
  controls.style.setProperty('--step-columns', String(columns))
  let current = 0
  const show = (index: number, announce = true) => {
    current = Math.max(0, Math.min(buttons.length - 1, index))
    panels.forEach((p) => (p.hidden = p !== targets[current]))
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === current)))
    previous.disabled = current === 0
    next.disabled = current === buttons.length - 1
    status.textContent = `Stage ${current + 1} of ${panels.length}`
    // A disabled button drops focus to the body; keep it on the selected stage instead.
    const stuck = (document.activeElement === previous && previous.disabled) || (document.activeElement === next && next.disabled)
    if (announce && stuck) buttons[current].focus({ preventScroll: true })
  }
  buttons.forEach((b, i) => b.addEventListener('click', () => show(i), { signal }))
  previous.addEventListener('click', () => show(current - 1), { signal })
  next.addEventListener('click', () => show(current + 1), { signal })
  controls.hidden = false
  footer.hidden = false
  show(0, false)
  return () => {
    restore([controls, footer], panels, buttons, status)
    previous.disabled = false
    next.disabled = false
  }
}

function comparison(compare: HTMLElement, signal: AbortSignal): () => void {
  const pairs = pair(compare, '[data-mode]', '.mode-panel')
  const controls = compare.querySelector<HTMLElement>('.mode-controls')
  const status = compare.querySelector<HTMLElement>('.switch-status')
  if (!pairs || pairs.buttons.length < 2 || !controls || !status) return () => {}
  const { buttons, panels, targets } = pairs
  const show = (index: number) => {
    panels.forEach((p) => (p.hidden = p !== targets[index]))
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)))
    status.textContent = targets[index].dataset.announcement || `${buttons[index].textContent?.trim()} selected.`
  }
  buttons.forEach((b, i) => b.addEventListener('click', () => show(i), { signal }))
  controls.hidden = false
  show(0)
  return () => restore([controls], panels, buttons, status)
}
