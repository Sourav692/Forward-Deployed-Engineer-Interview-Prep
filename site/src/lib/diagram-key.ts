/**
 * Keys for ```mermaid fences (ENH-24b). The sync renders each fence to
 * `public/diagrams/<key>-light.svg` and `-dark.svg`; the page finds them by the same key.
 * No imports: the sync script, the content check and the browser all use it.
 */

/**
 * A fence's source with indentation and trailing spaces removed. The Learn reader and
 * the worksheet parser keep different whitespace around the same fence; this makes
 * both give one key.
 */
export function diagramSource(code: string): string {
  const lines = code.replace(/\r\n?/g, '\n').split('\n').map((l) => l.replace(/\s+$/, ''))
  while (lines.length && !lines[0]) lines.shift()
  while (lines.length && !lines[lines.length - 1]) lines.pop()
  const indents = lines.filter(Boolean).map((l) => l.length - l.trimStart().length)
  const indent = indents.length ? Math.min(...indents) : 0
  return lines.map((l) => l.slice(indent)).join('\n')
}

/** cyrb53: a small, fast 53-bit string hash, as hex. Not cryptographic; it only names files. */
export function diagramKey(code: string): string {
  const source = diagramSource(code)
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < source.length; i++) {
    const ch = source.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0')
}

/**
 * The text alternative for a drawn diagram: the labels its source names, in order, so a
 * screen reader or a reader without images gets what the boxes say.
 */
export function diagramAlt(code: string): string {
  const labels: string[] = []
  for (const m of diagramSource(code).matchAll(/\[\/?"?([^\]"]+?)"?\/?\]|\(\("?([^)"]+?)"?\)\)|\("([^"]+)"\)|\{"?([^}"]+?)"?\}/g)) {
    const label = (m[1] ?? m[2] ?? m[3] ?? m[4] ?? '').replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim()
    if (label && !labels.includes(label)) labels.push(label)
    if (labels.length === 15) break
  }
  return labels.length ? `Diagram: ${labels.join('; ')}` : 'Diagram'
}
