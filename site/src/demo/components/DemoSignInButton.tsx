'use client'

import { useRouter } from 'next/navigation'
import { signInAsDemo } from '../store/useDemo'
import { toast } from './feedback'
import { btn } from './ui'

/** "View demo dashboard": signs in as the seeded demo learner and opens a page. */
export function DemoSignInButton({ next = '/demo/progress', label = 'View demo dashboard', variant = 'secondary' }: { next?: string; label?: string; variant?: 'primary' | 'secondary' }) {
  const router = useRouter()
  return (
    <button
      type="button"
      className={btn[variant]}
      onClick={() => {
        signInAsDemo()
        toast('Signed in as Alex Morgan (demo account).')
        router.push(next)
      }}
    >
      {label}
    </button>
  )
}
