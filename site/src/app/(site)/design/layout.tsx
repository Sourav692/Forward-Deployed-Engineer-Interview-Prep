import type { ReactNode } from 'react'
import { EditorialScope } from '@/components/editorial/EditorialScope'

/**
 * The casebook (/design and every case page under it) in the Editorial theme. A layout
 * wraps both routes, so the theme applies here and on /practice, and nowhere else.
 */
export default function CasebookLayout({ children }: { children: ReactNode }) {
  return (
    <EditorialScope>
      {children}
    </EditorialScope>
  )
}
