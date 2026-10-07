import { Toaster } from '@/components/ui'

/**
 * Wraps the interview practice module and lesson pages, as the Learn layout wraps
 * /learn: the toast region (Mark read, confidence, notes) mounts once and persists
 * across lessons.
 */
export default function InterviewModuleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-8 sm:py-10">
      {children}
      <Toaster />
    </div>
  )
}
