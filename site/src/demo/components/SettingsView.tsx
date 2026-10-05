'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import * as repo from '../repo'
import { exportLearner, importLearner, resetLearner, signOutDemo, update } from '../store/useDemo'
import { Select } from './CurriculumOverview'
import { ConfirmDialog, toast } from './feedback'
import { useLearner } from './islands'
import { Card, ErrorState, H2, btn, cx, formatDate } from './ui'
import { Input } from '@/components/ui'

export function SettingsView() {
  const data = useLearner()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [importError, setImportError] = useState('')
  const [profile, setProfile] = useState<Record<string, string> | null>(null)
  if (!data) return null
  const { state, progress } = data
  const fields = profile ?? { name: state.user.name, currentRole: state.user.currentRole, targetRole: state.user.targetRole, github: state.user.github, linkedin: state.user.linkedin }

  const download = () => {
    const json = exportLearner()
    if (!json) return
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `forward-deployed-demo-${state.user.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('Progress exported.')
  }

  const onFile = async (f: File | undefined) => {
    if (!f) return
    const err = importLearner(await f.text())
    setImportError(err ?? '')
    if (!err) toast('Progress imported.')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="max-w-3xl space-y-2">
      <H2>Path and pace</H2>
      <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          id="s-path"
          label="Learning path"
          value={state.pathId}
          onChange={(v) => {
            update((s) => void (s.pathId = v), { kind: 'path-chosen', itemId: v, label: `Chose the ${repo.getPath(v)?.title} path`, href: repo.href.path(v) })
            toast('Path updated.')
          }}
          options={repo.listPaths().map((p): [string, string] => [p.id, p.title])}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="s-hours" className="text-[0.75rem] font-semibold text-subtle">
            Weekly hours: {state.weeklyHours}
          </label>
          <input id="s-hours" type="range" min={1} max={30} value={state.weeklyHours} onChange={(e) => update((s) => void (s.weeklyHours = Number(e.target.value)))} className="accent-[var(--accent)]" />
          <p className="text-[0.8125rem] text-muted">
            Finish by {formatDate(progress.path.finishBy.date)} ({progress.path.finishBy.days} days for {Math.round(progress.path.remainingMinutes / 60)} h left).
          </p>
        </div>
      </Card>

      <H2>Profile</H2>
      <Card>
        <form
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            update((s) => void (s.user = { ...s.user, ...fields }))
            setProfile(null)
            toast('Profile saved.')
          }}
        >
          {(
            [
              ['name', 'Name'],
              ['currentRole', 'Current role'],
              ['targetRole', 'Target role'],
              ['github', 'GitHub (placeholder)'],
              ['linkedin', 'LinkedIn (placeholder)'],
            ] as const
          ).map(([k, l]) => (
            <div key={k}>
              <label htmlFor={`p-${k}`} className="text-[0.75rem] font-semibold text-subtle">
                {l}
              </label>
              <Input id={`p-${k}`} value={fields[k]} onChange={(e) => setProfile({ ...fields, [k]: e.target.value })} className="mt-1" />
            </div>
          ))}
          <div className="flex items-end">
            <button type="submit" className={btn.secondary} disabled={!profile}>
              Save profile
            </button>
          </div>
        </form>
      </Card>

      <H2>Time travel (demo control)</H2>
      <Card>
        <p className="text-[0.875rem] text-muted">
          Shift the learner’s clock to see decay, revision due dates and the 7-day mastery rule. Currently {state.clockOffsetDays === 0 ? 'today' : `${state.clockOffsetDays} days ahead`}.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[7, 14, 30].map((d) => (
            <button key={d} type="button" className={btn.secondary} onClick={() => (update((s) => void (s.clockOffsetDays += d)), toast(`Clock moved ${d} days ahead.`, 'info'))}>
              +{d} days
            </button>
          ))}
          <button type="button" className={btn.ghost} disabled={state.clockOffsetDays === 0} onClick={() => (update((s) => void (s.clockOffsetDays = 0)), toast('Clock reset to today.', 'info'))}>
            Back to today
          </button>
        </div>
      </Card>

      <H2>Your data</H2>
      <Card className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn.secondary} onClick={download}>
            Export progress (JSON)
          </button>
          <label className={cx(btn.secondary, 'cursor-pointer focus-within:ring-2 focus-within:ring-accent')}>
            Import progress
            <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={(e) => void onFile(e.target.files?.[0])} />
          </label>
          <button type="button" className={btn.danger} onClick={() => setConfirmReset(true)}>
            Reset demo data
          </button>
        </div>
        {importError && <ErrorState title="Import failed" body={importError} />}
        <p className="text-[0.8125rem] text-subtle">
          Stored only in this browser under <code>fd:demo:v1:*</code>. The live site’s <code>fd:v1:*</code> progress is never read or changed.
        </p>
      </Card>

      <H2>Session</H2>
      <button
        type="button"
        className={btn.secondary}
        onClick={() => {
          signOutDemo()
          router.push('/demo')
        }}
      >
        Sign out
      </button>

      <ConfirmDialog
        open={confirmReset}
        title="Reset demo data?"
        body={state.user.isDemo ? 'This restores Alex Morgan’s seeded progress and discards everything you changed. Export first if you want to keep it.' : 'This clears all of your progress in this browser. Export first if you want to keep it.'}
        confirmLabel="Reset"
        danger
        onConfirm={() => {
          setConfirmReset(false)
          resetLearner()
          toast('Demo data reset.')
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}
