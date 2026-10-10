import { StorageNotice } from '@/components/learn/ProgressIslands'
import { Toaster } from '@/components/ui'

/**
 * Wraps /progress and its list pages (FE-16). Learner-only pages: `robots.ts`
 * disallows them and the sitemap leaves them out. The toast region (bookmark removal)
 * mounts once for the group.
 */
export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-8 sm:py-10">
      <StorageNotice />
      {children}
      <Toaster />
    </div>
  )
}
