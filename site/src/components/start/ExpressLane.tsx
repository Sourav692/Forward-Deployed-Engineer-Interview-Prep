import Link from 'next/link'
import { LAST_DAY } from '@/lib/editorial'
import { cx, focusRing } from '@/components/ui'

/** "Interview this week?" (audit check ON-07): the short way to the final-week review, on the home page and /start. */
export function ExpressLane({ className }: { className?: string }) {
  return (
    <p className={cx('text-sm text-muted', className)}>
      Interview this week?{' '}
      <Link href={LAST_DAY.href} className={cx('rounded-sm font-semibold text-accent underline underline-offset-2 hover:text-accent-hover', focusRing)}>
        Go straight to the final-week review
      </Link>
      .
    </p>
  )
}
