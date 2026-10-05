import { Toaster } from '@/components/ui'

/**
 * Wraps /start and the path pages. Mounts the toast region used by "Choose this path".
 * If the site header later mounts a global Toaster, remove this one so toasts are not
 * announced twice.
 */
export default function StartLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-8 sm:py-10">
      {children}
      <Toaster />
    </div>
  )
}
