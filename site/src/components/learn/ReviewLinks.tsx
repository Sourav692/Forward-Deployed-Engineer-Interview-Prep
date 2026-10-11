import Link from 'next/link'
import { pageRef } from '@/lib/content'
import { REVIEWS } from '@/lib/editorial'
import { qualifiedTitle, scenarioHref } from '@/lib/scenario'

/**
 * A final-week review's way in and way on (ENH-18): the worksheets to do first and the
 * designs that show the topic in a whole system, from `REVIEWS` in src/lib/editorial.ts.
 * The retired static review pages carried these in their top bar. Renders nothing on a
 * lesson that is not a review.
 */
export async function ReviewLinks({ lessonSlug }: { lessonSlug: string }) {
  const review = REVIEWS.find((r) => r.dir === lessonSlug)
  if (!review) return null
  const load = async (keys: string[]) => (await Promise.all(keys.map(pageRef))).filter((r) => r !== null)
  const [first, deeper] = await Promise.all([load(review.learnFirst), load(review.goDeeper)])

  const row = (label: string, refs: typeof first) =>
    refs.length > 0 && (
      <p>
        <span className="font-semibold text-text">{label}</span>{' '}
        {refs.map((r, i) => (
          <span key={scenarioHref(r)}>
            {i > 0 && <span aria-hidden> · </span>}
            <Link href={scenarioHref(r)} className="text-accent underline underline-offset-2 hover:text-accent-hover">
              {qualifiedTitle(r)}
            </Link>
          </span>
        ))}
      </p>
    )

  return (
    <aside aria-label="Practice for this review" className="mb-6 space-y-1.5 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
      {row('New to this? Learn first:', first)}
      {row('Go deeper:', deeper)}
    </aside>
  )
}
