/**
 * PathFlag (FE-10): how a learning path treats one module. No hooks, so it renders in
 * Server Components (path detail page) and inside client islands (`PathFlagIslands`).
 * Each flag has its own border style and a visible text label, so it never relies
 * on colour alone.
 */
import { FLAG_LABEL, type ModuleFlag } from '@/lib/paths'
import { cx } from '@/components/ui'

const FLAG_CLASS: Record<ModuleFlag, string> = {
  required: 'border-accent/50 bg-accent-soft text-accent',
  recommended: 'border-border-strong bg-surface text-text',
  optional: 'border-dashed border-border-strong bg-transparent text-muted',
  later: 'border-dotted border-border-strong bg-transparent text-muted',
  skip: 'border-dashed border-border bg-transparent text-subtle',
}

export function PathFlag({
  flag,
  size = 'sm',
  prefix,
  srPrefix,
  className,
}: {
  flag: ModuleFlag
  size?: 'sm' | 'xs'
  /** Visible text before the label, e.g. "Path:". */
  prefix?: string
  /** Screen-reader-only text before the label, e.g. "On your path:". */
  srPrefix?: string
  className?: string
}) {
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border text-xs font-semibold',
        size === 'sm' ? 'px-2 py-0.5' : 'px-1.5 py-px',
        FLAG_CLASS[flag],
        className,
      )}
    >
      {srPrefix && <span className="sr-only">{srPrefix} </span>}
      {prefix && <span className="font-medium">{prefix}</span>}
      {FLAG_LABEL[flag]}
    </span>
  )
}
