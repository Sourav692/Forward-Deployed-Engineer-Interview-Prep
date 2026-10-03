import Link from 'next/link'
import { getAllScenarios } from '@/lib/content'
import { SITE, getModule } from '@/lib/registry'
import { LAST_DAY, REVIEWS } from '@/lib/editorial'
import { ModuleProgress } from '@/components/Progress'

const TECHNICAL = '01-customer-discovery-and-decomposition'
const BEHAVIORAL = '14-behavioural-and-leadership-round'
const WORKED_DESIGNS = '15-fde-case-studies'
const COMPANY_PREP = '16-company-oriented-prep'

export default async function HomePage() {
  const scenarios = await getAllScenarios()
  const scenariosIn = (moduleId: string) => scenarios.filter((s) => s.moduleId === moduleId)
  const technical = getModule(TECHNICAL)!
  const behavioral = getModule(BEHAVIORAL)!
  const workedDesigns = getModule(WORKED_DESIGNS)!
  const companyPrep = getModule(COMPANY_PREP)!

  return (
    <div className="py-14 sm:py-20">
      <section className="max-w-2xl">
        <p className="mb-3 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-accent">
          {SITE.tagline}
        </p>
        <h1 className="text-[2.25rem] font-bold leading-[1.15] tracking-[-0.022em] sm:text-[2.75rem]">
          Know exactly what to practise next.
        </h1>
        <p className="mt-5 text-[1.0625rem] leading-relaxed text-muted">
          FDE interviews test four distinct things: framing a customer problem, designing a
          production system, telling credible leadership stories, and revising under time
          pressure. Choose the path that matches where you are today.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/learning-map" className="rounded-md bg-accent px-4 py-2.5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-accent-hover">
            Start here
          </Link>
          <Link href={`/modules/${TECHNICAL}`} className="rounded-md border border-border bg-surface px-4 py-2.5 text-[0.9375rem] font-semibold transition-colors hover:border-border-strong">
            Start technical practice
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-5 max-w-2xl">
          <h2 className="text-[1.375rem] font-semibold tracking-[-0.014em]">Choose your prep path</h2>
          <p className="mt-1 text-[0.9375rem] leading-relaxed text-muted">
            Start with the activity you need, not an internal course label.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <PrepPath label="Technical practice" title={technical.title} description={technical.blurb} href={`/modules/${TECHNICAL}`} action={`Practise ${scenariosIn(TECHNICAL).length} scenarios`} scenarios={scenariosIn(TECHNICAL)} />
          <PrepPath label="Behavioral preparation" title={behavioral.title} description={behavioral.blurb} href={`/modules/${BEHAVIORAL}`} action="Build your stories" scenarios={scenariosIn(BEHAVIORAL)} />
          <PrepPath label="Reference answers" title={workedDesigns.title} description={workedDesigns.blurb} href={`/modules/${WORKED_DESIGNS}`} action={`Browse ${scenariosIn(WORKED_DESIGNS).length} worked designs`} scenarios={scenariosIn(WORKED_DESIGNS)} />
          <PrepPath label="Company-oriented prep" title={companyPrep.title} description={companyPrep.blurb} href={`/modules/${COMPANY_PREP}`} action="Open Blitzy Prep" scenarios={scenariosIn(COMPANY_PREP)} />
          <PrepPath label="Interview week" title={LAST_DAY.title} description="Condensed recall for concepts you already know, with a trigger-to-concept reference and final rehearsal guide." href={LAST_DAY.href} action={`Open ${REVIEWS.length} focused reviews`} />
        </div>
      </section>

      <section className="mt-14 border-t border-border pt-8">
        <h2 className="text-[1.125rem] font-semibold">Want the complete curriculum plan?</h2>
        <p className="mt-1 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
          The long-term course roadmap includes planned material. Start with the four paths
          above, or view how all available and upcoming material fits together.
        </p>
        <Link href="/learning-map" className="mt-3 inline-block text-[0.875rem] font-semibold text-accent hover:text-accent-hover">
          View the full preparation map →
        </Link>
      </section>
    </div>
  )
}

function PrepPath({
  label,
  title,
  description,
  href,
  action,
  scenarios,
}: {
  label: string
  title: string
  description: string
  href: string
  action: string
  scenarios?: Awaited<ReturnType<typeof getAllScenarios>>
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow)] transition-colors hover:border-border-strong">
      <span className="mb-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-subtle">{label}</span>
      <h3 className="text-[1.125rem] font-semibold">
        <Link href={href} className="transition-colors hover:text-accent">{title}</Link>
      </h3>
      <p className="mt-1.5 flex-1 text-[0.875rem] leading-relaxed text-muted">{description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-4">
        {scenarios && <ModuleProgress scenarios={scenarios} readingNoun={label === 'Company-oriented prep' ? 'guides' : undefined} />}
        <Link href={href} className="text-[0.875rem] font-semibold text-accent transition-colors hover:text-accent-hover">
          {action} →
        </Link>
      </div>
    </div>
  )
}
