import type { Metadata } from 'next'
import { AuthGate } from '@/demo/components/islands'
import { ReadinessExamRunner } from '@/demo/components/InterviewRunners'
import { Breadcrumbs, PageHeader } from '@/demo/components/ui'

export const metadata: Metadata = { title: 'Final readiness exam' }

export default function ReadinessExamPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Interview', href: '/demo/interview' }, { label: 'Readiness exam' }]} />
      <AuthGate>
        <PageHeader eyebrow="Final readiness exam · 150 minutes · simulated" title="One scenario, end to end" description="Closed book. Pass at 82/100. Any automatic-fail condition caps the result below the pass mark, whatever the section scores." />
        <ReadinessExamRunner />
      </AuthGate>
    </>
  )
}
