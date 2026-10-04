import type { Metadata } from 'next'
import { AuthGate } from '@/demo/components/islands'
import { BookmarksPage } from '@/demo/components/ProgressPages'
import { Breadcrumbs, PageHeader } from '@/demo/components/ui'

export const metadata: Metadata = { title: 'Bookmarks' }

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Progress', href: '/demo/progress' }, { label: 'Bookmarks' }]} />
      <AuthGate>
        <PageHeader eyebrow="Progress" title="Bookmarks" description="Lessons, questions, projects and cases you saved." />
        <BookmarksPage />
      </AuthGate>
    </>
  )
}
