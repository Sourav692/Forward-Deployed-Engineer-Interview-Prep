'use client'

import { PrevNext } from '@/components/PrevNext'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CaseStudy } from '@/lib/scenario'
import { documentsOf, hasChapters, qualifiedTitle, scenarioHref, type CaseDocument } from '@/lib/scenario'
import type { ReadingDocument } from '@/lib/reading'
import { loadRead, notifyProgress, saveRead } from '@/lib/storage'
import { Diagram, hasStaticDiagram } from './Diagram'

/**
 * A reading page: one case study, four documents, one tab each.
 *
 * A case on the chapters pilot (`hasChapters`) swaps the tab row for a sidebar: an
 * Introduction page, then each document with its parts (ENH-25 splits) nested under it,
 * one part shown at a time. Each part keeps its own tab id (`full-pack-part-3`) in the
 * hash and in saved progress, so links and read state hold.
 *
 * All four tabs are in the DOM and inactive ones are `hidden`. That costs a little
 * HTML and buys two things: search results can link straight to a section in any
 * tab, and the URL hash alone decides what is shown — `#deep-dive` opens a tab,
 * `#deep-dive-acl-normalization` opens the tab that holds that section and scrolls
 * to it. Nothing depends on query strings, so every page stays statically built.
 *
 * Diagrams drawn in the browser are the exception: mermaid measures text as it lays a
 * graph out, and in a hidden panel everything measures zero, so those mount the first
 * time the panel is shown. Diagrams the sync drew to static files render in every panel,
 * so the served HTML holds them all (audit check PR-20); their images load lazily.
 */

function tabForHash(
  hash: string,
  tabs: string[],
): { tab: string; anchor: string | null } | null {
  const id = decodeURIComponent(hash.replace(/^#/, ''))
  if (!id) return null
  if (tabs.includes(id)) return { tab: id, anchor: null }
  // Longest id first, so `tutorial-v1-…` is not claimed by a shorter tab id.
  const owner = [...tabs].sort((a, b) => b.length - a.length).find((t) => id.startsWith(`${t}-`))
  return owner ? { tab: owner, anchor: id } : null
}

export function CaseStudyView({ study }: { study: CaseStudy }) {
  const progressId = `${study.ref.trackId}/${study.ref.slug}`
  const documents = documentsOf(study)
  const tabIds = study.docs.map((d) => d.tab)
  const tabKey = tabIds.join('|')
  const [active, setActive] = useState<string>(tabIds[0])
  const [visited, setVisited] = useState<Set<string>>(() => new Set([tabIds[0]]))
  const [read, setRead] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)
  const tabsRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  // The Introduction is a landing page, not reading: it never counts towards progress.
  const readable = tabIds.filter((t) => t !== 'intro')

  const show = useCallback((tab: string) => {
    setActive(tab)
    setVisited((prev) => (prev.has(tab) ? prev : new Set(prev).add(tab)))
  }, [])

  // The hash and saved progress exist only in the browser, so both are read after
  // mount; the prerendered HTML always shows the first tab with nothing marked.
  /* eslint-disable react-hooks/set-state-in-effect -- hydration-safe by design */
  useEffect(() => {
    // Only tabs that still exist count: a tutorial moved to the archive can leave its
    // id in saved progress, and counting it would mark the case read too early.
    const current = tabKey.split('|')
    const saved = loadRead(progressId)
    const live = saved.filter((t) => current.includes(t))
    if (live.length !== saved.length) saveRead(progressId, live, current.filter((t) => t !== 'intro').length)
    setRead(live)
    setHydrated(true)

    const apply = () => {
      const target = tabForHash(window.location.hash, tabKey.split('|'))
      if (!target) return
      show(target.tab)
      setMenuOpen(false)
      if (target.anchor) {
        // Scroll once the panel is unhidden, then again after the router settles: on
        // a navigation from another page (a search result), Next.js applies its own
        // scroll after this effect and would otherwise leave the section off-screen.
        const scroll = () => document.getElementById(target.anchor!)?.scrollIntoView()
        requestAnimationFrame(scroll)
        setTimeout(scroll, 250)
      }
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [progressId, show, tabKey])
  /* eslint-enable react-hooks/set-state-in-effect */

  const selectTab = (tab: string, scroll = false) => {
    show(tab)
    setMenuOpen(false)
    // replaceState, not a hash assignment: a tab click should not pile up history
    // entries, and should not make the browser jump to an element.
    window.history.replaceState(null, '', `#${tab}`)
    if (scroll) {
      const top = (tabsRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 72
      window.scrollTo({ top: Math.max(top, 0) })
    }
  }

  const toggleRead = (tab: string) => {
    setRead((prev) => {
      const next = prev.includes(tab) ? prev.filter((t) => t !== tab) : [...prev, tab]
      saveRead(progressId, next, readable.length)
      notifyProgress()
      return next
    })
  }

  const activeDoc = documents.find((d) => d.parts.some((p) => p.tab === active)) ?? documents[0]
  const isRead = (d: CaseDocument) => d.parts.every((p) => read.includes(p.tab))
  const counted = documents.filter((d) => d.tab !== 'intro')
  const chapters = hasChapters(study)

  /** One part of a document: the text, then mark-as-read and where to go next. */
  const part = (d: CaseDocument, di: number, p: CaseDocument['parts'][number], pi: number) => {
    const split = d.parts.length > 1
    const done = read.includes(p.tab)
    const name = split ? `${d.label} part ${pi + 1}` : d.label
    const following = documents[di + 1]
    const next = d.parts[pi + 1]
      ? { tab: d.parts[pi + 1].tab, label: `Part ${pi + 2}` }
      : following && { tab: following.parts[0].tab, label: following.label }
    return (
      <div key={p.tab} hidden={active !== p.tab}>
        <ReadingPanel doc={p.doc} drawDiagrams={visited.has(p.tab)} toc={!chapters} title={!chapters} />

        <div className="no-print mt-12 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4">
          {d.tab !== 'intro' && (
            <button
              type="button"
              onClick={() => toggleRead(p.tab)}
              aria-pressed={done}
              className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-[0.875rem] font-semibold transition-colors ${
                done
                  ? 'bg-success-soft text-success hover:opacity-90'
                  : 'bg-accent text-white hover:bg-accent-hover dark:text-bg'
              }`}
            >
              {done && <Check className="h-4 w-4" />}
              {done ? `${name} marked as read` : `Mark ${name} as read`}
            </button>
          )}
          <div className="ml-auto flex flex-wrap gap-3">
            {split && pi > 0 && (
              <button
                type="button"
                onClick={() => selectTab(d.parts[pi - 1].tab, true)}
                className="rounded-md border border-border px-3.5 py-2 text-[0.875rem] font-semibold transition-colors hover:border-border-strong"
              >
                ← Part {pi}
              </button>
            )}
            {next && (
              <button
                type="button"
                onClick={() => selectTab(next.tab, true)}
                className="rounded-md border border-border px-3.5 py-2 text-[0.875rem] font-semibold transition-colors hover:border-border-strong"
              >
                {d.tab === 'intro' ? 'Start' : 'Next'}: {next.label} →
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  /** A document's panel: what it is for, then its parts. */
  const panel = (d: CaseDocument, di: number) => {
    const split = d.parts.length > 1
    const current = d.parts.findIndex((p) => p.tab === active)
    return (
      <div
        key={d.tab}
        id={`panel-${d.tab}`}
        role={chapters ? 'region' : 'tabpanel'}
        aria-labelledby={chapters ? undefined : `tab-${d.tab}`}
        aria-label={chapters ? d.label : undefined}
        hidden={activeDoc.tab !== d.tab}
      >
        {/* What this tab is for, so a reader landing on it from search knows where
            it sits in the case — the tab row alone does not say. */}
        {d.purpose && d.tab !== 'intro' && current <= 0 && (
          <p className="no-print mb-6 max-w-3xl rounded-lg bg-surface-2/60 px-4 py-2.5 text-[0.875rem] leading-relaxed text-muted">
            <span className="font-semibold text-text">{d.label}</span> · {d.minutes} min
            {split && ` in ${d.parts.length} parts`}
            {d.optional && ' · optional'} — {d.purpose}
          </p>
        )}
        {d.parts.map((p, pi) => part(d, di, p, pi))}
      </div>
    )
  }

  if (chapters) {
    const activeLabel = activeDoc.parts.length > 1
      ? `${activeDoc.label}, part ${activeDoc.parts.findIndex((p) => p.tab === active) + 1}`
      : activeDoc.label
    return (
      <article>
        <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
          <div className="no-print sticky top-[3.75rem] z-20 -mx-4 mb-6 border-b border-border bg-bg/95 px-4 backdrop-blur-md lg:top-20 lg:z-auto lg:mx-0 lg:mb-0 lg:self-start lg:border-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="case-contents"
              className="flex w-full items-center justify-between gap-3 py-3 text-left text-[0.875rem] font-semibold lg:hidden"
            >
              <span>
                Contents <span className="font-normal text-muted">· {activeLabel}</span>
              </span>
              <span aria-hidden className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>
            <nav
              id="case-contents"
              aria-label="Case contents"
              className={`${menuOpen ? 'block' : 'hidden'} max-h-[70vh] overflow-y-auto pb-4 lg:block lg:max-h-[calc(100vh-6rem)] lg:pb-0`}
            >
              <ul className="space-y-0.5 text-[0.875rem]">
                {documents.map((d) => {
                  const split = d.parts.length > 1
                  const here = activeDoc.tab === d.tab
                  return (
                    <li key={d.tab}>
                      <NavItem
                        current={here && (!split || active === d.parts[0].tab) ? true : here ? 'within' : false}
                        done={hydrated && d.tab !== 'intro' && isRead(d)}
                        onClick={() => selectTab(d.parts[0].tab, true)}
                      >
                        <span className="font-medium">{d.label}</span>
                        {d.optional && <span className="ml-1.5 text-[0.75rem] font-normal text-subtle">optional</span>}
                      </NavItem>
                      {here && !split && <SectionLinks doc={d.parts[0].doc} />}
                      {split && (here || !d.optional) && (
                        <ul className="mb-1 ml-3 space-y-0.5 border-l border-border pl-2">
                          {d.parts.map((p, pi) => (
                            <li key={p.tab}>
                              <NavItem
                                current={active === p.tab}
                                done={hydrated && read.includes(p.tab)}
                                onClick={() => selectTab(p.tab, true)}
                                label={`${d.label}, part ${pi + 1}`}
                              >
                                Part {pi + 1}
                              </NavItem>
                              {active === p.tab && <SectionLinks doc={p.doc} />}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
              {hydrated && (
                <p className="mt-4 border-t border-border pt-3 text-[0.75rem] tabular-nums text-subtle">
                  {counted.filter(isRead).length} of {counted.length} read
                </p>
              )}
            </nav>
          </div>

          <div ref={tabsRef} className="min-w-0 scroll-mt-20">
            {documents.map(panel)}
          </div>
        </div>

        <PrevNext
          prev={study.prev && { href: scenarioHref(study.prev), title: qualifiedTitle(study.prev) }}
          next={study.next && { href: scenarioHref(study.next), title: qualifiedTitle(study.next) }}
        />
      </article>
    )
  }

  return (
    <article>
      {/* One document needs no tab bar; the mark-as-read control below still works. */}
      {documents.length > 1 && (
      <div
        ref={tabsRef}
        className="no-print sticky top-[3.75rem] z-20 -mx-4 mb-8 border-y border-border bg-bg/85 px-4 backdrop-blur-md sm:mx-0 sm:rounded-lg sm:border sm:px-2"
      >
        <div role="tablist" aria-label="Case study documents" className="flex gap-1 overflow-x-auto py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {documents.map((d) => {
            const selected = activeDoc.tab === d.tab
            const done = hydrated && isRead(d)
            return (
              <button
                key={d.tab}
                type="button"
                role="tab"
                id={`tab-${d.tab}`}
                aria-selected={selected}
                aria-controls={`panel-${d.tab}`}
                onClick={() => selectTab(d.parts[0].tab)}
                className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[0.875rem] font-medium transition-colors ${
                  selected
                    ? 'bg-accent-soft text-accent'
                    : 'text-muted hover:bg-surface-2 hover:text-text'
                }`}
              >
                {done && <Check className="h-3.5 w-3.5 text-success" />}
                {d.label}
              </button>
            )
          })}
          {hydrated && (
            <span className="ml-auto hidden shrink-0 self-center pr-2 text-[0.75rem] tabular-nums text-subtle sm:inline">
              {counted.filter(isRead).length} of {counted.length} read
            </span>
          )}
        </div>
      </div>
      )}

      {documents.map(panel)}

      <PrevNext
        prev={study.prev && { href: scenarioHref(study.prev), title: qualifiedTitle(study.prev) }}
        next={study.next && { href: scenarioHref(study.next), title: qualifiedTitle(study.next) }}
      />
    </article>
  )
}

/** The sections of the page shown, under its sidebar entry: the case's "On this page". */
function SectionLinks({ doc }: { doc: ReadingDocument }) {
  const sections = doc.sections.filter((s) => s.title)
  if (sections.length < 2) return null
  return (
    <ul aria-label="On this page" className="mb-1 ml-2.5 mt-0.5 space-y-0.5">
      {sections.map((s) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            className="block rounded px-2 py-1 text-[0.8125rem] leading-snug text-subtle transition-colors hover:text-text"
            dangerouslySetInnerHTML={{ __html: s.title! }}
          />
        </li>
      ))}
    </ul>
  )
}

/** A sidebar entry. `current` is true for the page shown, 'within' for its document. */
function NavItem({
  current,
  done,
  onClick,
  label,
  children,
}: {
  current: boolean | 'within'
  done: boolean
  onClick: () => void
  label?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={current === true ? 'page' : undefined}
      aria-label={label}
      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors ${
        current === true
          ? 'bg-accent-soft text-accent'
          : current === 'within'
            ? 'text-text'
            : 'text-muted hover:bg-surface-2 hover:text-text'
      }`}
    >
      <span className="min-w-0 flex-1">{children}</span>
      {done && <Check className="h-3.5 w-3.5 shrink-0 text-success" />}
    </button>
  )
}

/** One reading document with its contents list. Also used by the Last-Day guides. */
export function ReadingPanel({
  doc,
  drawDiagrams,
  toc: showToc = true,
  title = true,
}: {
  doc: ReadingDocument
  drawDiagrams: boolean
  /** False beside a case sidebar, which lists the sections itself. */
  toc?: boolean
  /** False beside a case sidebar, which already names the page shown. */
  title?: boolean
}) {
  const toc = showToc ? doc.sections.filter((s) => s.title) : []
  // No contents list for a single section, and no empty column where it would be.
  return (
    <div className={toc.length > 1 ? 'lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10' : undefined}>
      <aside className="no-print hidden lg:block">
        {toc.length > 1 && (
          <nav aria-label="On this page" className="sticky top-[8.5rem] max-h-[calc(100vh-10rem)] overflow-y-auto">
            <div className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-subtle">
              On this page
            </div>
            <ul className="space-y-0.5 border-l border-border">
              {toc.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="-ml-px block border-l border-transparent py-1 pl-3 text-[0.8125rem] leading-snug text-muted transition-colors hover:border-accent hover:text-text"
                    dangerouslySetInnerHTML={{ __html: s.title! }}
                  />
                </li>
              ))}
            </ul>
          </nav>
        )}
      </aside>

      <div className="min-w-0">
        {title && doc.title && (
          <div className="mb-6 border-b border-border pb-4 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-subtle">
            {doc.title}
          </div>
        )}
        <div className="space-y-10">
          {doc.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-32">
              {section.title && (
                <h2
                  className="mb-4 text-[1.375rem] font-semibold leading-snug tracking-[-0.014em]"
                  dangerouslySetInnerHTML={{ __html: section.title }}
                />
              )}
              <div className="space-y-4">
                {section.chunks.map((chunk, i) =>
                  chunk.kind === 'diagram' ? (
                    drawDiagrams || hasStaticDiagram(chunk.code) ? (
                      <Diagram key={i} code={chunk.code} />
                    ) : (
                      <div key={i} className="h-40 rounded-lg border border-dashed border-border" />
                    )
                  ) : (
                    <div
                      key={i}
                      className="prose reading"
                      dangerouslySetInnerHTML={{ __html: chunk.html }}
                    />
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className}>
      <path
        d="M3.5 8.5l3 3 6-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
