/**
 * Form controls. Their boundary uses `--input-border`, which meets WCAG 1.4.11
 * (3:1 against `--surface`) in both themes; `--border-strong` is too faint for a
 * control's only edge. See .website_spec/reference/2026-10-05-design-tokens.md.
 */
import type { ComponentProps } from 'react'
import { cx, focusRing } from './cx'

export const inputClass = cx(
  'rounded-sm border border-input-border bg-surface text-text placeholder:text-subtle',
  'transition-colors duration-150 ease-out focus:border-accent',
  'disabled:cursor-not-allowed disabled:opacity-50',
  focusRing,
)

export function Input({ className, ...rest }: ComponentProps<'input'>) {
  return <input className={cx(inputClass, 'w-full px-3 py-2 text-sm', className)} {...rest} />
}

export function Textarea({ className, ...rest }: ComponentProps<'textarea'>) {
  return <textarea className={cx(inputClass, 'w-full px-3 py-2 text-sm leading-relaxed', className)} {...rest} />
}

export function Select({ className, ...rest }: ComponentProps<'select'>) {
  return <select className={cx(inputClass, 'px-2.5 py-1.5 text-sm', className)} {...rest} />
}
