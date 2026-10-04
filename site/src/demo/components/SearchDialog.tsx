'use client'

/**
 * ⌘K search for the prototype. Same interaction as the live `SearchDialog` (lazy index
 * fetch on intent, arrow keys, Enter, Escape) but over the demo index at
 * `/demo/search-index.json`, so it never touches the live site's index.
 */
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { searchEntries, type DemoSearchEntry } from '../search'

let request: Promise<DemoSearchEntry[]> | null = null
function loadIndex() {
  request ??= fetch('/demo/search-index.json')
    .then((r) => {
      if (!r.ok) throw new Error(`demo search index: HTTP ${r.status}`)
      return r.json() as Promise<DemoSearchEntry[]>
    })
    .catch((e) => {
      request = null
      throw e
    })
  return request
}

export function SearchDialog() {
  const router = useRouter()
  const [entries, setEntries] = useState<DemoSearchEntry[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const show = useCallback(() => {
    setFailed(false)
    setQuery('')
    setActive(0)
    setOpen(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((was) => {
          if (was) return false
          setQuery('')
          setActive(0)
          requestAnimationFrame(() => inputRef.current?.focus())
          return true
        })
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open || entries) return
    let live = true
    loadIndex()
      .then((x) => live && setEntries(x))
      .catch(() => live && setFailed(true))
    return () => {
      live = false
    }
  }, [open, entries])

  const results = useMemo(() => searchEntries(entries ?? [], query), [entries, query])

  const go = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault()
      go(results[active].href)
    }
  }

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  return (
    <>
      <button
        type="button"
        onClick={show}
        onPointerEnter={() => void loadIndex().catch(() => {})}
        onFocus={() => void loadIndex().catch(() => {})}
        aria-label="Search the prototype"
        aria-keyshortcuts="Meta+K Control+K"
        className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[0.8125rem] text-subtle transition-colors hover:border-border-strong hover:text-muted"
      >
        <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5L14 14" strokeLinecap="round" />
        </svg>
        <span className="hidden lg:inline">Search</span>
        <kbd className="hidden rounded border border-border bg-surface-2 px-1 font-sans text-[0.6875rem] lg:inline">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]" role="dialog" aria-modal="true" aria-label="Search">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-lg)]">
            <div className="flex items-center gap-2.5 border-b border-border px-4">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActive(0)
                }}
                onKeyDown={onKeyDown}
                placeholder="Search tracks, modules, lessons, projects, questions…"
                aria-label="Search"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls="demo-search-results"
                aria-activedescendant={results[active] ? `demo-search-${active}` : undefined}
                className="w-full bg-transparent py-3.5 text-[0.9375rem] text-text outline-none placeholder:text-subtle"
              />
            </div>
            <ul ref={listRef} id="demo-search-results" role="listbox" className="overflow-y-auto py-1.5">
              {failed && <li className="px-4 py-6 text-center text-[0.875rem] text-danger">Search could not load. Close it and try again.</li>}
              {!failed && query.trim() === '' && (
                <li className="px-4 py-6 text-center text-[0.875rem] text-subtle">Search tracks, modules, lessons, projects, interview questions, cases and glossary terms.</li>
              )}
              {!failed && !entries && query.trim() !== '' && <li className="px-4 py-6 text-center text-[0.875rem] text-subtle">Loading…</li>}
              {entries && query.trim() !== '' && results.length === 0 && (
                <li className="px-4 py-6 text-center text-[0.875rem] text-subtle">Nothing matched “{query}”.</li>
              )}
              {results.map((r, i) => (
                <li key={`${r.href}-${i}`} data-index={i} id={`demo-search-${i}`} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r.href)}
                    className={`block w-full px-4 py-2.5 text-left ${i === active ? 'bg-accent-soft' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[0.875rem] font-medium">{r.title}</span>
                      <span className="shrink-0 rounded bg-surface-2 px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-subtle">{r.kind}</span>
                    </div>
                    <div className="truncate text-[0.75rem] text-subtle">{r.subtitle}</div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-3 border-t border-border px-4 py-2 text-[0.6875rem] text-subtle">
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
