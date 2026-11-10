'use client'

import { PrevNext } from '@/components/PrevNext'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CaseStudy } from '@/lib/scenario'
import { documentsOf, hasChapters, qualifiedTitle, scenarioHref, type CaseDocument } from '@/lib/scenario'
import type { ReadingDocument } from '@/lib/reading'
import { loadLastPart, loadRead, notifyProgress, saveLastPart, saveRead } from '@/lib/storage'
import { Diagram, hasStaticDiagram } from './Diagram'
import { SHOW_STUDY_TIME } from '@/lib/study-time'

/**
 * A reading page: one case study, four documents, one tab each.
 *
 * A case on the chapters pilot (`hasChapters`) swaps the tab row for a sidebar: an
 * Introduction page, then each document with its parts (ENH-25 splits) nested under it,
 * one part shown at a time. Each part keeps its own tab id (`full-pack-part-3`) in the
 * hash and in saved progress, so links and read state hold. Those pages also mark a part
 * read when the reader scrolls to its end, offer to resume the last part opened, and
 * move between parts with the left and right arrow keys.
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
  const chapters = hasChapters(study)
  /** The part last marked read by reaching its end, so its button can say so. */
  const [autoRead, setAutoRead] = useState<string | null>(null)
  /** Parts the reader unmarked: reaching their end again does not re-mark them. */
  const unmarked = useRef(new Set<string>())
  /** The part the reader last had open on an earlier visit, offered on the Introduction. */
  const [resume, setResume] = useState<string | null>(null)

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

    // On a hash change, the event's own URL is the reader's target. The location can be
    // stale by the time the event runs: a tab switch just before (replaceState) leaves a
    // router update queued, which writes that tab's URL back over the new hash. So take the
    // hash from the event, and put it back in the address bar if it was overwritten.
    const apply = (e?: HashChangeEvent) => {
      const hash = e ? new URL(e.newURL).hash : window.location.hash
      const target = tabForHash(hash, tabKey.split('|'))
      if (!target) return
      if (e && window.location.hash !== hash) window.history.replaceState(null, '', hash)
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
    if (chapters && !window.location.hash) {
      const last = loadLastPart(progressId)
      if (last && last !== 'intro' && current.includes(last)) setResume(last)
    }
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [chapters, progressId, show, tabKey])
  /* eslint-enable react-hooks/set-state-in-effect */

  const selectTab = useCallback(
    (tab: string, scroll = false) => {
      show(tab)
      setMenuOpen(false)
      // replaceState, not a hash assignment: a tab click should not pile up history
      // entries, and should not make the browser jump to an element.
      window.history.replaceState(null, '', `#${tab}`)
      if (scroll) {
        const top = (tabsRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 72
        window.scrollTo({ top: Math.max(top, 0) })
      }
    },
    [show],
  )

  const toggleRead = (tab: string) => {
    setAutoRead(null)
    setRead((prev) => {
      const next = prev.includes(tab) ? prev.filter((t) => t !== tab) : [...prev, tab]
      if (!next.includes(tab)) unmarked.current.add(tab)
      saveRead(progressId, next, readable.length)
      notifyProgress()
      return next
    })
  }

  // Remember the part open, so a later visit can offer to resume it.
  useEffect(() => {
    if (chapters && hydrated && active !== 'intro') saveLastPart(progressId, active)
  }, [active, chapters, hydrated, progressId])

  // Mark a part read when the reader scrolls down to its end. Arriving there by a jump
  // does not count: the reader must scroll at least a screen within the part first.
  const total = readable.length
  useEffect(() => {
    if (!chapters || !hydrated || active === 'intro') return
    const end = document.getElementById(`end-${active}`)
    if (!end) return
    const start = window.scrollY
    const observer = new IntersectionObserver(([entry]) => {
      const scrolled = window.scrollY - start > window.innerHeight
      if (!entry.isIntersecting || !scrolled || unmarked.current.has(active)) return
      setRead((prev) => {
        if (prev.includes(active)) return prev
        const next = [...prev, active]
        saveRead(progressId, next, total)
        notifyProgress()
        return next
      })
      setAutoRead(active)
    })
    observer.observe(end)
    return () => observer.disconnect()
  }, [active, chapters, hydrated, progressId, total])

  // Left and right arrows move to the previous and next part, unless the reader is
  // typing or scrolling a wide table or code block sideways.
  useEffect(() => {
    if (!chapters) return
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable], .table-wrap, pre')) return
      const order = tabKey.split('|')
      const to = order[order.indexOf(active) + (e.key === 'ArrowRight' ? 1 : -1)]
      if (!to) return
      e.preventDefault()
      selectTab(to, true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, chapters, selectTab, tabKey])

  const activeDoc = documents.find((d) => d.parts.some((p) => p.tab === active)) ?? documents[0]
  const isRead = (d: CaseDocument) => d.parts.every((p) => read.includes(p.tab))
  const counted = documents.filter((d) => d.tab !== 'intro')

  /** "Full Design, part 3" for a part of a split document; the document's label otherwise. */
  const partName = (tab: string) => {
    const d = documents.find((doc) => doc.parts.some((p) => p.tab === tab))
    if (!d) return tab
    return d.parts.length > 1 ? `${d.label}, part ${d.parts.findIndex((p) => p.tab === tab) + 1}` : d.label
  }

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
        {d.tab === 'intro' && resume && (
          <div className="cb-resume no-print">
            <span>You were reading {partName(resume)}.</span>
            <button type="button" onClick={() => selectTab(resume, true)} aria-label="Continue →" className="cb-btn cb-btn--primary">
              Continue
            </button>
          </div>
        )}
        <ReadingPanel doc={p.doc} drawDiagrams={visited.has(p.tab)} toc={!chapters} title={!chapters} />
        <div id={`end-${p.tab}`} aria-hidden />

        <div className="cb-part-foot no-print">
          {d.tab !== 'intro' && (
            <button
              type="button"
              onClick={() => toggleRead(p.tab)}
              aria-pressed={done}
              className={`cb-btn ${done ? 'cb-btn--done' : 'cb-btn--primary'}`}
            >
              {done && <Check className="h-4 w-4" />}
              {done ? `${name} marked as read` : `Mark ${name} as read`}
            </button>
          )}
          {chapters && (
            <span role="status" className="text-[0.8125rem] text-muted">
              {autoRead === p.tab && done && 'Marked when you reached the end. Select the button to undo.'}
            </span>
          )}
          {chapters && p.tab === 'cheat-sheet' && (
            <button
              type="button"
              onClick={() => window.print()}
              className="cb-btn"
            >
              Print or save as PDF
            </button>
          )}
          <div className="ml-auto flex flex-wrap gap-3">
            {split && pi > 0 && (
              <button
                type="button"
                onClick={() => selectTab(d.parts[pi - 1].tab, true)}
                aria-label={`← Part ${pi}`}
                className="cb-btn"
              >
                Previous: Part {pi}
              </button>
            )}
            {next && (
              <button
                type="button"
                onClick={() => selectTab(next.tab, true)}
                aria-label={`${d.tab === 'intro' ? 'Start' : 'Next'}: ${next.label} →`}
                className="cb-btn cb-btn--primary"
              >
                {d.tab === 'intro' ? 'Start' : 'Next'}: {next.label}
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
          <div className="cb-purpose no-print">
            <p className="cb-purpose-label">
              <strong>{d.label}</strong>
              {SHOW_STUDY_TIME ? (
                <span>
                  {d.minutes} min{split && ` in ${d.parts.length} parts`}
                </span>
              ) : (
                split && <span>{d.parts.length} parts</span>
              )}
              {d.optional && <span>Optional</span>}
            </p>
            <p className="cb-purpose-text">{d.purpose}</p>
          </div>
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
      <article className="case-chapters">
        <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
          <div className="no-print sticky top-[3.75rem] z-20 -mx-4 mb-6 border-b border-border bg-bg px-4 lg:top-20 lg:z-auto lg:mx-0 lg:mb-0 lg:self-start lg:border-0 lg:bg-transparent lg:px-0">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="case-contents"
              className="flex w-full items-center justify-between gap-3 py-3 text-left text-[0.875rem] font-semibold lg:hidden"
            >
              <span>
                Contents: <span className="text-muted">{activeLabel}</span>
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
                        minutes={d.tab === 'intro' ? undefined : d.minutes}
                      >
                        <span className="font-medium">{d.label}</span>
                        {d.optional && <span className="ml-1.5 text-[0.8125rem] text-muted">optional</span>}
                      </NavItem>
                      {here && !split && <SectionLinks doc={d.parts[0].doc} />}
                      {split && (here || !d.optional) && (
                        <ul className="mb-1 ml-3 space-y-0.5 pl-1">
                          {d.parts.map((p, pi) => (
                            <li key={p.tab}>
                              <NavItem
                                current={active === p.tab}
                                done={hydrated && read.includes(p.tab)}
                                onClick={() => selectTab(p.tab, true)}
                                label={`${d.label}, part ${pi + 1}`}
                                minutes={p.minutes}
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
                <p className="cb-label mt-4 border-t border-border pt-3 text-[0.8125rem] text-muted">
                  {counted.filter(isRead).length} of {counted.length} read
                </p>
              )}
            </nav>
          </div>

          <div ref={tabsRef} className="case-main min-w-0 scroll-mt-20">
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
        className="no-print sticky top-[3.75rem] z-20 -mx-4 mb-8 border-y border-border bg-bg px-4 sm:mx-0 sm:rounded-lg sm:border sm:px-2"
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
  minutes,
  children,
}: {
  current: boolean | 'within'
  done: boolean
  onClick: () => void
  label?: string
  minutes?: number
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={current === true ? 'page' : undefined}
      aria-label={label}
      data-state={current === 'within' ? 'within' : undefined}
      className="cb-nav-item"
    >
      <span className="min-w-0 flex-1">{children}</span>
      {done ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-success" />
      ) : (
        SHOW_STUDY_TIME && minutes !== undefined && <span className="cb-nav-min">{minutes} min</span>
      )}
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
                    title={s.title!.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&')}
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
                  ) : chunk.kind === 'html' ? (
                    <div
                      key={i}
                      className="prose reading"
                      dangerouslySetInnerHTML={{ __html: chunk.html }}
                    />
                  ) : null,
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
