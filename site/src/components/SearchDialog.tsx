'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { SearchEntry } from '@/lib/scenario'
import { SEARCH_AREAS, searchAreaHref, type SearchArea } from '@/lib/search-areas'
import { OPEN_SEARCH_EVENT } from '@/components/shell/nav'
import { focusRing } from '@/components/ui'

/**
 * Full-text search over tracks, modules, lessons, worksheets, answer keys, case studies,
 * reviews and the glossary.
 *
 * The index is split into one static file per area (`/search/{area}.json`, built at build
 * time). The files are fetched in parallel the first time search opens rather than
 * embedded in every page, because together they would weigh down every page view for a
 * feature most visits never use. Searching itself is one pass over an in-memory array —
 * no backend.
 */
const areaRequests = new Map<SearchArea, Promise<SearchEntry[]>>()

function loadArea(area: SearchArea): Promise<SearchEntry[]> {
  // One request per area per page load, shared by every open. A failed fetch clears its
  // promise so the next open retries that area instead of caching the failure.
  let request = areaRequests.get(area)
  if (!request) {
    request = fetch(searchAreaHref(area))
      .then((r) => {
        if (!r.ok) throw new Error(`search ${area}: HTTP ${r.status}`)
        return r.json() as Promise<SearchEntry[]>
      })
      .catch((error) => {
        areaRequests.delete(area)
        throw error
      })
    areaRequests.set(area, request)
  }
  return request
}

const loadIndex = (): Promise<SearchEntry[]> =>
  Promise.all(SEARCH_AREAS.map(loadArea)).then((areas) => areas.flat())

/** True when a key press is meant for a text field, so `/` should type, not open search. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
}

export function SearchDialog() {
  const router = useRouter()
  const [entries, setEntries] = useState<SearchEntry[] | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  // Where focus was before the dialog opened, so closing can put it back.
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const id = useId()
  const listId = `${id}-results`
  const optionId = (i: number) => `${id}-option-${i}`

  // Opening always starts from a clean slate. Done here rather than in an effect
  // watching `open` so the reset happens with the state change that caused it.
  const openDialog = useCallback(() => {
    const focused = document.activeElement
    returnFocusRef.current = focused instanceof HTMLElement && focused !== document.body ? focused : triggerRef.current
    setLoadFailed(false)
    setQuery('')
    setActive(0)
    setOpen(true)
    // Focus after the dialog paints, otherwise the element is not yet focusable.
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  const closeDialog = useCallback(() => {
    setOpen(false)
    const target = returnFocusRef.current
    returnFocusRef.current = null
    requestAnimationFrame(() => target?.focus())
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (open) closeDialog()
        else openDialog()
        return
      }
      if (!open && e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping(e.target)) {
        e.preventDefault()
        openDialog()
        return
      }
      if (open && e.key === 'Escape') closeDialog()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, openDialog, closeDialog])

  // Other shell pieces (the mobile bottom bar) open search by firing this event.
  useEffect(() => {
    window.addEventListener(OPEN_SEARCH_EVENT, openDialog)
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, openDialog)
  }, [openDialog])

  // Fetch the index the first time search opens. The state updates land in the
  // promise callbacks, after the effect has returned.
  useEffect(() => {
    if (!open || entries) return
    let live = true
    loadIndex()
      .then((index) => live && setEntries(index))
      .catch(() => live && setLoadFailed(true))
    return () => {
      live = false
    }
  }, [open, entries])

  const results = useMemo(() => search(entries ?? [], query), [entries, query])
  const hasQuery = query.trim() !== ''

  // A new query invalidates the highlighted row, so they change together.
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    setActive(0)
  }, [])

  const go = useCallback(
    (href: string) => {
      setOpen(false)
      returnFocusRef.current = null
      // The Last-Day reviews are static HTML files, not app routes, so they need a
      // full navigation; the client router would look for a page that does not exist.
      if (/\.html(#|$)/.test(href)) window.location.assign(href)
      else router.push(href)
    },
    [router],
  )

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter' && results[active]) {
      e.preventDefault()
      go(results[active].href)
    }
    // The input is the dialog's only focus stop (results are chosen with the arrow keys),
    // so Tab stays here instead of escaping to the page behind the modal.
    if (e.key === 'Tab') e.preventDefault()
  }

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [active])

  let status = ''
  if (loadFailed) status = 'Search could not load. Check your connection and open it again.'
  else if (!hasQuery) status = 'Search every lesson, module, worksheet, model answer, case study and review.'
  else if (!entries) status = 'Loading the search index…'
  else if (results.length === 0) status = `Nothing matched “${query}”.`

  const announcement =
    hasQuery && entries && !loadFailed
      ? results.length === 0
        ? 'No results.'
        : `${results.length}${results.length === MAX_RESULTS ? ' or more' : ''} result${results.length === 1 ? '' : 's'}.`
      : status

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        // Start the download on intent, so the index is usually there by the time the
        // dialog opens.
        onPointerEnter={() => void loadIndex().catch(() => {})}
        onFocus={() => void loadIndex().catch(() => {})}
        aria-label="Search the site"
        aria-keyshortcuts="Meta+K Control+K /"
        className={`flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[0.8125rem] text-subtle transition-colors hover:border-border-strong hover:text-muted ${focusRing}`}
      >
        <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5L14 14" strokeLinecap="round" />
        </svg>
        {/* Icon only at lg–xl, where the six area links need the header width. */}
        <span className="hidden sm:inline lg:hidden xl:inline">Search</span>
        <kbd className="hidden rounded border border-border bg-surface-2 px-1 font-sans text-[0.6875rem] sm:inline lg:hidden xl:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-title`}
        >
          <h2 id={`${id}-title`} className="sr-only">
            Search
          </h2>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={closeDialog} />
          <div className="relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-lg)]">
            <div className="flex items-center gap-2.5 border-b border-border px-4 focus-within:ring-4 focus-within:ring-inset focus-within:ring-accent-ring">
              <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4 shrink-0 text-subtle" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="7" cy="7" r="4.5" />
                <path d="M10.5 10.5L14 14" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search lessons, practice, case studies and reviews…"
                aria-label="Search the site"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={results.length > 0}
                aria-controls={listId}
                aria-activedescendant={results[active] ? optionId(active) : undefined}
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-transparent py-3.5 text-[0.9375rem] text-text outline-none placeholder:text-subtle"
              />
            </div>

            {status && <p className="px-4 py-6 text-center text-[0.875rem] text-subtle">{status}</p>}
            <p role="status" aria-live="polite" className="sr-only">
              {announcement}
            </p>

            <ul ref={listRef} id={listId} role="listbox" aria-label="Search results" className="overflow-y-auto py-1.5">
              {results.map((entry, i) => (
                // Options are chosen from the input with the arrow keys (the combobox
                // pattern), so they take pointer clicks but are not focus stops themselves.
                <li
                  key={`${entry.href}-${entry.kind}-${i}`}
                  id={optionId(i)}
                  data-index={i}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(entry.href)}
                  className={`block w-full cursor-pointer px-4 py-2.5 text-left transition-colors ${
                    i === active ? 'bg-accent-soft' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[0.875rem] font-medium">{entry.section}</span>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide ${
                        entry.kind === 'Model Answer' ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-subtle'
                      }`}
                    >
                      {entry.kind}
                    </span>
                  </div>
                  <div className="truncate text-[0.75rem] text-subtle">{entry.title}</div>
                </li>
              ))}
            </ul>

            <div aria-hidden className="flex gap-3 border-t border-border px-4 py-2 text-[0.6875rem] text-subtle">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const MAX_RESULTS = 30

/**
 * Ranked substring matching: a hit in the section heading or scenario title beats a
 * hit in the body, and every term must appear somewhere. Good enough for a corpus
 * this size, and it avoids shipping a fuzzy-search dependency.
 */
function search(entries: SearchEntry[], query: string): SearchEntry[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []

  const scored: { entry: SearchEntry; score: number }[] = []

  for (const entry of entries) {
    const section = entry.section.toLowerCase()
    const title = entry.title.toLowerCase()
    const text = entry.text.toLowerCase()

    let score = 0
    let matchedAll = true

    for (const term of terms) {
      if (section.includes(term)) score += 12
      else if (title.includes(term)) score += 8
      else if (text.includes(term)) score += 1
      else {
        matchedAll = false
        break
      }
    }

    if (matchedAll) scored.push({ entry, score })
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map((s) => s.entry)
}
