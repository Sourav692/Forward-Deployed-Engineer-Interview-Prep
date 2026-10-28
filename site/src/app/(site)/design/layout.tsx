import type { ReactNode } from 'react'
import { cx } from '@/components/ui'
import { editorialDisplay, editorialSerif } from '@/lib/editorial-fonts'
import '@/components/landing/tokens.css'
import '@/components/casebook/casebook.css'

/**
 * The casebook's own system: the landing page's Editorial theme (Hallmark), shared by the
 * index at /design and every case page under it. A layout wraps both routes, so the
 * theme, its fonts and its stylesheet apply here and nowhere else; casebook.css scopes
 * every rule to `.casebook` and re-points the site's tokens inside it, so shared
 * components (filters, breadcrumbs, buttons) take the theme on these routes only.
 */
export default function CasebookLayout({ children }: { children: ReactNode }) {
  return (
    <div data-theme="editorial" className={cx(editorialDisplay.variable, editorialSerif.variable, 'casebook')}>
      {children}
    </div>
  )
}
