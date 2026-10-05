/**
 * Button and LinkButton. No hooks and no `'use client'`, so both render in Server
 * Components; a Button only needs a client boundary when you pass it an `onClick`.
 */
import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { cx, focusRing } from './cx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const base = cx(
  'inline-flex items-center justify-center gap-1.5 rounded-md text-sm transition-colors duration-150 ease-out',
  'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
  focusRing,
)

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent px-3.5 py-2 font-semibold text-white hover:bg-accent-hover dark:text-bg',
  secondary: 'border border-border-strong bg-surface px-3.5 py-2 font-semibold hover:bg-surface-2',
  ghost: 'px-2.5 py-1.5 text-muted hover:bg-surface-2 hover:text-text',
  danger: 'bg-danger px-3.5 py-2 font-semibold text-white hover:opacity-90 dark:text-bg',
}

/** Class string for a button-styled element. Use when a primitive does not fit (e.g. a `<label>` for a file input). */
export const buttonClass = (variant: ButtonVariant = 'primary', className?: string) => cx(base, variants[variant], className)

/** Variant class map, kept for call sites that compose their own element. */
export const btn: Record<ButtonVariant, string> = {
  primary: buttonClass('primary'),
  secondary: buttonClass('secondary'),
  ghost: buttonClass('ghost'),
  danger: buttonClass('danger'),
}

function Spinner() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-4 animate-spin motion-reduce:animate-none">
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M14 8a6 6 0 00-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  /** Shows a spinner, sets `aria-busy` and blocks clicks. The label stays visible. */
  loading?: boolean
}

export function Button({ variant = 'primary', loading = false, disabled, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, className)}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}

export interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant
  children: ReactNode
}

/** A navigation link that looks like a button. Use it whenever the action changes the URL. */
export function LinkButton({ variant = 'primary', className, ...rest }: LinkButtonProps) {
  return <Link className={buttonClass(variant, className)} {...rest} />
}
