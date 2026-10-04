'use client'

/**
 * Toasts and the confirmation dialog.
 *
 * `toast()` is a plain function that dispatches a window event, so any island can call
 * it without a context provider. The dialog uses the native `<dialog>` element:
 * `showModal()` gives focus trapping, Escape to close and an inert background for free.
 */
import { useEffect, useRef, useState } from 'react'
import { btn, cx } from './ui'

const TOAST_EVENT = 'fd:demo:toast'
type Tone = 'success' | 'error' | 'info'
interface ToastMsg {
  id: number
  text: string
  tone: Tone
}

export function toast(text: string, tone: Tone = 'success') {
  window.dispatchEvent(new CustomEvent<Omit<ToastMsg, 'id'>>(TOAST_EVENT, { detail: { text, tone } }))
}

export function Toaster() {
  const [items, setItems] = useState<ToastMsg[]>([])
  useEffect(() => {
    const on = (e: Event) => {
      const { text, tone } = (e as CustomEvent<Omit<ToastMsg, 'id'>>).detail
      const id = Date.now() + Math.random()
      setItems((xs) => [...xs.slice(-2), { id, text, tone }])
      window.setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 4000)
    }
    window.addEventListener(TOAST_EVENT, on)
    return () => window.removeEventListener(TOAST_EVENT, on)
  }, [])
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6">
      {items.map((t) => (
        <div
          key={t.id}
          role={t.tone === 'error' ? 'alert' : 'status'}
          className={cx(
            'pointer-events-auto max-w-sm rounded-lg border px-4 py-2.5 text-[0.875rem] font-medium shadow-[var(--shadow-lg)]',
            t.tone === 'success' && 'border-success/40 bg-success-soft',
            t.tone === 'error' && 'border-danger/40 bg-danger-soft',
            t.tone === 'info' && 'border-border bg-surface',
          )}
        >
          {t.text}
        </div>
      ))}
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  body: React.ReactNode
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      onClose={onCancel}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-5 text-text shadow-[var(--shadow-lg)] backdrop:bg-black/40"
    >
      <h2 id="confirm-title" className="text-[1.0625rem] font-semibold">
        {title}
      </h2>
      <div className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{body}</div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className={btn.secondary} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className={danger ? btn.danger : btn.primary} onClick={onConfirm} autoFocus>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
