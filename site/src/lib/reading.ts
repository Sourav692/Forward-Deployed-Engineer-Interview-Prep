import { marked, type Links, type Token, type Tokens, type TokensList } from 'marked'

/**
 * Parses a reading document (the FDE Case Studies guides) for display.
 *
 * Worksheets go through `parse.ts`, which turns every empty table cell into an input.
 * That is exactly wrong here: these guides are finished prose, and their tables have
 * deliberately blank cells. So this path renders markdown as markdown, and only
 * splits it where the page needs structure:
 *
 *  - at each `## ` heading, so a tab gets a table of contents and search can land on
 *    a section;
 *  - at each ```mermaid fence, which the page draws as a diagram instead of printing
 *    its source;
 *  - at each ```lab fence (`src: /labs/…` and `title: …` lines, written by the RAG theory
 *    import), which a lesson shows as a card that opens the lab. A fence whose src is not
 *    under /labs/ stays a code block;
 *  - at each ```animated fence (an SVG figure the RAG theory import wrote), which a lesson
 *    draws and steps through. A fence that is not such a figure stays a code block.
 *
 * Section ids are prefixed with the tab id, because all four tabs are in the DOM at
 * once and two of them can share a heading such as "Key Takeaways".
 */

export type ReadingChunk =
  | { kind: 'html'; html: string }
  | { kind: 'diagram'; code: string }
  | { kind: 'lab'; src: string; title: string }
  | { kind: 'animated'; html: string }

/** A ```lab fence's lab, or null when it is not a well-formed link to a file under /labs/. */
export function parseLabFence(code: string): { src: string; title: string } | null {
  const src = code.match(/^src: (\/labs\/[\w./-]+\.html)$/m)?.[1]
  const title = code.match(/^title: (.+)$/m)?.[1].trim()
  return src && title && !src.includes('..') ? { src, title } : null
}

/**
 * An ```animated fence's figure, or null when it is not one. The import already refuses a figure
 * with script, handlers or requests; this repeats the check, because the page inserts it as HTML.
 */
export function parseAnimatedFence(code: string): string | null {
  const html = code.trim()
  const unsafe = /<(?:script|iframe|object|embed|foreignObject)\b|\son[a-z]+\s*=|\s(?:src|href|xlink:href)\s*=|url\(\s*["']?(?!#)/i
  return html.startsWith('<figure class="anim') && html.endsWith('</figure>') && !unsafe.test(html) ? html : null
}

export type ReadingSection = {
  /** Anchor id, unique across the whole page. */
  id: string
  /** Null for the lead-in above the first `## ` heading. */
  title: string | null
  chunks: ReadingChunk[]
}

export type ReadingDocument = {
  title: string
  sections: ReadingSection[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/**
 * Wide tables scroll inside their own box rather than stretching the page, and
 * outbound links open in a new tab so the reader keeps their place in the guide.
 */
function finish(html: string): string {
  // tabindex="0" lets keyboard users scroll a wide table or code block (WCAG 2.1.1).
  return html
    .replace(/<table>/g, '<div class="table-wrap" tabindex="0" role="region" aria-label="Table"><table>')
    .replace(/<pre>/g, '<pre tabindex="0">')
    .replace(/<\/table>/g, '</table></div>')
    .replace(/<a href="(https?:[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"')
}

function render(tokens: Token[], links: Links): string {
  const list: TokensList = Object.assign([...tokens], { links })
  return finish(marked.parser(list, { gfm: true, async: false }) as string)
}

export function parseReading(markdown: string, idPrefix: string): ReadingDocument {
  const tokens = marked.lexer(markdown, { gfm: true })
  const links = tokens.links ?? {}

  let title = ''
  const sections: ReadingSection[] = []
  const used = new Set<string>()
  let current: ReadingSection = { id: `${idPrefix}-intro`, title: null, chunks: [] }
  let pending: Token[] = []

  const flush = () => {
    if (pending.length === 0) return
    const html = render(pending, links).trim()
    if (html) current.chunks.push({ kind: 'html', html })
    pending = []
  }

  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 1 && !title) {
      title = (token as Tokens.Heading).text
      continue
    }
    // A later `#` heading is a section like `##`, so a page never has two H1s (PR-10).
    if (token.type === 'heading' && token.depth <= 2) {
      flush()
      if (current.chunks.length) sections.push(current)
      const text = (token as Tokens.Heading).text
      let id = `${idPrefix}-${slugify(text) || 'section'}`
      for (let n = 2; used.has(id); n++) id = `${idPrefix}-${slugify(text)}-${n}`
      used.add(id)
      current = {
        id,
        title: marked.parseInline(text, { async: false }) as string,
        chunks: [],
      }
      continue
    }
    if (token.type === 'code' && (token as Tokens.Code).lang?.trim() === 'mermaid') {
      flush()
      current.chunks.push({ kind: 'diagram', code: (token as Tokens.Code).text })
      continue
    }
    const lab = token.type === 'code' && (token as Tokens.Code).lang?.trim() === 'lab' && parseLabFence((token as Tokens.Code).text)
    if (lab) {
      flush()
      current.chunks.push({ kind: 'lab', ...lab })
      continue
    }
    const animated = token.type === 'code' && (token as Tokens.Code).lang?.trim() === 'animated' && parseAnimatedFence((token as Tokens.Code).text)
    if (animated) {
      flush()
      current.chunks.push({ kind: 'animated', html: animated })
      continue
    }
    pending.push(token)
  }
  flush()
  if (current.chunks.length || current.title) sections.push(current)

  return { title, sections }
}

/** HTML to plain text: tags dropped, the entities marked emits decoded. */
export function toPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/** Plain text of a section, for the search index. */
export function readingText(section: ReadingSection): string {
  return toPlainText(section.chunks.map((c) => (c.kind === 'html' ? c.html : '')).join(' '))
}
