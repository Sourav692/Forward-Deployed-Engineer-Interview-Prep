/**
 * Asserts for the RAG theory import's transforms (FE-01): British spelling, link and
 * module-code rewriting, and the module page split. Run: `npm run check:rag-import`.
 */
import assert from 'node:assert/strict'
import { britishSpelling } from '../src/lib/spelling.ts'
import { britishText, splitModulePage, transformLine, trimLessonPage } from './rag-theory-import.mjs'

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
assert.equal(trimLessonPage('# T\n\n*[M11 theory](../README.md) · Lesson 11.2 · Notebooks: [`a.ipynb`](b) · [All theory pages](c)*\n\n## A\n'),
  '# T\n\n*Notebooks: [`a.ipynb`](b)*\n\n## A\n')

console.log('rag import transforms: all checks pass')
