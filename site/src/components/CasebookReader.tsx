'use client'

import { useEffect, useRef } from 'react'
import { loadRead, saveRead, saveStatus, notifyProgress } from '@/lib/storage'
import './casebook-reader.css'

export type CasebookPayload = {
  html: string
  html_sha256: string
  config: { slug: string; title: string; source_url: string; aliases: Record<string, string> }
  subtitle: string
  updated: string
}

const panels = ['walkthrough', 'deep-dives', 'quick-review']
const group = (tab: string) => /deep-dive/.test(tab) ? 'deep-dives' : /cheat-sheet|quick-review/.test(tab) ? 'quick-review' : 'walkthrough'

/** Server-rendered reading content with browser-local state and route-scoped events. */
export function CasebookReader({ payload, progressId, legacyTabs }: {
  payload: CasebookPayload
  progressId: string
  legacyTabs: string[]
}) {
  const root = useRef<HTMLDivElement>(null)
  const tabKey = legacyTabs.filter(tab => tab !== 'intro').join('|')
  useEffect(() => {
    let cancelled = false
    let dispose: (() => void) | undefined
    import('@/lib/casebook-reader').then(({ mountCasebookReader }) => {
      if (cancelled || !root.current) return
      const tabs = tabKey.split('|').filter(Boolean)
      const previous = loadRead(progressId)
      const initial = tabs.length && tabs.every(tab => previous.includes(tab))
        ? panels
        : panels.filter(panel => {
          const members = tabs.filter(tab => group(tab) === panel)
          return members.length && members.every(tab => previous.includes(tab))
        })
      dispose = mountCasebookReader(root.current, payload.config, (read: string[]) => {
        // Keep existing scenario keys and tab IDs for hub/search progress and rollback.
        // A section only partly read under the old tabs is not "read" here, but its saved
        // tabs survive until the reader marks that section read, or unmarks one it started read.
        const kept = tabs.filter(tab => read.includes(group(tab)) || (!initial.includes(group(tab)) && previous.includes(tab)))
        saveRead(progressId, kept, tabs.length)
        saveStatus(progressId, read.length === 3 ? 'mastered' : kept.length ? 'practiced' : 'not-started')
        notifyProgress()
      }, initial)
    })
    return () => { cancelled = true; dispose?.() }
  }, [payload.config, progressId, tabKey])

  return <div ref={root} className="casebook-reader" data-case-slug={payload.config.slug} data-reader-sha={payload.html_sha256} dangerouslySetInnerHTML={{ __html: payload.html }} />
}
