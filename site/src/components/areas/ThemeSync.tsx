'use client'

import { useEffect } from 'react'

/**
 * Re-applies the stored theme after mount. Needed on error documents only: Next
 * renders a 404 or error response from scratch on the client (`<html id="__next_error__">`),
 * which replaces the `dark` class the layout's inline theme script set before first
 * paint. Mirrors that script: the stored choice wins, otherwise the OS preference.
 */
export function ThemeSync() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('fd:v1:theme')
      const dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', dark)
    } catch {
      // Storage blocked: keep whatever the document has.
    }
  }, [])
  return null
}
