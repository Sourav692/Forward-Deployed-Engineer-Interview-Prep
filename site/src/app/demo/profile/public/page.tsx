import type { Metadata } from 'next'
import { AuthGate } from '@/demo/components/islands'
import { ProfileView } from '@/demo/components/ProfileViews'
import { Breadcrumbs, PageHeader } from '@/demo/components/ui'

export const metadata: Metadata = { title: 'Public profile preview' }

export default function PublicProfilePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Progress', href: '/demo/progress' }, { label: 'Profile', href: '/demo/profile' }, { label: 'Public preview' }]} />
      <AuthGate>
        <PageHeader eyebrow="Public preview" title="How others would see you" />
        <ProfileView publicView />
      </AuthGate>
    </>
  )
}
