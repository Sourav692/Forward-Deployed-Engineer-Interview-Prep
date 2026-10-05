import { getSearchArea } from '@/lib/search-index'
import { SEARCH_AREA_BUDGET_BYTES, SEARCH_AREAS, type SearchArea } from '@/lib/search-areas'

/**
 * The search index, one static JSON file per area (`/search/learn.json`,
 * `/search/practice.json`, …), rendered at build time.
 *
 * A single file grew past a megabyte once the case studies and lessons were indexed, so
 * it is split (plan §8, FE-12 and PERF-02). The search dialog fetches the files the first
 * time a reader opens search, and the browser and CDN cache them like any static asset.
 * The build fails if any file goes over its budget, so the split cannot silently regress.
 */
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return SEARCH_AREAS.map((area) => ({ file: `${area}.json` }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const area = (await params).file.replace(/\.json$/, '') as SearchArea
  const body = JSON.stringify(await getSearchArea(area))
  const bytes = Buffer.byteLength(body)
  if (bytes > SEARCH_AREA_BUDGET_BYTES) {
    throw new Error(`/search/${area}.json is ${bytes} bytes, over the ${SEARCH_AREA_BUDGET_BYTES}-byte budget.`)
  }
  return new Response(body, { headers: { 'Content-Type': 'application/json' } })
}
