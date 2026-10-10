import Link from 'next/link'
import { cx, focusRing } from '@/components/ui'

/**
 * Curriculum text that mentions the path diagnostic ("Complete the path diagnostic",
 * "Diagnostic submitted") becomes a link to it on /start (audit check ON-03), so a
 * learner told to take it can reach it in one click. Other text passes through.
 */
export function DiagnosticText({ text }: { text: string }) {
  if (!/diagnostic/i.test(text)) return <>{text}</>
  return (
    <Link href="/start#diagnostic" className={cx('rounded-sm text-accent underline underline-offset-2 hover:text-accent-hover', focusRing)}>
      {text}
    </Link>
  )
}
