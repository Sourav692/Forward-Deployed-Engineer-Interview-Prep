/**
 * Asserts for the RAG theory import's transforms (FE-01): British spelling, link and
 * module-code rewriting, and the module page split. Run: `npm run check:rag-import`.
 */
import assert from 'node:assert/strict'
import { britishSpelling } from '../src/lib/spelling.ts'
import { britishText, fileTitle, makeRenumber, siteAnimation, siteLab, splitModulePage, transformLine, trimLessonPage } from './rag-theory-import.mjs'
import { parseAnimatedFence, parseLabFence, parseReading } from '../src/lib/reading.ts'
import { siteText } from './site-text-edits.mjs'

assert.equal(britishSpelling('Summarization'), 'Summarisation')
assert.equal(britishSpelling('analyzing'), 'analysing')
assert.equal(britishSpelling('labeled'), 'labelled')
assert.equal(britishSpelling('behavioral'), 'behavioural')
assert.equal(britishSpelling('centered'), 'centred')
assert.equal(britishSpelling('size'), 'size')
assert.equal(britishText('The optimizer and Parallelization; see a/optimize_x and evaluator–optimizer.'),
  'The optimiser and Parallelization; see a/optimize_x and evaluator–optimizer.')

const ctx = {
  link: (t: string) => (t.startsWith('http') ? t : `<${t}>`),
  moduleLink: (code: string) => (code === 'M13' ? `[M13](m13.md)` : null),
}
assert.equal(transformLine('See M13, M13.2 and [M13 chunking](x.md).', ctx), 'See [M13](m13.md), M13.2 and [M13 chunking](<x.md>).')
assert.equal(transformLine('## TL;DR', ctx), '## In short')
assert.equal(transformLine('## Normalize M13', ctx), '## Normalise M13')
assert.equal(transformLine('[Summarization survey](https://x.org/a)', ctx), '[Summarization survey](https://x.org/a)')

const page = '# M11 Theory: X\n\n*Part IV · RAG · [Module README](a)*\n\nLead.\n\n## TL;DR\n\nA.\n\n## Lessons\n\n| 1 |\n\n' +
  '## Interview Spotlight: 5 Questions\n\n### 1. Q?\n\n## Key Takeaways\n\nB.\n\n---\n*Previous: [M10](p). Next: [M12](n).*\n'
const { overview, interview, spotlight } = splitModulePage(page)
assert.ok(!overview.includes('Lessons') && !overview.includes('Part IV') && !overview.includes('Previous') && overview.includes('## Key Takeaways'))
assert.equal(interview, '# Interview questions\n\n### 1. Q?\n')
assert.equal(spotlight, 'Interview Spotlight: 5 Questions')
assert.equal(trimLessonPage('# T\n\n*[M11 theory](../README.md) · Lesson 11.2 · Notebooks: [`02a_creating_an_mcp_server.ipynb`](b) · [All theory pages](c)*\n\n## A\n'),
  '# T\n\n*Notebooks on GitHub: [Creating an MCP server](b)*\n\n## A\n')
assert.equal(fileTitle('01_open_source_llms_with_langchain.ipynb'), 'Open source LLMs with LangChain')

// The course's numbering becomes the site's (IA-08).
const renumber = makeRenumber((n: string) => ({ '13': 'T6.2', '11': 'T5.1' })[n] ?? null, (k: number) => (k === 6 ? 'T7' : null))
assert.equal(renumber('M13 and M99, Lesson 13.2, notebook 11.3, M13.4 and the Part VI pipeline'),
  'T6.2 and M99, Lesson 2 of T6.2, notebook 3 of T5.1, lesson 4 of T6.2 and the T7 pipeline')
assert.equal(renumber('13.2', true), 'lesson 2 of T6.2')
assert.equal(renumber('Part IX', false), 'Part IX')
const coded = { ...ctx, renumber, moduleLink: (code: string) => (code === 'M11' ? `[${renumber(code)}](m11.md)` : null) }
assert.equal(transformLine('See M11, M13 and [13.2](x.md).', coded), 'See [T5.1](m11.md), T6.2 and [lesson 2 of T6.2](<x.md>).')
assert.equal(transformLine('## How M13 connects', coded), '## How T6.2 connects')

// The ```lab fence the import writes becomes a lab chunk in the lesson (FE-05).
const fence = '```lab\nsrc: /labs/rag/m11_rag_lifecycle/top-k-retrieval-lab.html\ntitle: Top-k and the baseline\n```'
assert.deepEqual(parseReading(`# T\n\n## A\n\n${fence}\n`, 'lesson').sections[0].chunks, [
  { kind: 'lab', src: '/labs/rag/m11_rag_lifecycle/top-k-retrieval-lab.html', title: 'Top-k and the baseline' },
])
assert.equal(parseLabFence('src: https://evil.example/x.html\ntitle: X'), null)
assert.equal(parseLabFence('src: /labs/../secret.html\ntitle: X'), null)

// Labs lose Google Fonts, gain the site's tokens and glue, and may not make requests (FE-08, SEC-02).
const lab = siteLab('<head><link rel="preconnect" href="https://fonts.googleapis.com">\n<link href="https://fonts.googleapis.com/css2?family=X" rel="stylesheet">\n<style>a{}</style></head><body></body>', 'x.html')
assert.ok(!lab.includes('fonts.g') && lab.includes('/labs/_site-tokens.css') && lab.includes('/labs/_site-lab.js'))
assert.ok(lab.indexOf('<style>') < lab.indexOf('_site-tokens.css'), 'site tokens load after the lab styles')
for (const bad of ['fetch(u)', 'new WebSocket(u)', 'import("x")', '<img src="https://x.org/a.png">', 'url(https://x.org/a.png)']) {
  assert.throws(() => siteLab(`<head></head><script>${bad}</script>`, 'x.html'), /makes a request/)
}

// Animated diagrams lose their comments, take British spelling and may not run script or make requests (FE-12).
const figure = '<!-- Animated version of x. -->\n<figure class="anim sheet"><svg><path marker-end="url(#ah)"/><title>Summarize</title></svg></figure>'
const anim = siteAnimation(figure, 'x.anim.html')
assert.equal(anim, '<figure class="anim sheet"><svg><path marker-end="url(#ah)"/><title>Summarise</title></svg></figure>')
assert.deepEqual(parseReading(`# T\n\n## A\n\n\`\`\`animated\n${anim}\n\`\`\`\n`, 'lesson').sections[0].chunks, [{ kind: 'animated', html: anim }])
for (const bad of ['<script>x()</script>', '<g onclick="x()">', '<image href="https://x.org/a.png"/>', '<rect style="fill: url(https://x.org/a)"/>']) {
  const html = `<figure class="anim">${bad}</figure>`
  assert.throws(() => siteAnimation(html, 'x.anim.html'), /not allowed/)
  assert.equal(parseAnimatedFence(html), null)
}
assert.equal(parseAnimatedFence('<div class="anim"></div>'), null)

// The site names no vendor platform: such a notebook leaves the header, and a page still
// naming one fails unless the mention is only a link target to another lesson file.
assert.equal(trimLessonPage('*[M17 theory](../README.md) · Lesson 17.6 · Notebooks: [`06a_patterns.ipynb`](a), [`06b_hybrid_databricks.ipynb`](b) (optional) · [All theory pages](c)*\n'),
  '*Notebooks on GitHub: [Patterns](a)*\n')
assert.equal(trimLessonPage('*[M14 theory](../README.md) · Lesson 14.5 · Notebooks: [`05a_compare_databricks.ipynb`](a) · [All theory pages](c)*\n'), '\n')
assert.equal(siteText('x.md', 'See [lesson 6](06_on_databricks_vector_search.md#a).'), 'See [lesson 6](06_on_databricks_vector_search.md#a).')
assert.throws(() => siteText('x.md', 'Runs on a Unity Catalog volume.'), /vendor platform/)

// Behavioural pages word the author's story tags for readers.
assert.equal(siteText('04_Behavioral_and_Leadership/x.md', '**GROUNDED: the insurer**\n**PARTLY GROUNDED.** Fill it.\n**Grounding:** GROUNDED.'),
  '**Example story: the insurer**\n**Add your own detail.** Fill it.\n**Grounding:** nothing beyond your own facts; the story is complete.')

console.log('rag import transforms: all checks pass')
