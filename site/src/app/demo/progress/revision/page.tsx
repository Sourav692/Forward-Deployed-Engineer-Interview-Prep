import type { Metadata } from 'next'
import { AuthGate } from '@/demo/components/islands'
import { RevisionPage } from '@/demo/components/ProgressPages'
import { Breadcrumbs, PageHeader } from '@/demo/components/ui'

export const metadata: Metadata = { title: 'Revision queue' }

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Progress', href: '/demo/progress' }, { label: 'Revision queue' }]} />
      <AuthGate>
        <PageHeader eyebrow="Progress" title="Revision queue" description="Short, targeted reviews that turn decay into daily sessions." />
        <RevisionPage />
      </AuthGate>
    </>
  )
}
