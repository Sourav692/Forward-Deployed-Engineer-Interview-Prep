import type { Metadata } from 'next'
import { PathPicker } from '@/demo/components/PathPicker'
import { Breadcrumbs, PageHeader } from '@/demo/components/ui'

export const metadata: Metadata = { title: 'Start' }

export default function StartPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Start' }]} />
      <PageHeader
        eyebrow="Start"
        title="Choose your path"
        description="Seven paths cover the common starting points, plus two company variants. The diagnostic recommends one; you can change it any time in Settings."
      />
      <PathPicker />
    </>
  )
}
