import Link from 'next/link'
import type { CurriculumModule } from '@/lib/curriculum-types'
import { formatMinutes, learnHref, moduleInput } from '@/lib/learn'
import { Tag, cx, focusRing } from '@/components/ui'
import { ModuleProgress, ModuleStatusBadge } from './ProgressIslands'

/**
 * ModuleCard (FE-06): one module row on a track page, with code, title, status,
 * effort and progress. The title link is stretched over the row (one tab stop).
 */
export function ModuleCard({ module: mod }: { module: CurriculumModule }) {
  const input = moduleInput(mod)
  const gap = mod.status === 'coming-soon' || mod.status === 'on-hold'
  return (
    <article className="relative flex flex-col gap-2 rounded-md border border-border bg-bg px-3 py-3 transition-colors duration-150 hover:bg-surface-2 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="w-9 shrink-0 text-xs font-semibold tabular-nums text-subtle">{mod.code}</span>
          <h3 className="min-w-0 text-sm font-semibold leading-snug">
            <Link href={learnHref.module(mod)} className={cx('rounded-sm after:absolute after:inset-0 after:rounded-md hover:text-accent', focusRing)}>
              {mod.title}
            </Link>
          </h3>
        </div>
        <p className="mt-0.5 pl-11 text-xs text-muted">
          {formatMinutes(mod.estMinutes)}
          {input.reading.length > 0 && ` · ${input.reading.length} ${input.reading.length === 1 ? 'lesson' : 'lessons'}`}
        </p>
      </div>
      <div className="relative z-10 flex flex-wrap items-center gap-2 pl-11 sm:pl-0">
        {mod.status === 'partly' && <Tag>Partly ready</Tag>}
        <ModuleStatusBadge input={input} size="xs" />
        {!gap && (
          <div className="w-40">
            <ModuleProgress input={input} compact />
          </div>
        )}
      </div>
    </article>
  )
}
