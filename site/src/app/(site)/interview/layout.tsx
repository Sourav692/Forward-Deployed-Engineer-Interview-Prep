import type { ReactNode } from 'react'
import { EditorialScope } from '@/components/editorial/EditorialScope'

/**
 * The interview area (/interview, the topic hubs, and the mock-interview and final-week
 * module and lesson pages) in the Editorial theme, the same system as the casebook and
 * practice.
 */
export default function InterviewLayout({ children }: { children: ReactNode }) {
  return <EditorialScope>{children}</EditorialScope>
}
