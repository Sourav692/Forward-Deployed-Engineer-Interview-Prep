'use client'

/**
 * Countdown for a mock round (FE-15). It counts down to a fixed end time rather than
 * subtracting a second per tick, because browsers slow `setInterval` in background
 * tabs; the clock stays right when the learner switches away to write an answer.
 * It never ends the round on its own: at zero it says so and keeps the page as it is.
 */
import { useEffect, useRef, useState } from 'react'
import { Button, cx } from '@/components/ui'

export function MockTimer({ minutes }: { minutes: number }) {
  const total = minutes * 60
  const [left, setLeft] = useState(total)
  const [running, setRunning] = useState(false)
  const endAt = useRef(0)

  useEffect(() => {
    if (!running) return
    endAt.current = Date.now() + left * 1000
    const id = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000))
      setLeft(next)
      if (next === 0) setRunning(false)
    }, 250)
    return () => window.clearInterval(id)
    // `left` is read only when the timer starts or resumes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  const done = left === 0

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
      <span
        role="timer"
        aria-label={`${Number(mm)} minutes ${Number(ss)} seconds left`}
        className={cx('font-mono text-2xl font-semibold tabular-nums', done && 'text-danger')}
      >
        {mm}:{ss}
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => setRunning((r) => !r)} disabled={done}>
          {running ? 'Pause' : left === total ? 'Start timer' : 'Resume'}
        </Button>
        <Button variant="ghost" onClick={() => (setRunning(false), setLeft(total))} disabled={left === total}>
          Reset
        </Button>
      </div>
      {/* Announced once when time runs out; the ticking clock itself stays silent. */}
      <p role="status" className="text-sm text-muted">
        {done ? 'Time is up. Wrap up in one sentence, then score the round.' : `${minutes}-minute round`}
      </p>
    </div>
  )
}
