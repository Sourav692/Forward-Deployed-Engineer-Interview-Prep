/** Joins class names, dropping falsy entries. */
export const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ')

/**
 * Visible keyboard focus for interactive primitives: the global `:focus-visible`
 * outline in `globals.css` plus a soft `--accent-ring` halo.
 */
export const focusRing = 'focus-visible:ring-4 focus-visible:ring-accent-ring'
