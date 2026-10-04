import type { Metadata } from 'next'
import { AuthGate } from '@/demo/components/islands'
import { ProfileView } from '@/demo/components/ProfileViews'
import { Breadcrumbs, PageHeader } from '@/demo/components/ui'

export const metadata: Metadata = { title: 'Profile and portfolio' }

export default function ProfilePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Progress', href: '/demo/progress' }, { label: 'Profile' }]} />
      <AuthGate>
        <PageHeader eyebrow="Progress" title="Profile and portfolio" description="Skills are proven by evidence, not reading: checkpoints, exercises, mocks and projects." />
        <ProfileView />
      </AuthGate>
    </>
  )
}
