import type { NotebookOnlyLesson } from '@/lib/curriculum-types'
import { cx, focusRing } from '@/components/ui'
import { COPY } from './copy'

/**
 * A module's notebook-only course lessons (FE-16): each title with its notebooks, which
 * open on GitHub. Styled like ReadingList, but with no lesson page, no read mark and no
 * place in the module's progress.
 */
export function NotebookOnlyList({ lessons }: { lessons: NotebookOnlyLesson[] }) {
  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
      {lessons.map((l) => (
        <li key={l.title} className="px-4 py-3">
          <p className="text-sm font-semibold">{l.title}</p>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {l.notebooks.map((n) => (
              <li key={n.href} className="min-w-0 text-xs text-muted">
                <a
                  href={n.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cx('break-all rounded-sm font-mono text-accent underline underline-offset-2 hover:text-accent-hover', focusRing)}
                >
                  {n.title}
                </a>
                {n.optional && <span className="ml-1">({COPY.notebookOnlyOptional})</span>}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
