'use client'

/**
 * Confirmation dialog on the native `<dialog>` element. `showModal()` makes the rest
 * of the page inert (focus stays inside) and turns Escape into a `cancel` event. On
 * open, focus starts on Cancel for a `danger` dialog and on the confirm button
 * otherwise; on close, it goes back to whatever was focused when the dialog opened.
 */
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from './Button'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  body: ReactNode
  confirmLabel: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, body, confirmLabel, cancelLabel = 'Cancel', danger, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const bodyId = useId()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      d.showModal()
      // Start on the safe choice for destructive actions, on the confirm button otherwise.
      ;(danger ? cancelRef : confirmRef).current?.focus()
    }
    if (!open && d.open) d.close()
  }, [open, danger])

  const handleClose = () => {
    const target = returnTo.current
    returnTo.current = null
    if (target?.isConnected) target.focus()
    // Escape or a programmatic close while still "open" counts as cancel.
    if (open) onCancel()
  }

  return (
    <dialog
      ref={ref}
      onClose={handleClose}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-5 text-text shadow-[var(--shadow-lg)] backdrop:bg-black/40"
    >
      <h2 id={titleId} className="text-lg font-semibold">
        {title}
      </h2>
      <div id={bodyId} className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
        {body}
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} ref={confirmRef}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
