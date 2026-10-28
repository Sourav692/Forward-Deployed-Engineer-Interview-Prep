import { Toaster } from '@/components/ui'
import { EditorialScope } from '@/components/editorial/EditorialScope'

/**
 * Wraps /start and the path pages. Mounts the toast region used by "Choose this path".
 * If the site header later mounts a global Toaster, remove this one so toasts are not
 * announced twice.
 * The area renders in the Editorial theme, like the casebook, practice and interview.
 */
export default function StartLayout({ children }: { children: React.ReactNode }) {
  return (
    <EditorialScope>
      <div className="py-8 sm:py-10">
        {children}
        <Toaster />
      </div>
    </EditorialScope>
  )
}
