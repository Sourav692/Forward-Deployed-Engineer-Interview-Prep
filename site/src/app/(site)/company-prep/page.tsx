import type { Metadata } from 'next'
import { AreaHeader, AreaSection } from '@/components/areas/Area'
import { LIVE } from '@/components/areas/data'
import { EmptyState, LinkButton } from '@/components/ui'
import { getAllScenarios } from '@/lib/content'
import { MODES } from '@/lib/editorial'
import { pageMetadata } from '@/lib/seo'

/**
 * /company-prep: the company-specific prep area. Each pack is tailored to one
 * company's interview loop (product context, likely exercises, questions to ask).
 * Packs are listed only when their synced guides are published.
 */

export const metadata: Metadata = pageMetadata({
  path: '/company-prep',
  title: 'Company Prep',
  description: 'Preparation packs tailored to one company’s interview loop: product context, likely exercises and questions to ask.',
})

export default async function CompanyPrepPage() {
  const guides = (await getAllScenarios()).filter((s) => s.moduleId === LIVE.companyPrep && s.trackId === 'blitzy-prep')
  return (
    <div className="py-12">
      <AreaHeader eyebrow="Company Prep" title="Prepare for One Company’s Loop">
        <p>{MODES['company-prep'].summary}</p>
      </AreaHeader>

      <AreaSection id="packs" title="Company Packs" description="Start with the company’s context, then practise the decisions its interview tests.">
        {guides.length > 0 ? (
          <article className="max-w-2xl rounded-xl border border-border-strong bg-surface p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-semibold tracking-tight">Blitzy</h3>
              <span className="text-sm font-medium text-accent">{guides.length} guides available</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">Prepare for enterprise AI code generation: code review, brownfield integration, incidents, customer communication, and the final round.</p>
            <LinkButton href={`/modules/${LIVE.companyPrep}`} className="mt-5 min-h-11">Open Blitzy prep</LinkButton>
          </article>
        ) : (
          <div>
            <EmptyState title="Company packs are being prepared" body="Use the general interview preparation while the company packs are being reworked." />
            <LinkButton href="/interview" className="mt-5 min-h-11">Explore interview preparation</LinkButton>
          </div>
        )}
      </AreaSection>
    </div>
  )
}
