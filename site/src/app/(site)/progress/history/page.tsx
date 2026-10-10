import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/learn/Breadcrumbs'
import { HistoryList } from '@/components/progress/ProgressLists'

/** /progress/history (FE-16). A static shell around a client island over the learner store. */

export const metadata: Metadata = {
  title: 'History',
  description: 'Everything you have done on the site in this browser, newest first.',
}

export default function Page() {
  return (
    <div className="max-w-3xl">
      <Breadcrumbs items={[{ label: 'Progress', href: '/progress' }, { label: 'History' }]} />
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">History</h1>
        <p className="mt-3 text-base text-muted">Everything you have done on the site in this browser, newest first.</p>
      </header>
      <HistoryList />
    </div>
  )
}
