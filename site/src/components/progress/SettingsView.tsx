'use client'

/**
 * Settings (FE-17): weekly study hours on the chosen path, and the learner's data:
 * export to a JSON file, import one back, or reset. Everything goes through
 * `lib/progress/store`; nothing leaves the browser. Import replaces all progress, so it
 * is checked first (`checkImport`) and confirmed in a dialog before anything changes.
 */
import Link from 'next/link'
import { useRef, useState } from 'react'
import { checkImport, exportProgress, importProgress, resetProgress, setWeeklyHours } from '@/lib/progress/store'
import type { ProgressExport } from '@/lib/progress/types'
import { usePath, useStorageAvailable } from '@/lib/progress/useProgress'
import { useChosenPath } from '@/components/start/path-state'
import { Button, ConfirmDialog, ErrorState, Input, Skeleton, btn, cx, toast } from '@/components/ui'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export function SettingsView() {
  const storage = useStorageAvailable()
  const blocked = storage === false

  return (
    <div className="max-w-3xl space-y-10">
      <PathSection blocked={blocked} />
      <DataSection blocked={blocked} hydrated={storage !== null} />
    </div>
  )
}

function PathSection({ blocked }: { blocked: boolean }) {
  const chosen = useChosenPath()

  if (chosen === undefined) return <Skeleton className="h-32" />

  return (
    <section aria-labelledby="settings-path">
      <h2 id="settings-path" className="text-xl font-semibold">
        Path and pace
      </h2>
      {chosen === null ? (
        <p className="mt-2 text-sm text-muted">
          No path chosen yet. A path sets your weekly hours and flags which modules to study first.{' '}
          <Link href="/start" className="text-accent underline underline-offset-2">
            Choose a path
          </Link>
          .
        </p>
      ) : (
        <PaceForm
          key={chosen.path.id}
          title={chosen.path.title}
          pathId={chosen.path.id}
          estHours={chosen.path.estHours}
          disabled={blocked || !chosen.persisted}
        />
      )}
    </section>
  )
}

function PaceForm({
  title,
  pathId,
  estHours,
  disabled,
}: {
  title: string
  pathId: string
  estHours: number
  disabled: boolean
}) {
  const stored = usePath()
  // `draft` holds what the learner is typing; until they edit, show the saved value.
  const [draft, setDraft] = useState<string | null>(null)
  const value = draft ?? String(stored?.weeklyHours ?? '')
  const hours = Number(value)
  const valid = Number.isInteger(hours) && hours >= 1 && hours <= 40

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    if (setWeeklyHours(hours)) {
      setDraft(null)
      toast('Weekly hours saved.')
    } else toast("That didn't save. Storage may be full or blocked in this browser.", 'error')
  }

  return (
    <form onSubmit={save} className="mt-3 space-y-3">
      <p className="text-sm">
        Current path: <strong>{title}</strong>.{' '}
        <Link href={`/start/paths/${pathId}`} className="text-accent underline underline-offset-2">
          View path
        </Link>{' '}
        or{' '}
        <Link href="/start" className="text-accent underline underline-offset-2">
          choose another
        </Link>
        .
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="font-semibold">Weekly study hours</span>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={40}
            step={1}
            value={value}
            onChange={(e) => setDraft(e.target.value)}
            disabled={disabled}
            aria-invalid={!valid}
            aria-describedby="settings-hours-help"
            className="mt-1 max-w-28"
          />
        </label>
        <Button type="submit" variant="secondary" disabled={disabled || !valid || draft === null}>
          Save hours
        </Button>
      </div>
      <p id="settings-hours-help" className="text-sm text-muted">
        {valid
          ? `This path is about ${estHours} hours: roughly ${Math.max(1, Math.round(estHours / hours))} weeks at ${hours} hours a week.`
          : 'Enter a whole number of hours from 1 to 40.'}
      </p>
    </form>
  )
}

function DataSection({ blocked, hydrated }: { blocked: boolean; hydrated: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState('')
  const [pending, setPending] = useState<{ json: string; file: ProgressExport } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const download = () => {
    const file = exportProgress()
    const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `forward-deployed-progress-${file.exportedAt.slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('Progress exported.')
  }

  const onFile = async (f: File | undefined) => {
    if (fileRef.current) fileRef.current.value = ''
    if (!f) return
    const json = await f.text()
    const check = checkImport(json)
    if (!check.ok) return setImportError(check.error)
    setImportError('')
    setPending({ json, file: check.value })
  }

  const confirmImport = () => {
    if (!pending) return
    const result = importProgress(pending.json)
    setPending(null)
    if (result.ok) toast(`Progress imported: ${result.keys} ${result.keys === 1 ? 'entry' : 'entries'}.`)
    else setImportError(result.error)
  }

  const entries = pending ? Object.keys(pending.file.data).length : 0

  return (
    <section aria-labelledby="settings-data">
      <h2 id="settings-data" className="text-xl font-semibold">
        Your data
      </h2>
      <p className="mt-2 text-sm text-muted">
        Your progress, notes, scores and worksheet answers are stored only in this browser. Export them to move to
        another browser or keep a backup; import a file to restore it.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={download} disabled={!hydrated}>
          Export progress
        </Button>
        {/* A styled label opens the hidden file input; `relative` keeps the input inside it. */}
        <label
          className={cx(
            btn.secondary,
            'relative cursor-pointer focus-within:ring-4 focus-within:ring-accent-ring',
            (blocked || !hydrated) && 'pointer-events-none opacity-50',
          )}
        >
          Import progress
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            disabled={blocked || !hydrated}
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
        </label>
        <Button variant="danger" onClick={() => setConfirmReset(true)} disabled={blocked || !hydrated}>
          Reset progress
        </Button>
      </div>
      {importError && (
        <div className="mt-4">
          <ErrorState title="Import failed. Nothing was changed." body={importError} />
        </div>
      )}

      <ConfirmDialog
        open={pending !== null}
        title="Replace your progress?"
        body={`This replaces all progress in this browser with the file${
          pending?.file.exportedAt ? ` exported on ${formatDate(pending.file.exportedAt)}` : ''
        } (${entries} ${entries === 1 ? 'entry' : 'entries'}). Export first if you want to keep what is here now.`}
        confirmLabel="Replace progress"
        danger
        onConfirm={confirmImport}
        onCancel={() => setPending(null)}
      />
      <ConfirmDialog
        open={confirmReset}
        title="Reset all progress?"
        body="This clears every lesson read, rating, note, score and worksheet answer in this browser. Your theme is kept. Export first if you want to keep a copy."
        confirmLabel="Reset progress"
        danger
        onConfirm={() => {
          setConfirmReset(false)
          resetProgress()
          toast('Progress reset.')
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </section>
  )
}
