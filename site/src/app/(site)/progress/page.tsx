import type { Metadata } from 'next'
import Link from 'next/link'
import { Dashboard } from '@/components/progress/Dashboard'
import { dashboardData } from '@/lib/dashboard'

/**
 * /progress (FE-16): next up, interview readiness, revision queue, finish-by date,
 * track progress, recent activity and bookmarks. A static shell; the dashboard island
 * reads this browser's progress after hydration (`.website_spec/reference/2026-10-05-learn-ux.md` § Dashboard).
 */

export const metadata: Metadata = {
  title: 'Progress',
  description: 'Your study progress, readiness and revision queue, measured from what you have done in this browser.',
}

export default async function ProgressPage() {
  const data = await dashboardData()
  return (
    <>
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">Progress</h1>
        <p className="mt-3 text-base text-muted">
          Your study, measured from what you have done in this browser.{' '}
          <Link href="/settings" className="text-accent underline underline-offset-2">
            Settings
          </Link>{' '}
          has your weekly hours and export, import and reset.
        </p>
      </header>
      <Dashboard modules={data.modules} sheets={data.sheets} />
    </>
  )
}
