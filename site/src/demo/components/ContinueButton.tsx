'use client'

import Link from 'next/link'
import * as repo from '../repo'
import { isDone } from '../store/rules'
import { useDemo } from '../store/useDemo'
import { btn } from './ui'

/** Start or Continue: the first unfinished module in a track, in curriculum order. */
export function ContinueButton({ trackId }: { trackId: string }) {
  const { progress } = useDemo()
  const modules = repo.listModules(trackId)
  const started = modules.some((m) => {
    const s = progress?.modules[m.id]?.status
    return s && s !== 'not-started' && s !== 'blocked'
  })
  const next = modules.find((m) => !isDone(progress?.modules[m.id]?.status ?? 'not-started')) ?? modules[0]
  const allDone = progress && modules.every((m) => isDone(progress.modules[m.id].status))
  return (
    <Link href={repo.href.module(next)} className={btn.primary}>
      {allDone ? 'Review track' : started ? 'Continue' : 'Start'}: {next.code}
    </Link>
  )
}
