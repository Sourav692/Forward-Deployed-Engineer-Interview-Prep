import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FLAG_HELP, FLAG_ORDER, PATHS, getPathById, pathVariants, personaFor } from '@/lib/paths'
import { isLearnTrack } from '@/lib/curriculum-href'
import { getModuleBySlug, getTracks, learnHref, moduleInput, trackModules } from '@/lib/learn'
import { Breadcrumbs } from '@/components/learn/Breadcrumbs'
import { PathFlag } from '@/components/learn/PathFlag'
import { ModuleStatusBadge, StorageNotice } from '@/components/learn/ProgressIslands'
import { ChoosePathPanel } from '@/components/start/ChoosePath'
import { Tag, cx, focusRing } from '@/components/ui'
import { pageMetadata } from '@/lib/seo'

/**
 * Path detail (FE-10). Prerendered for every path (`generateStaticParams` +
 * `dynamicParams = false`, so unknown ids are a 404). A Server Component: the flags
 * come from `lib/paths.ts` at build time; only the learner's module status and the
 * "Choose this path" panel are client islands.
 */

type Params = { pathId: string }

export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return PATHS.map((p) => ({ pathId: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const path = getPathById((await params).pathId)
  if (!path) return {}
  return pageMetadata({ path: `/start/paths/${path.id}`, title: `${path.title} Path`, description: path.summary })
}

const link = cx('rounded-sm font-semibold text-accent underline underline-offset-2 hover:text-accent-hover', focusRing)

export default async function PathPage({ params }: { params: Promise<Params> }) {
  const path = getPathById((await params).pathId)
  if (!path) notFound()

  const persona = personaFor(path)
  const base = path.variantOf ? getPathById(path.variantOf) : undefined
  const variants = pathVariants(path.id)
  const start = getModuleBySlug(path.startModule)
  // In code order (T1.3 before T1.4), whatever the curriculum's section grouping (IA-12).
  const byCode = (a: { code: string }, b: { code: string }) => a.code.localeCompare(b.code, 'en', { numeric: true })
  const tracks = getTracks().map((t) => ({ track: t, modules: [...trackModules(t)].sort(byCode) }))
  const counts = FLAG_ORDER.map((f) => ({ f, n: Object.values(path.moduleFlags).filter((x) => x === f).length }))

  return (
    <>
      <Breadcrumbs items={[{ label: 'Choose Your Path', href: '/start' }, { label: `${path.title} Path` }]} />
      <div className="max-w-3xl">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-subtle">Learning Path</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{path.title}</h1>
          <p className="mt-3 text-lg text-muted">{path.summary}</p>
          {persona && (
            <p className="mt-2 text-sm text-muted">
              For: <span className="font-semibold text-text">{persona.title}</span>. {persona.startingPoint}.
            </p>
          )}
          <p className="mt-1 text-sm text-muted">
            About {path.estHours} hours of required and recommended study ·{' '}
            {counts
              .filter((c) => c.n > 0)
              .map((c) => `${c.n} ${c.f}`)
              .join(', ')}
          </p>
          {base && (
            <p className="mt-2 text-sm text-muted">
              A variant of the{' '}
              <Link href={`/start/paths/${base.id}`} className={link}>
                {base.title}
              </Link>{' '}
              path.
            </p>
          )}
        </header>

        <div className="mt-6">
          <StorageNotice />
        </div>

        {start && (
          <ChoosePathPanel pathId={path.id} startHref={learnHref.module(start)} startLabel={`${start.code} ${start.title}`} />
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <section aria-labelledby="ready">
            <h2 id="ready" className="text-lg font-semibold">
              Ready When
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {path.readinessCriteria.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="skip">
            <h2 id="skip" className="text-lg font-semibold">
              When to Skip
            </h2>
            <p className="mt-2 text-sm">{path.skipCriteria}</p>
          </section>
        </div>

        <section aria-labelledby="sequence" className="mt-10">
          <h2 id="sequence" className="text-xl font-semibold tracking-[-0.01em]">
            Modules, Track by Track
          </h2>
          <p className="mt-1 text-sm text-muted">Work through the tracks in this order. Each module shows its flag on this path and your status.</p>
          <dl className="mt-3 grid gap-x-4 gap-y-1.5 text-xs text-muted sm:grid-cols-2">
            {FLAG_ORDER.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <dt>
                  <PathFlag flag={f} size="xs" />
                </dt>
                <dd>{FLAG_HELP[f]}</dd>
              </div>
            ))}
          </dl>

          <ol className="mt-6 space-y-6">
            {tracks.map(({ track, modules }) => {
              const onPath = modules.filter((m) => path.moduleFlags[m.slug] !== 'skip')
              return (
                <li key={track.slug}>
                  <h3 className="flex flex-wrap items-baseline gap-2 text-base font-semibold">
                    {/* Only Learn tracks have a code; the interview track's title says what it is. */}
                    {isLearnTrack(track.slug) && (
                      <span className="text-xs font-semibold tabular-nums text-subtle">{track.code}</span>
                    )}
                    <Link href={learnHref.track(track.slug)} className={cx('rounded-sm hover:text-accent', focusRing)}>
                      {track.title}
                    </Link>
                  </h3>
                  {onPath.length === 0 ? (
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                      <PathFlag flag="skip" size="xs" /> Not part of this path.
                    </p>
                  ) : (
                    <ul className="mt-2 divide-y divide-border rounded-md border border-border bg-surface">
                      {modules.map((m) => {
                        const flag = path.moduleFlags[m.slug]
                        return (
                          <li key={m.slug} className="flex flex-col gap-1.5 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3">
                            <div className="flex min-w-0 flex-1 items-baseline gap-2">
                              <span className="w-9 shrink-0 text-xs font-semibold tabular-nums text-subtle">{m.code}</span>
                              <Link
                                href={learnHref.module(m)}
                                className={cx('min-w-0 rounded-sm text-sm hover:text-accent', flag === 'skip' ? 'text-muted' : 'font-medium', focusRing)}
                              >
                                {m.title}
                              </Link>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 pl-11 sm:pl-0">
                              <PathFlag flag={flag} size="xs" srPrefix="Flag:" />
                              {m.status === 'partly' && <Tag>Partly ready</Tag>}
                              <ModuleStatusBadge input={moduleInput(m)} size="xs" />
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ol>
        </section>

        {variants.length > 0 && (
          <section aria-labelledby="variants" className="mt-10">
            <h2 id="variants" className="text-lg font-semibold">
              Loop Variants
            </h2>
            <ul className="mt-2 space-y-2 text-sm">
              {variants.map((v) => (
                <li key={v.id}>
                  <Link href={`/start/paths/${v.id}`} className={link}>
                    {v.title}
                  </Link>
                  <span className="text-muted">: {v.summary}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-sm text-muted">
          Not the right fit?{' '}
          <Link href="/start" className={link}>
            Compare all paths or take the diagnostic
          </Link>
          .
        </p>
      </div>
    </>
  )
}
