import { Toaster } from '@/components/ui'

/**
 * Wraps every /learn page. A layout persists across navigations inside /learn, so
 * the toast region (used by Mark read, confidence and notes) mounts once and is not
 * torn down between lessons. If the site header later mounts a global Toaster, remove
 * this one so toasts are not announced twice.
 */
export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-8 sm:py-10">
      {children}
      <Toaster />
    </div>
  )
}
