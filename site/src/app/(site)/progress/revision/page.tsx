import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/learn/Breadcrumbs'
import { RevisionList } from '@/components/progress/ProgressLists'
import { dashboardData } from '@/lib/dashboard'

/** /progress/revision (FE-16). A static shell around a client island over the learner store. */

export const metadata: Metadata = {
  title: 'Revision Queue',
  description: 'Modules to review: rated low, or whose rating has faded.',
}

export default async function Page() {
  return (
    <div className="max-w-3xl">
      <Breadcrumbs items={[{ label: 'Progress', href: '/progress' }, { label: 'Revision Queue' }]} />
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">Revision Queue</h1>
        <p className="mt-3 text-base text-muted">Modules to review: rated low, or whose rating has faded.</p>
      </header>
      <RevisionList modules={(await dashboardData()).modules} />
    </div>
  )
}
