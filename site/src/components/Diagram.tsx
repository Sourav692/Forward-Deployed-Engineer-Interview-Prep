'use client'

import { useEffect, useId, useRef, useState } from 'react'

/**
 * Renders a ```mermaid fence as a diagram.
 *
 * Mermaid is imported inside the effect rather than at module scope so its ~500KB
 * only loads on pages that actually contain a diagram — and only once the answer
 * key holding it is revealed, since that is when this component first mounts.
 *
 * Two behaviours are load-bearing:
 *  - `suppressErrorRendering` stops mermaid injecting its own error node into the
 *    DOM on a bad graph, which would scribble outside React's tree. A failed parse
 *    falls back to showing the source, so the content is never simply missing.
 *  - The theme lives as a class on `<html>` and is toggled at runtime, so an
 *    observer re-renders the SVG on a flip. Mermaid bakes colours into the markup;
 *    without this, a diagram rendered in light mode stays dark-on-dark afterwards.
 */
/**
 * Resolves a CSS custom property to a hex colour.
 *
 * Going through a canvas looks roundabout, but the tokens in `globals.css` are
 * `oklch()` and `getComputedStyle` serialises those to `lab()` — a notation
 * mermaid's colour library cannot parse. Rasterising one pixel converts any colour
 * space to plain sRGB, so the diagram gets the site's exact palette either way.
 */
function token(name: string): string {
  const probe = document.createElement('div')
  probe.style.color = `var(${name})`
  document.body.appendChild(probe)
  const resolved = getComputedStyle(probe).color
  probe.remove()

  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return resolved
  ctx.fillStyle = resolved
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

/**
 * Mermaid's stock palettes (lavender nodes on pale yellow) read as a foreign object
 * on this page, so the diagram is drawn from the site's own tokens instead.
 *
 * Deliberately no accent: `globals.css` reserves the indigo for interactive
 * affordances and progress, and a diagram is neither.
 */
function themeVariables(dark: boolean) {
  const text = token('--text')
  const line = token('--text-muted')
  const surface = token('--surface-2')
  const cluster = token('--bg')

  return {
    darkMode: dark,
    fontFamily: 'inherit',
    fontSize: '15px',
    background: token('--surface'),
    primaryColor: surface,
    primaryTextColor: text,
    primaryBorderColor: token('--border-strong'),
    secondaryColor: cluster,
    tertiaryColor: cluster,
    mainBkg: surface,
    nodeBorder: token('--border-strong'),
    nodeTextColor: text,
    textColor: text,
    titleColor: text,
    lineColor: line,
    edgeLabelBackground: token('--surface'),
    clusterBkg: cluster,
    clusterBorder: token('--border'),
  }
}

export function Diagram({ code }: { code: string }) {
  // `useId` contains characters that are illegal in a DOM id and in the selector
  // mermaid builds from it, so keep only what survives both.
  const seed = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [svg, setSvg] = useState('')
  const [failed, setFailed] = useState(false)
  const placeholder = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  // The SVG's natural width when it is too wide for its column to read (see FullSize), else 0.
  const [natural, setNatural] = useState(0)

  useEffect(() => {
    const el = box.current
    if (!svg || !el) return
    const measure = () => {
      const width = el.querySelector('svg')?.viewBox.baseVal?.width ?? 0
      setNatural(width > el.clientWidth * 1.5 ? Math.round(width) : 0)
    }
    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(el)
    return () => resize.disconnect()
  }, [svg])

  useEffect(() => {
    let cancelled = false
    let visible = false
    let rendered: 'dark' | 'light' | null = null

    async function render() {
      if (!visible) return
      const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      if (theme === rendered) return
      rendered = theme

      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          suppressErrorRendering: true,
          fontFamily: 'inherit',
          theme: 'base',
          themeVariables: themeVariables(theme === 'dark'),
          // Mermaid's default fits the SVG to its column (ENH-24, PQ-13). A diagram that
          // shrinks too far to read gets an "Open full size" dialog instead (FullSize).
        })
        const result = await mermaid.render(`mmd-${seed}-${theme}`, code)
        if (!cancelled) {
          setSvg(result.svg)
          setFailed(false)
        }
      } catch {
        if (!cancelled) {
          rendered = null
          setFailed(true)
        }
      }
    }

    // Mermaid and its layout engine are about 1.5 MB, and drawing every diagram on load
    // blocked the main thread for seconds on long case pages (audit check PR-17). So a
    // diagram draws when it comes near the viewport, or when the page is printed.
    const show = () => {
      if (visible) return
      visible = true
      void render()
    }
    const nearby = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        nearby.disconnect()
        show()
      }
    }, { rootMargin: '600px 0px' })
    if (placeholder.current) nearby.observe(placeholder.current)
    else show()
    window.addEventListener('beforeprint', show)

    const observer = new MutationObserver(() => void render())
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      cancelled = true
      nearby.disconnect()
      observer.disconnect()
      window.removeEventListener('beforeprint', show)
    }
  }, [code, seed])

  if (failed) {
    return (
      <figure className="my-1 space-y-1.5">
        <pre className="code-block" tabIndex={0}>
          <code>{code}</code>
        </pre>
        <figcaption className="text-[0.75rem] text-subtle">
          This diagram could not be drawn; its source is shown instead.
        </figcaption>
      </figure>
    )
  }

  if (!svg) {
    return (
      <div
        ref={placeholder}
        role="status"
        className="rounded-lg border border-border bg-surface-2 px-4 py-6 text-center text-[0.8125rem] text-subtle"
      >
        Drawing diagram…
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <div
        ref={box}
        role="figure"
        aria-label="Diagram"
        className="mermaid-figure rounded-lg border border-border bg-surface p-3"
        // Mermaid output is generated from the markdown we ship, and is sanitised by
        // its own `securityLevel: 'strict'` before it gets here.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {natural > 0 && <FullSize svg={svg} width={natural} />}
    </div>
  )
}

/**
 * A diagram whose natural width is more than 1.5 times its column shrinks below about
 * two thirds of its size, where labels stop being readable. Such a diagram offers its
 * full size in a dialog (ENH-24). The native <dialog> traps focus and closes on Escape;
 * focus returns to the button. The SVG copy exists only while the dialog is open, so the
 * page never holds two SVGs with the same ids.
 */
function FullSize({ svg, width }: { svg: string; width: number }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal()
  }, [open])

  return (
    <>
      <button
        ref={opener}
        type="button"
        onClick={() => setOpen(true)}
        className="no-print rounded-sm text-[0.8125rem] font-medium text-accent hover:text-accent-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-ring"
      >
        Open full size
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onClose={() => {
          setOpen(false)
          opener.current?.focus()
        }}
        className="m-auto max-h-[90vh] w-[95vw] max-w-none overflow-hidden rounded-xl border border-border bg-bg p-0 text-text backdrop:bg-black/60"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2">
          <h2 id={titleId} className="text-sm font-semibold">
            Diagram at full size
          </h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="rounded-md px-2 py-1 text-sm font-medium text-muted hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-ring"
          >
            Close
          </button>
        </div>
        {open && (
          <div className="max-h-[calc(90vh-3rem)] overflow-auto p-4" tabIndex={0} aria-label="Diagram, scroll to see all of it">
            <div className="mermaid-full" style={{ width }} dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        )}
      </dialog>
    </>
  )
}
