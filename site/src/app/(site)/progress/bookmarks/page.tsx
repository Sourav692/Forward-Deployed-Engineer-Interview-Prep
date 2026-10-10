import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/learn/Breadcrumbs'
import { BookmarkList } from '@/components/progress/ProgressLists'

/** /progress/bookmarks (FE-16). A static shell around a client island over the learner store. */

export const metadata: Metadata = {
  title: 'Bookmarks',
  description: 'Lessons and pages you bookmarked.',
}

export default function Page() {
  return (
    <div className="max-w-3xl">
      <Breadcrumbs items={[{ label: 'Progress', href: '/progress' }, { label: 'Bookmarks' }]} />
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">Bookmarks</h1>
        <p className="mt-3 text-base text-muted">Lessons and pages you bookmarked.</p>
      </header>
      <BookmarkList />
    </div>
  )
}
