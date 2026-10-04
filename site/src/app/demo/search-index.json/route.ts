import { buildSearchIndex } from '@/demo/search-index'

/** The prototype's search index, rendered once at build time like the live site's. */
export const dynamic = 'force-static'

export function GET() {
  return Response.json(buildSearchIndex())
}
