'use client'

import { useEffect, useRef, useState } from 'react'
import { LabCard } from './LabCard'

/** Starting height before the lab reports its own (plan §6). */
const START_HEIGHT = 480
/** A lab that has not reported a height this long after its frame comes into view has failed. */
const REPORT_TIMEOUT_MS = 15000

const theme = () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light')

/**
 * An interactive lab inside a lesson (Phase 2, FE-10). The lab is a static page under /labs,
 * framed with `sandbox="allow-scripts"`: it runs, but without this origin, so it cannot read
 * the learner's progress. It posts `{ labHeight }` and the frame takes that height, so the lab
 * shows without an inner scrollbar; messages from anything but this frame are ignored. A
 * sandboxed page cannot read the site's theme either, so the frame sends it once the lab has
 * reported (its script is running by then) and again whenever it changes. A lab that has not
 * reported 15 s after coming into view (when a lazy frame loads) falls back to the LabCard link.
 */
export function LabFrame({ src, title }: { src: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(START_HEIGHT)
  const [state, setState] = useState<'loading' | 'sized' | 'failed'>('loading')
  const reported = useRef(false)

  useEffect(() => {
    const send = () => frame.current?.contentWindow?.postMessage({ theme: theme() }, '*')
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return
      const h = (e.data as { labHeight?: unknown } | null)?.labHeight
      if (typeof h !== 'number' || !Number.isFinite(h)) return
      setHeight(Math.min(Math.max(Math.ceil(h), 200), 6000))
      if (!reported.current) {
        reported.current = true
        send()
      }
      setState('sized')
    }
    const observer = new MutationObserver(send)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    window.addEventListener('message', onMessage)
    return () => {
      observer.disconnect()
      window.removeEventListener('message', onMessage)
    }
  }, [])

  useEffect(() => {
    const el = frame.current
    if (!el || state !== 'loading') return
    let timer: ReturnType<typeof setTimeout> | undefined
    const seen = new IntersectionObserver((entries) => {
      if (!entries.some((x) => x.isIntersecting)) return
      seen.disconnect()
      timer = setTimeout(() => setState((s) => (s === 'loading' ? 'failed' : s)), REPORT_TIMEOUT_MS)
    })
    seen.observe(el)
    return () => {
      seen.disconnect()
      clearTimeout(timer)
    }
  }, [state])

  if (state === 'failed') return <LabCard src={src} title={title} />
  return (
    <figure className="cb-lab-frame">
      <iframe
        ref={frame}
        src={src}
        title={`${title}, interactive lab`}
        sandbox="allow-scripts"
        loading="lazy"
        style={{ height }}
      />
      <figcaption>
        Interactive lab: {title}.{' '}
        <a href={src} target="_blank" rel="noopener" className="underline underline-offset-2">
          Open full screen<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </figcaption>
    </figure>
  )
}
