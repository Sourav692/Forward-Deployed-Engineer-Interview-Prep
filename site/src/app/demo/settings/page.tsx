import type { Metadata } from 'next'
import { AuthGate } from '@/demo/components/islands'
import { SettingsView } from '@/demo/components/SettingsView'
import { Breadcrumbs, PageHeader } from '@/demo/components/ui'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Progress', href: '/demo/progress' }, { label: 'Settings' }]} />
      <AuthGate>
        <PageHeader eyebrow="Progress" title="Settings" description="Path, weekly hours, profile, the demo clock, and your data." />
        <SettingsView />
      </AuthGate>
    </>
  )
}
