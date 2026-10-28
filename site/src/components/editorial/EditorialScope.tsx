import type { ReactNode } from 'react'
import { cx } from '@/components/ui'
import { editorialDisplay, editorialSerif } from '@/lib/editorial-fonts'
import '@/components/landing/tokens.css'
import './editorial.css'

/**
 * The Editorial theme (Hallmark) for an area of the site: the landing page's fonts and
 * tokens on a wrapper, so editorial.css can scope every rule to `.editorial-page` and
 * re-point the site's tokens inside it. Route layouts render it (/design, /practice, /interview), so
 * shared components (filters, breadcrumbs, buttons) take the theme in those areas only.
 */
export function EditorialScope({ children }: { children: ReactNode }) {
  return (
    <div data-theme="editorial" className={cx(editorialDisplay.variable, editorialSerif.variable, 'editorial-page')}>
      {children}
    </div>
  )
}
