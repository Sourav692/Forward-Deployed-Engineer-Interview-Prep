'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import DIAGRAMS from '../../public/diagrams/index.json'
import { diagramAlt, diagramKey } from '@/lib/diagram-key'
import { diagramThemeVariables } from '@/lib/diagram-theme'

const SIZES: Record<string, number[]> = DIAGRAMS

/**
 * A ```mermaid fence as a diagram (ENH-24b). The sync draws every fence to two static
 * SVG files, light and dark (scripts/render-diagrams.mjs), so the page's HTML holds the
 * diagram as images with a text alternative and needs no JavaScript to show it; CSS
 * picks the file for the theme. A fence without files (new, not yet synced) is drawn in
 * the browser instead, as below.
 */
/** True when the sync drew this fence to static files, so it can render without measuring. */
export const hasStaticDiagram = (code: string): boolean => diagramKey(code) in SIZES

export function Diagram({ code }: { code: string }) {
  const key = diagramKey(code)
  const size = SIZES[key]
  return size ? <StaticDiagram id={key} alt={diagramAlt(code)} width={size[0]} height={size[1]} /> : <DrawnDiagram code={code} />
}

function StaticDiagram({ id, alt, width, height }: { id: string; alt: string; width: number; height: number }) {
  const box = useRef<HTMLDivElement>(null)
  const wide = useTooWide(box, width)
  const images = (natural: boolean) =>
    (['light', 'dark'] as const).map((theme) => (
      // A plain <img>: next/image does not serve SVG, and these are already final files.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={theme}
        src={`/diagrams/${id}-${theme}.svg`}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={`diagram-${theme} mx-auto h-auto ${natural ? 'max-w-none' : 'max-w-full'}`}
      />
    ))
  return (
    <div className="space-y-1.5">
      <div ref={box} role="figure" aria-label="Diagram" className="mermaid-figure rounded-lg border border-border bg-surface p-3">
        {images(false)}
      </div>
      {wide && <FullSize width={width}>{images(true)}</FullSize>}
    </div>
  )
}

/** True when a diagram this wide would shrink below about two thirds to fit `box` (see FullSize). */
function useTooWide(box: React.RefObject<HTMLDivElement | null>, width: number): boolean {
  const [wide, setWide] = useState(false)
  useEffect(() => {
    const el = box.current
    if (!el || !width) return
    const measure = () => setWide(width > el.clientWidth * 1.5)
    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(el)
    return () => resize.disconnect()
  }, [box, width])
  return wide
}

/**
 * The browser-drawn fallback for a fence the sync has not drawn yet.
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
function DrawnDiagram({ code }: { code: string }) {
  // `useId` contains characters that are illegal in a DOM id and in the selector
  // mermaid builds from it, so keep only what survives both.
  const seed = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [svg, setSvg] = useState('')
  const [failed, setFailed] = useState(false)
  const placeholder = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const [natural, setNatural] = useState(0)
  useEffect(() => {
    if (svg) setNatural(Math.round(box.current?.querySelector('svg')?.viewBox.baseVal?.width ?? 0))
  }, [svg])
  const wide = useTooWide(box, natural)

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
          themeVariables: diagramThemeVariables(theme === 'dark', 'inherit'),
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
      {wide && (
        <FullSize width={natural}>
          <div className="mermaid-full" style={{ width: natural }} dangerouslySetInnerHTML={{ __html: svg }} />
        </FullSize>
      )}
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
function FullSize({ width, children }: { width: number; children: ReactNode }) {
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
            <div style={{ width }}>{children}</div>
          </div>
        )}
      </dialog>
    </>
  )
}
