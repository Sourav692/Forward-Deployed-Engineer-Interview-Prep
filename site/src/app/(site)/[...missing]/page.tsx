import { notFound } from 'next/navigation'

/**
 * Catch-all for URLs that match no route (FE-14).
 *
 * The app has two root layouts, `(site)/layout.tsx` and `demo/layout.tsx`, so there is
 * no top-level layout for a root `app/not-found.tsx` to render inside, and Next falls
 * back to its unstyled default 404 for unmatched URLs. Matching every leftover path
 * here and calling `notFound()` renders `(site)/not-found.tsx` inside the site shell
 * instead, still with a 404 status. Every real route, static file and `/demo` page is
 * more specific than this segment, so it only ever catches misses.
 *
 * The alternative, `global-not-found.tsx`, needs an experimental flag in next.config.
 */
export default function Missing(): never {
  notFound()
}
