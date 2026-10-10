/**
 * Shared helpers for the site shell. Plain module (no 'use client'), so Server and
 * Client Components can both import it.
 */

/** True when `pathname` is one of `prefixes` or sits below one of them. */
export function isActive(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/**
 * Window event that opens the ⌘K search dialog. The bottom bar fires it; the
 * `SearchDialog` in the header listens. An event keeps the two islands independent,
 * so neither needs a shared React context or provider.
 */
export const OPEN_SEARCH_EVENT = 'fd:open-search'

/** 20 px line-icon paths, drawn in `currentColor`. */
export const ICONS = {
  start: 'M4 12l8-8 8 8M6 10v9h12v-9',
  learn: 'M4 5h7a3 3 0 013 3v11a2 2 0 00-2-2H4zM20 5h-7a3 3 0 00-3 3v11a2 2 0 012-2h8z',
  design: 'M4 4h7v7H4zM13 13h7v7h-7zM13 4h7v7h-7zM4 13h7v7H4z',
  practice: 'M5 19l4-1 10-10-3-3L6 15zM14 6l3 3',
  interview: 'M4 5h16v10H9l-5 4z',
  'company-prep': 'M4 8h16v11H4zM9 8V5h6v3M4 13h16',
  glossary: 'M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3zM5 17a3 3 0 013-3h11',
  library: 'M4 4v16M9 4v16M14 5l5 15',
  settings: 'M4 7h9M17 7h3M15 5v4M4 17h3M11 17h9M9 15v4',
  progress: 'M5 19v-7M12 19V5M19 19v-4M3 21h18',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
} as const

export type IconName = keyof typeof ICONS
