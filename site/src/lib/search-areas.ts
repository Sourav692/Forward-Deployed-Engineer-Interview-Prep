/**
 * The search index is split into one static JSON file per area (plan §8, FE-12 and
 * PERF-02), served at `/search/{area}.json`. Kept free of server imports so the search
 * dialog, the route handler and `check-parse.ts` share one list.
 *
 * - learn: tracks, modules and synced lessons
 * - practice: technical worksheets and their model answers
 * - interview: behavioural worksheets, their model answers and the story bank
 * - design-1, design-2: the system design case studies, alternating case by case so the
 *   two files stay about the same size
 * - company: company-specific prep guides
 * - reference: Last-Day Review guides, reviews and the glossary
 */
export const SEARCH_AREAS = ['learn', 'practice', 'interview', 'design-1', 'design-2', 'company', 'reference'] as const

export type SearchArea = (typeof SEARCH_AREAS)[number]

export const searchAreaHref = (area: SearchArea) => `/search/${area}.json`

/** Each area file must stay under this many bytes; the build and `check:content` fail above it. */
export const SEARCH_AREA_BUDGET_BYTES = 500 * 1024
