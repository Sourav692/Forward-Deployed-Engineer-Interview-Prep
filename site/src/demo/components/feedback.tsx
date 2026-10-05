/**
 * Toasts and the confirmation dialog moved to `@/components/ui` (FE-05). This shim
 * keeps the demo's existing imports working; new code imports from `@/components/ui`.
 */
export { ConfirmDialog, Toaster, toast } from '@/components/ui'
