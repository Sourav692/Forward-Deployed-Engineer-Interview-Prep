import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AreaHeader, AreaSection, LinkList } from '@/components/areas/Area'
import { Breadcrumbs } from '@/components/learn/Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { ModuleCard } from '@/components/learn/ModuleCard'
import { INTERVIEW_HUBS } from '@/lib/curriculum'
import { hubHref } from '@/lib/curriculum-href'
import { formatMinutes, getModuleBySlug, getPublishedLesson } from '@/lib/learn'
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
    // code scheme, and the note already names the module.
    return { href: lesson.href, title: lesson.title, note: [mod.title, lesson.estMinutes && formatMinutes(lesson.estMinutes)].filter(Boolean).join(' · ') }
  })
  const modules = hub.modules.map((slug) => getModuleBySlug(slug)!)
  const others = INTERVIEW_HUBS.filter((h) => h.slug !== hub.slug)

  return (
    <div className="py-8 sm:py-10">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Interview', path: '/interview' },
          { name: hub.title, path: hubHref(hub.slug) },
        ])}
      />
      <Breadcrumbs items={[{ label: 'Interview', href: '/interview' }, { label: hub.title }]} />
      <AreaHeader eyebrow="Interview topic hub" title={hub.title}>
        <p>{hub.summary}</p>
      </AreaHeader>

      <AreaSection
        id="practice"
        title="Practise"
        description="Question lessons and timed rounds from across the site. Answer each question out loud before you read the model answer."
      >
        <LinkList items={practice} />
      </AreaSection>

      <AreaSection
        id="study"
        title="Study the Gaps"
        description="When a question shows a gap, these modules teach the material behind it."
      >
        <div className="space-y-2">
          {modules.map((m) => (
            <ModuleCard key={m.slug} module={m} />
          ))}
        </div>
      </AreaSection>

      <AreaSection id="other-hubs" title="Other Topic Hubs">
        <LinkList items={others.map((h) => ({ href: hubHref(h.slug), title: h.title, note: h.summary }))} />
      </AreaSection>
    </div>
  )
}
