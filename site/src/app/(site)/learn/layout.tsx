import { Toaster } from '@/components/ui'
import { EditorialScope } from '@/components/editorial/EditorialScope'

/**
 * Wraps every /learn page. A layout persists across navigations inside /learn, so
 * the toast region (used by Mark read, confidence and notes) mounts once and is not
 * torn down between lessons. If the site header later mounts a global Toaster, remove
 * this one so toasts are not announced twice.
 * The area renders in the Editorial theme, like the casebook, practice and interview.
 */
export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <EditorialScope>
      <div className="py-8 sm:py-10">
        {children}
        <Toaster />
      </div>
    </EditorialScope>
  )
}
