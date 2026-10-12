import { cx, focusRing } from '@/components/ui/cx'

export type ChipOption = { value: string; label: string }

/**
 * A labelled set of toggle chips. Each chip is a button with `aria-pressed`. With
 * `counts`, each chip shows how many items it would leave, in its accessible name too.
 */
export function ChipGroup({
  label,
  options,
  value,
  onChange,
  counts,
}: {
  label: string
  options: ChipOption[]
  value: string
  onChange: (v: string) => void
  counts?: Record<string, number>
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-subtle" aria-hidden="true">
        {label}
      </span>
      {options.map((o) => {
        const active = o.value === value
        const n = counts?.[o.value]
        return (
          <button
            key={o.value || 'all'}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cx(
              'rounded-full border px-3 py-1 text-sm transition-colors duration-150',
              active ? 'border-accent bg-accent-soft font-semibold text-accent' : 'border-border-strong text-muted hover:bg-surface-2 hover:text-text',
              focusRing,
            )}
          >
            {o.label}
            {n !== undefined && <span className="tabular-nums"> ({n})</span>}
          </button>
        )
      })}
    </div>
  )
}
