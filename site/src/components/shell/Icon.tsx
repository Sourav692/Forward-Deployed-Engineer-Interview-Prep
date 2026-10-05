import { cx } from '@/components/ui/cx'
import { ICONS, type IconName } from './nav'

/** Inline line icon. Decorative: the visible text or `aria-label` names the control. */
export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cx('h-5 w-5 shrink-0', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICONS[name]} />
    </svg>
  )
}
