import type { Metadata } from 'next'
import Link from 'next/link'
import { AreaHeader, AreaSection } from '@/components/areas/Area'
import { EmptyState } from '@/components/ui'
import { MODES } from '@/lib/editorial'

/**
 * /company-prep: the company-specific prep area. Each pack is tailored to one
 * company's interview loop (product context, likely exercises, questions to ask).
 * No pack is published yet: packs are written in `08_Company_Specific_Prep/` and
 * wired in one company at a time.
 */

export const metadata: Metadata = {
  title: 'Company Prep',
  description: 'Preparation packs tailored to one company’s interview loop: product context, likely exercises and questions to ask.',
}

export default function CompanyPrepPage() {
  return (
    <div className="py-12">
      <AreaHeader eyebrow="Company Prep" title="Prepare for One Company’s Loop">
        <p>{MODES['company-prep'].summary}</p>
      </AreaHeader>

      <AreaSection id="packs" title="Company Packs" description="One pack per company, added as each is written and checked.">
        <EmptyState
          title="No company packs yet"
          body={
            <>
              The first packs are being written. Until then, the general preparation under{' '}
              <Link href="/interview" className="text-accent underline underline-offset-2">
                Interview
              </Link>{' '}
              covers every loop.
            </>
          }
        />
      </AreaSection>
    </div>
  )
}
