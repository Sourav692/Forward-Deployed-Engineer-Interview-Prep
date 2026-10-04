'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Level, Topic } from '../types'
import * as repo from '../repo'
import { useDemo } from '../store/useDemo'
import { EmptyState, ProgressBar, StatusBadge, Tag, cx } from './ui'

const LEVELS: Level[] = ['foundation', 'intermediate', 'advanced']
const TOPICS: Topic[] = ['orientation', 'engineering', 'llm-retrieval', 'agents', 'production', 'design', 'fde', 'communication', 'interview', 'portfolio']
const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')

export function Select({ id, label: text, value, onChange, options }: { id: string; label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-[0.75rem] font-semibold text-subtle">
        {text}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="rounded-md border border-border-strong bg-surface px-2.5 py-1.5 text-[0.875rem]">
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  )
}

export function CurriculumOverview() {
  const { ready, progress, pathId } = useDemo()
  const [level, setLevel] = useState('')
  const [topic, setTopic] = useState('')
  const [req, setReq] = useState('')
  const path = repo.getPath(pathId) ?? repo.getPath('fde')!
  const tracks = repo.filterTracks({
    level: (level || undefined) as Level | undefined,
    topic: (topic || undefined) as Topic | undefined,
    required: req === '' ? undefined : req === 'required',
  })

  return (
    <div>
      <section aria-label="Your path" className="mb-6 rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[0.875rem]">
            <span className="text-subtle">Recommended sequence for </span>
            <Link href={repo.href.path(path.id)} className="font-semibold hover:text-accent">
              {path.title}
            </Link>
          </p>
          <Link href="/demo/start" className="text-[0.8125rem] font-semibold text-accent hover:underline">
            Change path
          </Link>
        </div>
        <ol className="mt-3 flex flex-wrap items-center gap-1.5 text-[0.8125rem]">
          {path.sequence.map((code, i) => {
            const trackId = code.split('.')[0].toLowerCase()
            return (
              <li key={`${code}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden className="text-subtle">→</span>}
                <Link href={repo.href.track(trackId)} className="rounded-md bg-surface-2 px-2 py-0.5 font-semibold hover:bg-accent-soft hover:text-accent">
                  {code}
                </Link>
              </li>
            )
          })}
        </ol>
      </section>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3" role="group" aria-label="Filter tracks">
        <Select id="f-level" label="Level" value={level} onChange={setLevel} options={[['', 'All levels'], ...LEVELS.map((l): [string, string] => [l, label(l)])]} />
        <Select id="f-topic" label="Topic" value={topic} onChange={setTopic} options={[['', 'All topics'], ...TOPICS.map((t): [string, string] => [t, label(t)])]} />
        <Select id="f-req" label="Required or optional" value={req} onChange={setReq} options={[['', 'All tracks'], ['required', 'Required'], ['optional', 'Optional']]} />
      </div>
      <p className="mb-3 text-[0.8125rem] text-subtle" aria-live="polite">
        Showing {tracks.length} of 10 tracks
      </p>

      {tracks.length === 0 ? (
        <EmptyState
          title="No tracks match these filters"
          body="Try another level or topic, or clear the filters to see all ten tracks."
          action={
            <button type="button" className="text-[0.875rem] font-semibold text-accent underline" onClick={() => (setLevel(''), setTopic(''), setReq(''))}>
              Clear filters
            </button>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {tracks.map((t) => {
            const skipped = repo.trackSkippedForPath(path.id, t.id)
            const tp = progress?.tracks[t.id]
            const mods = repo.listModules(t.id)
            const required = mods.filter((m) => path.moduleFlags[m.id] === 'required').length
            return (
              <li key={t.id}>
                <Link
                  href={repo.href.track(t.id)}
                  className={cx('flex h-full flex-col rounded-xl border bg-surface p-4 transition-colors hover:border-accent', skipped ? 'border-dashed border-border-strong opacity-75' : 'border-border')}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">
                      {t.code} {t.title}
                    </span>
                    <span className="ml-auto flex items-center gap-1.5">
                      {skipped ? <StatusBadge status="skipped" size="xs" /> : ready && tp && tp.status !== 'not-started' && <StatusBadge status={tp.status} size="xs" />}
                    </span>
                  </div>
                  <p className="mt-1 flex-1 text-[0.875rem] text-muted">{t.objective}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Tag tone={t.required ? 'accent' : 'neutral'}>{t.required ? 'Required' : 'Optional'}</Tag>
                    <Tag>{label(t.level)}</Tag>
                    <Tag>~{t.estHours} h</Tag>
                    <Tag>{mods.length} modules</Tag>
                    {skipped ? <Tag>Skipped for your path</Tag> : <Tag>{required} required on your path</Tag>}
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={tp?.fraction ?? 0} label={`${t.code} progress`} tone={tp?.status === 'completed' ? 'success' : 'accent'} />
                    <div className="mt-1 text-[0.75rem] tabular-nums text-subtle">{ready ? `${Math.round((tp?.fraction ?? 0) * 100)}% complete` : ' '}</div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
