import Link from 'next/link'
import * as repo from '../repo'
import { ModuleStatus } from './islands'
import { cx } from './ui'

/**
 * Section and module tree for track and module pages. A sidebar on wide screens; on
 * small screens the same markup sits in a native <details>, which gives a keyboard-
 * accessible drawer with no JavaScript.
 */
export function TrackTree({ trackId, currentModuleId }: { trackId: string; currentModuleId?: string }) {
  const track = repo.getTrack(trackId)!
  const tree = (
    <nav aria-label={`${track.code} sections and modules`} className="text-[0.8125rem]">
      <Link href={repo.href.track(track.id)} className="block font-semibold hover:text-accent">
        {track.code} {track.title}
      </Link>
      {repo.listSections(track.id).map((s) => (
        <div key={s.id} className="mt-3">
          <div className="text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle">{s.title}</div>
          <ul className="mt-1 space-y-0.5">
            {s.moduleIds.map((id) => {
              const m = repo.getModule(id)!
              const current = id === currentModuleId
              return (
                <li key={id}>
                  <Link
                    href={repo.href.module(m)}
                    aria-current={current ? 'page' : undefined}
                    className={cx('flex items-start gap-2 rounded-md px-2 py-1.5', current ? 'bg-accent-soft font-semibold text-accent' : 'hover:bg-surface-2')}
                  >
                    <span className="w-8 shrink-0 tabular-nums text-subtle">{m.code}</span>
                    <span className="min-w-0 flex-1">{m.title}</span>
                  </Link>
                  <div className="pl-12">
                    <ModuleStatus moduleId={id} size="xs" />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
  return (
    <>
      <details className="mb-6 rounded-xl border border-border bg-surface lg:hidden">
        <summary className="cursor-pointer px-4 py-3 text-[0.875rem] font-semibold">Sections and modules</summary>
        <div className="border-t border-border p-4">{tree}</div>
      </details>
      <aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 lg:block">{tree}</aside>
    </>
  )
}
