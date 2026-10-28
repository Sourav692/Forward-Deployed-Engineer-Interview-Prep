import type { ReactNode } from 'react'

/**
 * One part of an editorial area page (Hallmark, Editorial theme): a heavy rule, the
 * condensed head and its standfirst, then its pages. The heading labels the region, so
 * tests and screen readers find a section by its title. Styles are in editorial.css.
 */
export function EditorialSection({ id, title, description, children }: { id: string; title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mt-24 scroll-mt-20 first-of-type:mt-0">
      <div className="cb-opens mb-8 lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-10">
        <h2 id={`${id}-heading`} className="cb-section-head">
          {title}
        </h2>
        {description && <p className="mt-4 max-w-[60ch] text-base lg:mt-1">{description}</p>}
      </div>
      {children}
    </section>
  )
}
