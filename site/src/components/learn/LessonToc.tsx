'use client'

import { useEffect, useState } from 'react'
import { cx, focusRing } from '@/components/ui'

export type TocHeading = { id: string; html: string }

/**
 * The current lesson's headings in the sidebar, with the heading being read marked.
 *
 * A heading counts as "being read" once its section top has scrolled past a line
 * 30% down the viewport; the last such section wins. That keeps the mark on a long
 * section while you read it, instead of jumping to the next heading as soon as it
 * peeks in at the bottom. Before the first heading is reached nothing is marked; at the
 * very bottom of the page the last heading is marked.
 */
export function LessonToc({ headings }: { headings: TocHeading[] }) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const sections = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const line = window.innerHeight * 0.3
        // The explorer keeps the original reading panel in the DOM but hides it.
        const visible = sections.filter((section) => section.getClientRects().length > 0)
        let current: string | null = null
        for (const el of visible) {
          if (el.getBoundingClientRect().top <= line) current = el.id
          else break
        }
        // A short last section can never reach the line; at the bottom, it is the one being read.
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
        if (atBottom && visible.length) current = visible[visible.length - 1].id
        setActive(current)
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    window.addEventListener('fd:lesson-view', update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('fd:lesson-view', update)
    }
  }, [headings])

  return (
    <ul className="mt-1 space-y-0.5 border-l border-border">
      {headings.map((h) => {
        const isActive = h.id === active
        return (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={isActive ? 'location' : undefined}
              className={cx(
                '-ml-px block rounded-r-sm border-l py-1 pl-3 pr-1 text-[0.8125rem] leading-snug transition-colors motion-reduce:transition-none',
                isActive
                  ? 'border-accent font-medium text-accent'
                  : 'border-transparent text-muted hover:border-border-strong hover:text-text',
                focusRing,
              )}
              dangerouslySetInnerHTML={{ __html: h.html }}
            />
          </li>
        )
      })}
    </ul>
  )
}
