import Link from 'next/link'
import { PATHS, PERSONAS, getPathById } from '@/lib/paths'

/**
 * The seven personas on /start (FE-10), each linking to its path, then one row per loop
 * variant. A Server Component; each row is one link (one tab stop). Contents rows in the
 * Editorial theme (editorial.css): the persona, then the path and hours at the edge, then
 * the starting point and need under it.
 */
export function PersonaCards() {
  return (
    <ul className="cb-rows">
      {PERSONAS.map((persona) => {
        const path = getPathById(persona.pathId)
        if (!path) return null
        return (
          <li key={persona.id} className="cb-row">
            <Link href={`/start/paths/${path.id}`} className="cb-row-link">
              <span className="cb-row-title">{persona.title}</span>
              <span className="cb-row-facts">
                <span>{path.title} path</span>
                <span>about {path.estHours} h</span>
              </span>
              <span className="cb-row-note">
                {persona.startingPoint}. {persona.needs}.
              </span>
            </Link>
          </li>
        )
      })}
      {/* Loop variants get their own row, with hours, next to their base path (ON-06). The
          e2e suite reads "Loop variant of the … path, about N h". */}
      {PATHS.filter((p) => p.variantOf).map((variant) => (
        <li key={variant.id} className="cb-row">
          <Link href={`/start/paths/${variant.id}`} className="cb-row-link">
            <span className="cb-row-title">{variant.title}</span>
            <span className="cb-row-facts">
              Loop variant of the {getPathById(variant.variantOf!)?.title} path, about {variant.estHours} h
            </span>
            <span className="cb-row-note">{variant.summary}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
