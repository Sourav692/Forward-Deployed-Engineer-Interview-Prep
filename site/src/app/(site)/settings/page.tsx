import type { Metadata } from 'next'
import { StorageNotice } from '@/components/learn/ProgressIslands'
import { SettingsView } from '@/components/progress/SettingsView'
import { Toaster } from '@/components/ui'

/**
 * /settings (FE-17). A static shell: the settings themselves are a client island that
 * reads the learner store after hydration. `robots.ts` keeps it out of search.
 */

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Weekly study hours, and export, import or reset of the progress stored in this browser.',
}

export default function SettingsPage() {
  return (
    <div className="py-8 sm:py-10">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">Settings</h1>
        <p className="mt-3 text-base text-muted">
          Your path, pace and progress live only in this browser. Nothing is sent to a server.
        </p>
      </header>
      <StorageNotice />
      <SettingsView />
      <Toaster />
    </div>
  )
}
