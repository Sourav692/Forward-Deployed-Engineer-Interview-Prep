import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import * as repo from '@/demo/repo'
import { BookmarkButton } from '@/demo/components/islands'
import { ProjectTracker } from '@/demo/components/ProjectIslands'
import { Breadcrumbs, Card, Dl, H2, PageHeader, Tag } from '@/demo/components/ui'

export function generateStaticParams() {
  return repo.listProjects().map((p) => ({ projectId: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ projectId: string }> }): Promise<Metadata> {
  const p = repo.getProject((await params).projectId)
  return { title: p ? `${p.code} ${p.title}` : 'Project' }
}

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const p = repo.getProject((await params).projectId)
  if (!p) notFound()
  return (
    <>
      <Breadcrumbs items={[{ label: 'Practice', href: '/demo/practice' }, { label: `${p.code} ${p.title}` }]} />
      <PageHeader eyebrow={`Project ${p.code} · ${p.typeLabel}`} title={p.title} description={p.businessProblem} actions={<BookmarkButton kind="project" itemId={p.id} label={`${p.code} ${p.title}`} />}>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Tag>Difficulty: {p.difficulty}</Tag>
          <Tag>~{p.estHours} h</Tag>
          {p.skillIds.map((s) => (
            <Tag key={s}>{repo.getSkill(s)?.title}</Tag>
          ))}
        </div>
      </PageHeader>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <Card>
            <Dl
              items={[
                ['Type', p.typeLabel],
                ['Target user', p.targetUser],
                ['Functional requirements', p.functionalRequirements],
                ['Non-functional requirements', p.nonFunctionalRequirements],
              ]}
            />
          </Card>
          <section>
            <H2>Design</H2>
            <Card>
              <Dl
                items={[
                  ['Suggested architecture', p.suggestedArchitecture],
                  ['Data requirements', p.dataRequirements],
                  ['AI/ML components', p.aiComponents],
                  ['Deployment', p.deployment],
                  ['Observability', p.observability],
                  ['Security', p.security],
                  ['Cost', p.cost],
                  ['Evaluation strategy', p.evaluationStrategy],
                ]}
              />
            </Card>
          </section>
          <section>
            <H2>Deliverables and beyond</H2>
            <Card>
              <Dl
                items={[
                  ['Deliverables', <ul key="d" className="list-disc pl-4">{p.deliverables.map((d) => <li key={d}>{d}</li>)}</ul>],
                  ['Stretch goals', p.stretchGoals],
                  ['Interview questions', p.interviewQuestions],
                  ['Portfolio guidance', p.portfolioGuidance],
                  ['Completion rubric', p.completionRubric],
                  ['Related modules', <span key="m" className="flex flex-wrap gap-2">{p.moduleIds.map((id) => { const m = repo.getModule(id)!; return <Link key={id} href={repo.href.module(m)} className="text-accent hover:underline">{m.code}</Link> })}</span>],
                ]}
              />
            </Card>
          </section>
        </div>
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <h2 className="mb-3 font-semibold">Your project</h2>
            <ProjectTracker projectId={p.id} />
          </Card>
        </aside>
      </div>
    </>
  )
}
