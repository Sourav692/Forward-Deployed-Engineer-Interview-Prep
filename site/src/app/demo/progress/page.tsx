import type { Metadata } from 'next'
import { AuthGate } from '@/demo/components/islands'
import { Dashboard } from '@/demo/components/Dashboard'
import { Breadcrumbs, PageHeader } from '@/demo/components/ui'

export const metadata: Metadata = { title: 'Dashboard' }

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Progress' }]} />
      <AuthGate>
        <PageHeader eyebrow="Progress" title="Dashboard" description="Where you are, what to do next, and how ready you are." />
        <Dashboard />
      </AuthGate>
    </>
  )
}
