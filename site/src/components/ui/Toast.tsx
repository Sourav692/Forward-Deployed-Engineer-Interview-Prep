'use client'

/**
 * Toasts. `toast()` is a plain function that dispatches a window event, so any client
 * component can call it without a context provider. Mount one `<Toaster />` per layout.
 *
 * The container is a permanent `role="status"` live region: it exists before any
 * message arrives, so screen readers announce each toast politely.
 */
import { useEffect, useState } from 'react'
import { cx, focusRing } from './cx'

export type ToastTone = 'success' | 'error' | 'info'

interface ToastMsg {
  id: number
  text: string
  tone: ToastTone
}

const TOAST_EVENT = 'fd:toast'
const TOAST_MS = 4000

export function toast(text: string, tone: ToastTone = 'success') {
  window.dispatchEvent(new CustomEvent<Omit<ToastMsg, 'id'>>(TOAST_EVENT, { detail: { text, tone } }))
}

const toneClass: Record<ToastTone, string> = {
  success: 'border-success/40 bg-success-soft',
  error: 'border-danger/40 bg-danger-soft',
  info: 'border-border bg-surface',
}

export function Toaster() {
  const [items, setItems] = useState<ToastMsg[]>([])
  useEffect(() => {
    const on = (e: Event) => {
      const { text, tone } = (e as CustomEvent<Omit<ToastMsg, 'id'>>).detail
      const id = Date.now() + Math.random()
      setItems((xs) => [...xs.slice(-2), { id, text, tone }])
      window.setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), TOAST_MS)
    }
    window.addEventListener(TOAST_EVENT, on)
    return () => window.removeEventListener(TOAST_EVENT, on)
  }, [])
  const dismiss = (id: number) => setItems((xs) => xs.filter((x) => x.id !== id))
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6">
      {items.map((t) => (
        <div
          key={t.id}
          className={cx(
            'pointer-events-auto flex max-w-sm items-start gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium text-text shadow-[var(--shadow-lg)]',
            toneClass[t.tone],
          )}
        >
          <span className="min-w-0 flex-1">
            {t.tone === 'error' && <span className="sr-only">Error: </span>}
            {t.text}
          </span>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className={cx('-mr-1 rounded-sm px-1 text-muted hover:text-text', focusRing)}>
            <svg viewBox="0 0 16 16" aria-hidden className="size-4">
              <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
