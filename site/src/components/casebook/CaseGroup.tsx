import Link from 'next/link'
import { LEVEL_LABEL } from '@/lib/editorial'
import type { TrackGroup } from '@/components/areas/data'

/**
 * One casebook theme as a magazine contents block (Hallmark, Editorial theme): the
 * theme's name and argument on the left, its cases as ruled rows on the right, each row
 * the case's title with its level and reading time at the edge. No hooks, so the filter
 * island and the server fallback both render it. Styles are in casebook.css.
 */
export function CaseGroup({ group, unit }: { group: TrackGroup; unit: [string, string] }) {
  const count = `${group.items.length} ${group.items.length === 1 ? unit[0] : unit[1]}`
  return (
    <section id={group.id} aria-labelledby={`${group.id}-title`} className="cb-group">
      <div>
        <h3 id={`${group.id}-title`}>{group.title}</h3>
        <p className="cb-group-blurb">{group.blurb}</p>
        <Link href={group.href} className="cb-group-count">
          {count}
        </Link>
      </div>
      <ul className="cb-rows">
        {group.items.map((item) => {
          // A title like "Customer Support Automation · Case Study" names its kind after the dot.
          const [name, kind] = item.title.split(' · ')
          return (
            <li key={item.href} className="cb-row">
              <Link href={item.href} className="cb-row-link">
                <span className="cb-row-title">{name}</span>
                <span className="cb-row-facts">
                  {kind && <span>{kind}</span>}
                  <span>{LEVEL_LABEL[item.level]}</span>
                  {item.minutes !== undefined && <span>{item.minutes} min</span>}
                </span>
              </Link>
              {item.twin && (
                <Link href={item.twin.href} className="cb-row-twin" aria-label={`${item.twin.label} →`}>
                  {item.twin.label}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
