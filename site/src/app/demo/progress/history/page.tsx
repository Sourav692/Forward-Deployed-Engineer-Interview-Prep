import type { Metadata } from 'next'
import { AuthGate } from '@/demo/components/islands'
import { HistoryPage } from '@/demo/components/ProgressPages'
import { Breadcrumbs, PageHeader } from '@/demo/components/ui'

export const metadata: Metadata = { title: 'Learning history' }

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Progress', href: '/demo/progress' }, { label: 'History' }]} />
      <AuthGate>
        <PageHeader eyebrow="Progress" title="Learning history" description="Everything you have done, newest first." />
        <HistoryPage />
      </AuthGate>
    </>
  )
}
