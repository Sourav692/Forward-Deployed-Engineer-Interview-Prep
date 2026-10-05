/**
 * Structured data for search engines. `type="application/ld+json"` is a data block, not
 * script, so the browser never runs it and the CSP does not apply to it. `<` is escaped
 * so no string in the data can close the tag early (Next.js JSON-LD guide).
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
