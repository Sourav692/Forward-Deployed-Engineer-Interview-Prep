import type { ReactNode } from 'react'
import { EditorialScope } from '@/components/editorial/EditorialScope'

/**
 * The practice area (/practice, every worksheet and the Story Bank) in the Editorial
 * theme, the same system as the casebook.
 */
export default function PracticeLayout({ children }: { children: ReactNode }) {
  return <EditorialScope>{children}</EditorialScope>
}
