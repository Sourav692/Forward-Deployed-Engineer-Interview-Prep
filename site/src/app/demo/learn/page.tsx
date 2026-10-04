import type { Metadata } from 'next'
import { CurriculumOverview } from '@/demo/components/CurriculumOverview'
import { Breadcrumbs, PageHeader } from '@/demo/components/ui'

export const metadata: Metadata = { title: 'Learn' }

export default function LearnPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Learn' }]} />
      <PageHeader
        eyebrow="Learn"
        title="Curriculum"
        description="Ten tracks taught in dependency order. Required tracks are the core of most paths; your chosen path decides which modules are required, recommended or optional."
      />
      <CurriculumOverview />
    </>
  )
}
