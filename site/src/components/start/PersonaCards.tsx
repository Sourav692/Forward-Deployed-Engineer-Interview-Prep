import Link from 'next/link'
import { PERSONAS, getPathById, pathVariants } from '@/lib/paths'
import { cx, focusRing } from '@/components/ui'

/**
 * The seven personas on /start (FE-10), each linking to its path. A Server Component:
 * the title link is stretched over the card, so each card is one tab stop, and the
 * company-loop variants get their own links above the stretched link.
 */
export function PersonaCards() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {PERSONAS.map((persona) => {
        const path = getPathById(persona.pathId)
        if (!path) return null
        const variants = pathVariants(path.id)
        return (
          <li key={persona.id} className="relative flex flex-col rounded-lg border border-border bg-surface p-4 transition-shadow duration-150 hover:shadow-[var(--shadow)]">
            <h3 className="text-base font-semibold leading-snug">
              <Link
                href={`/start/paths/${path.id}`}
                className={cx('rounded-sm after:absolute after:inset-0 after:rounded-lg hover:text-accent', focusRing)}
              >
                {persona.title}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-muted">{persona.startingPoint}.</p>
            <p className="mt-2 text-sm">{persona.needs}.</p>
            <p className="mt-3 text-xs text-muted">
              {path.title} path · about {path.estHours} h
            </p>
            {variants.length > 0 && (
              <p className="relative z-10 mt-2 text-xs text-muted">
                Loop variants:{' '}
                {variants.map((v, i) => (
                  <span key={v.id}>
                    {i > 0 && ', '}
                    <Link href={`/start/paths/${v.id}`} className={cx('rounded-sm font-semibold text-accent underline underline-offset-2', focusRing)}>
                      {v.title.replace(/^.*: /, '')}
                    </Link>{' '}
                    (about {v.estHours} h)
                  </span>
                ))}
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}
