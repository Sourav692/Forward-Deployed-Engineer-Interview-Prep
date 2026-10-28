import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/learn/Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { EditorialSection } from '@/components/editorial/EditorialSection'
import { PageHead } from '@/components/editorial/PageHead'
import { INTERVIEW_HUBS } from '@/lib/curriculum'
import { hubHref } from '@/lib/curriculum-href'
import { formatMinutes, getModuleBySlug, getPublishedLesson, learnHref, moduleTime, readingList } from '@/lib/learn'
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo'

/**
 * Interview topic hub (FE-18), e.g. /interview/hubs/ai-systems-design. An index onto
 * practice that already exists (DATA-07): every entry is a published lesson or module,
 * so the page copies no question text. Static, one page per hub; any other slug is a 404.
 */

type Params = { hubSlug: string }

export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return INTERVIEW_HUBS.map((h) => ({ hubSlug: h.slug }))
}

const getHub = (slug: string) => INTERVIEW_HUBS.find((h) => h.slug === slug)

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const hub = getHub((await params).hubSlug)
  if (!hub) return {}
  return pageMetadata({ path: hubHref(hub.slug), title: `${hub.title} Interview Questions`, description: hub.summary })
}

export default async function HubPage({ params }: { params: Promise<Params> }) {
  const hub = getHub((await params).hubSlug)
  if (!hub) notFound()

  // `check:curriculum` guarantees every slug is published; a miss here means a stale snapshot.
  const practice = hub.practice.map((slug) => {
    const lesson = getPublishedLesson(slug)
    const mod = lesson && getModuleBySlug(lesson.module)
    if (!lesson || !mod) throw new Error(`Hub ${hub.slug}: practice lesson "${slug}" is not in the learn manifest. Run npm run sync.`)
    // No code tag: practice items such as the story bank live outside their module's
    // code scheme, and the module title already says where the item lives.
    return { href: lesson.href, title: lesson.title, module: mod.title, minutes: lesson.estMinutes }
  })
  const modules = hub.modules.map((slug) => getModuleBySlug(slug)!)
  const others = INTERVIEW_HUBS.filter((h) => h.slug !== hub.slug)

  // Hallmark, Editorial theme (editorial.css): the hub's head as a ruled spec line, then
  // its practice, the modules behind it and the other hubs as contents rows.
  return (
    <div className="pb-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Interview', path: '/interview' },
          { name: hub.title, path: hubHref(hub.slug) },
        ])}
      />
      <Breadcrumbs items={[{ label: 'Interview', href: '/interview' }, { label: hub.title }]} />
      <PageHead
        tag="Interview topic hub"
        title={hub.title}
        standfirst={hub.summary}
        facts={[
          { term: 'Practice', value: `${practice.length} lessons and rounds` },
          { term: 'Modules', value: `${modules.length} to study` },
        ]}
      />

      <EditorialSection
        id="practice"
        title="Practise"
        description="Question lessons and timed rounds from across the site. Answer each question out loud before you read the model answer."
      >
        <ul className="cb-rows">
          {practice.map((p) => (
            <li key={p.href} className="cb-row">
              <Link href={p.href} className="cb-row-link">
                <span className="cb-row-title">{p.title}</span>
                <span className="cb-row-facts">
                  <span>{p.module}</span>
                  {p.minutes ? <span>{formatMinutes(p.minutes)}</span> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </EditorialSection>

      <EditorialSection id="study" title="Study the Gaps" description="When a question shows a gap, these modules teach the material behind it.">
        <ul className="cb-rows">
          {modules.map((m) => {
            const lessons = readingList(m).main.length
            return (
              <li key={m.slug} className="cb-row">
                <Link href={learnHref.module(m)} className="cb-row-link">
                  <span className="cb-row-title">{m.title}</span>
                  <span className="cb-row-facts">
                    <span>{formatMinutes(moduleTime(m).total)}</span>
                    {lessons > 0 && <span>{lessons} {lessons === 1 ? 'lesson' : 'lessons'}</span>}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </EditorialSection>

      <EditorialSection id="other-hubs" title="Other Topic Hubs">
        <ul className="cb-rows">
          {others.map((h) => (
            <li key={h.slug} className="cb-row">
              <Link href={hubHref(h.slug)} className="cb-row-link">
                <span className="cb-row-title">{h.title}</span>
                <span className="cb-row-note">{h.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </EditorialSection>
    </div>
  )
}
