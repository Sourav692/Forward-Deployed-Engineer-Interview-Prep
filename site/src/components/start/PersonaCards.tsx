import Link from 'next/link'
import { PATHS, PERSONAS, getPathById } from '@/lib/paths'
import { cx, focusRing } from '@/components/ui'

/**
 * The seven personas on /start (FE-10), each linking to its path, then one card per
 * loop variant. A Server Component: the title link is stretched over the card, so
 * each card is one tab stop.
 */
export function PersonaCards() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {PERSONAS.map((persona) => {
        const path = getPathById(persona.pathId)
        if (!path) return null
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
          </li>
        )
      })}
      {/* Loop variants get their own card, with hours, next to their base path (ON-06). */}
      {PATHS.filter((p) => p.variantOf).map((variant) => (
        <li key={variant.id} className="relative flex flex-col rounded-lg border border-border bg-surface p-4 transition-shadow duration-150 hover:shadow-[var(--shadow)]">
          <h3 className="text-base font-semibold leading-snug">
            <Link
              href={`/start/paths/${variant.id}`}
              className={cx('rounded-sm after:absolute after:inset-0 after:rounded-lg hover:text-accent', focusRing)}
            >
              {variant.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted">{variant.summary}</p>
          <p className="mt-3 text-xs text-muted">
            Loop variant of the {getPathById(variant.variantOf!)?.title} path · about {variant.estHours} h
          </p>
        </li>
      ))}
    </ul>
  )
}
