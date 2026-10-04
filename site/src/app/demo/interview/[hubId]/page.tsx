import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import * as repo from '@/demo/repo'
import { QuestionBrowser } from '@/demo/components/QuestionBrowser'
import { Breadcrumbs, PageHeader, Tag } from '@/demo/components/ui'

export function generateStaticParams() {
  return repo.listHubs().map((h) => ({ hubId: h.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ hubId: string }> }): Promise<Metadata> {
  return { title: repo.getHub((await params).hubId)?.title ?? 'Topic hub' }
}

export default async function HubPage({ params }: { params: Promise<{ hubId: string }> }) {
  const hub = repo.getHub((await params).hubId)
  if (!hub) notFound()
  return (
    <>
      <Breadcrumbs items={[{ label: 'Interview', href: '/demo/interview' }, { label: hub.title }]} />
      <PageHeader eyebrow="Topic hub" title={hub.title} description={hub.summary}>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {hub.topics.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </PageHeader>
      <QuestionBrowser hubId={hub.id} />
    </>
  )
}
