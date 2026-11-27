import Link from 'next/link'
import type { CurriculumModule } from '@/lib/curriculum-types'
import { formatMinutes, learnHref, moduleInput, moduleTime } from '@/lib/learn'
import { Tag, cx, focusRing } from '@/components/ui'
import { ModulePathFlag } from './PathFlagIslands'
import { ModuleProgress, ModuleStatusBadge } from './ProgressIslands'
import { moduleTag } from '@/lib/curriculum-href'
import { SHOW_STUDY_TIME } from '@/lib/study-time'

/**
 * ModuleCard (FE-06): one module on a track page, a square bordered card like the group
 * and track cards (`cb-group-card`), with code, title, objective, status and progress.
 * The title link is stretched over the card (one tab stop). A Coming soon or On hold
 * module gets the dashed `is-soon` card.
 */
export function ModuleCard({ module: mod }: { module: CurriculumModule }) {
  const input = moduleInput(mod)
  const gap = mod.status === 'coming-soon' || mod.status === 'on-hold'
  const facts = [
    ...(SHOW_STUDY_TIME && moduleTime(mod).total > 0 ? [formatMinutes(moduleTime(mod).total)] : []),
    // The progress bar shows the lesson count, so the count appears only where the bar does not.
    ...(gap && input.reading.length > 0 ? [`${input.reading.length} ${input.reading.length === 1 ? 'lesson' : 'lessons'}`] : []),
  ]
  return (
    <article className={cx('cb-group-card relative flex w-full flex-col', gap && 'is-soon')}>
      <div className="relative z-10 flex min-h-6 flex-wrap items-center gap-2">
        {moduleTag(mod) && <span className="text-xs font-semibold tabular-nums text-subtle">{moduleTag(mod)}</span>}
        {mod.status === 'partly' && <Tag>Partly ready</Tag>}
        <ModuleStatusBadge input={input} size="xs" />
        <ModulePathFlag moduleSlug={mod.slug} size="xs" />
      </div>
      <h3 className="cb-small-head mt-3 text-lg font-semibold leading-snug">
        <Link href={learnHref.module(mod)} className={cx('after:absolute after:inset-0 hover:text-accent', focusRing)}>
          {mod.title}
        </Link>
      </h3>
      {mod.objective && <p className="mt-2 line-clamp-3 text-sm text-muted">{mod.objective}</p>}
      {facts.length > 0 && <p className="cb-entry-facts">{facts.map((f) => <span key={f}>{f}</span>)}</p>}
      {!gap && (
        <div className="relative z-10 mt-auto pt-4">
          <ModuleProgress input={input} compact />
        </div>
      )}
    </article>
  )
}
