'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { Button, buttonClass } from '@/components/ui'
import { ThemeSync } from '@/components/areas/ThemeSync'

/**
 * Error boundary for every page under the (site) layout (FE-14). Error boundaries
 * must be Client Components. Next 16 passes `retry` (re-fetch and re-render the
 * segment) as well as `reset`; `retry` is the recommended recovery.
 *
 * The error message and stack are never shown: in production Server Component errors
 * arrive with a generic message anyway, and a stack trace helps no reader. The digest
 * is shown so a report can be matched to the server log.
 */
export default function SiteError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="py-16 sm:py-24">
      <ThemeSync />
      <div role="alert" className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-subtle">Something went wrong</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">This Page Did Not Load</h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Something failed while showing this page. Your saved progress is in this browser and is not affected. Try
          again, or go back to the curriculum.
        </p>
        {error.digest && <p className="mt-2 text-xs text-subtle">Reference: {error.digest}</p>}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => retry()}>Try again</Button>
        <Link href="/learn" className={buttonClass('secondary')}>
          Browse the curriculum
        </Link>
        <Link href="/" className={buttonClass('ghost')}>
          Home
        </Link>
      </div>
    </div>
  )
}
