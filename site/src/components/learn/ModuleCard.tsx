import Link from 'next/link'
import type { CurriculumModule } from '@/lib/curriculum-types'
import { formatMinutes, learnHref, moduleInput, moduleTime } from '@/lib/learn'
import { Tag, cx, focusRing } from '@/components/ui'
import { ModulePathFlag } from './PathFlagIslands'
import { ModuleProgress, ModuleStatusBadge } from './ProgressIslands'
import { moduleTag } from '@/lib/curriculum-href'
import { SHOW_STUDY_TIME } from '@/lib/study-time'

/**
 * ModuleCard (FE-06): one module row on a track page, with code, title, status,
 * effort and progress. The title link is stretched over the row (one tab stop).
 */
export function ModuleCard({ module: mod }: { module: CurriculumModule }) {
  const input = moduleInput(mod)
  const gap = mod.status === 'coming-soon' || mod.status === 'on-hold'
  return (
    <article className="relative flex flex-col gap-2 rounded-md border border-border bg-bg px-3 py-3 transition-colors duration-150 hover:bg-surface-2 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1 sm:min-w-56">
        <div className="flex items-baseline gap-2">
          {moduleTag(mod) && <span className="min-w-9 shrink-0 text-xs font-semibold tabular-nums text-subtle">{moduleTag(mod)}</span>}
          <h3 className="cb-small-head min-w-0 text-sm font-semibold leading-snug">
            <Link href={learnHref.module(mod)} className={cx('rounded-sm after:absolute after:inset-0 after:rounded-md hover:text-accent', focusRing)}>
              {mod.title}
            </Link>
          </h3>
        </div>
        {/* A scaffold module (Coming soon, no estimate) has no time to show. */}
        {(SHOW_STUDY_TIME ? moduleTime(mod).total > 0 : input.reading.length > 0) && (
          <p className="mt-0.5 pl-11 text-xs text-muted">
            {[
              ...(SHOW_STUDY_TIME ? [formatMinutes(moduleTime(mod).total)] : []),
              ...(input.reading.length > 0 ? [`${input.reading.length} ${input.reading.length === 1 ? 'lesson' : 'lessons'}`] : []),
            ].join(', ')}
          </p>
        )}
      </div>
      <div className="relative z-10 flex min-w-0 flex-wrap items-center gap-2 pl-11 sm:pl-0">
        <ModulePathFlag moduleSlug={mod.slug} size="xs" />
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
