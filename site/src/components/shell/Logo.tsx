import Link from 'next/link'
import { SITE } from '@/lib/registry'

/** Site mark and name, linking home. Server Component. */
export function Logo() {
  return (
    <Link
      href="/"
      aria-label={`${SITE.name} home`}
      className="flex min-h-11 shrink-0 items-center gap-2.5 rounded-md font-semibold tracking-[-0.011em]"
    >
      <svg viewBox="0 0 24 24" aria-hidden className="h-[1.375rem] w-[1.375rem] text-accent">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor" opacity="0.12" />
        <path
          d="M7 15.5L11 8l4 7.5M8.6 13h4.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="17" cy="8" r="1.6" fill="currentColor" />
      </svg>
      <span>{SITE.name}</span>
    </Link>
  )
}
