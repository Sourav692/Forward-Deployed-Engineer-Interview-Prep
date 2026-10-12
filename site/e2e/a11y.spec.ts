import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { CASE_STUDY, CHECKPOINT_MODULE, COMING_SOON_MODULE, LESSON, MOCK_LESSON, READY_MODULE, WORKSHEET, hydrated } from './helpers'

// A11Y-01 (plan §11): zero serious or critical axe violations on every Phase 1
// template, in both themes. Minor and moderate findings are reported, not failed.

const PAGES: [string, string][] = [
  ['landing', '/'],
  ['company prep', '/company-prep'],
  ['start', '/start'],
  ['path', '/start/paths/fde'],
  ['learn', '/learn'],
  ['track', '/learn/orientation'],
  ['ready module', READY_MODULE],
  ['coming-soon module', COMING_SOON_MODULE],
  ['lesson', LESSON],
  ['design', '/design'],
  ['practice', '/practice'],
  ['interview', '/interview'],
  ['mock lesson', MOCK_LESSON],
  ['client simulation', '/interview/mock-interviews/bank-policy-assistant-client-simulation'],
  ['module with checkpoint', CHECKPOINT_MODULE],
  ['settings', '/settings'],
  ['interview hub', '/interview/hubs/ai-systems-design'],
  ['progress (new learner)', '/progress'],
  ['progress history', '/progress/history'],
  ['library', '/library'],
  ['credits', '/library/credits'],
  ['worksheet', WORKSHEET],
  ['story bank', '/practice/story-bank'],
  ['case study', CASE_STUDY],
  ['final-week review', '/interview/final-week/module-05-rag-and-enterprise-data'],
  ['about', '/about'],
  ['changelog', '/changelog'],
  ['404', '/this-page-does-not-exist'],
]

for (const theme of ['light', 'dark'] as const) {
  test.describe(`axe (${theme})`, () => {
    test.beforeEach(async ({ page }) => {
      // The pre-paint script in the (site) layout reads this key before first paint.
      await page.addInitScript((t) => localStorage.setItem('fd:v1:theme', t), theme)
    })

    for (const [name, path, seed] of [...PAGES, ['progress (with data)', '/progress', true] as const]) {
      test(`${name} ${path}`, async ({ page }) => {
        if (seed) await page.addInitScript(seedProgress)
        await page.goto(path)
        await hydrated(page)
        await expect(page.locator('html')).toHaveClass(theme === 'dark' ? /\bdark\b/ : /^(?!.*\bdark\b)/)

        const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
        const blocking = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
        // One line per failing node, with the contrast data when there is any, so a
        // CI failure says what to fix without opening the trace.
        const report = blocking.flatMap((v) =>
          v.nodes.map((n) => {
            const d = n.any[0]?.data as { fgColor?: string; bgColor?: string; contrastRatio?: number } | undefined
            const colours = d?.fgColor ? ` (${d.fgColor} on ${d.bgColor}, ${d.contrastRatio}:1)` : ''
            return `${v.impact} ${v.id}: ${n.target.join(' ')}${colours} ${n.html.slice(0, 120)}`
          }),
        )
        expect(report).toEqual([])
      })
    }
  })
}

/** A learner with a path, a low and a faded confidence rating, a mock round, scores and a bookmark. */
function seedProgress() {
  const now = new Date().toISOString()
  const old = new Date(Date.now() - 50 * 86_400_000).toISOString()
  const set = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value))
  set('fd:v1:path', { pathId: 'fde', weeklyHours: 6, chosenAt: now })
  set('fd:v1:learn:lesson:the-fde-role/three-roles-three-questions', { readAt: now })
  set('fd:v1:learn:module:memory-and-state', { confidence: [{ value: 2, at: now }], notes: '', updatedAt: now })
  set('fd:v1:learn:module:the-fde-role', { confidence: [{ value: 4, at: old }], notes: '', updatedAt: old })
  const rubric = { discovery: 4, architecture: 3, security: 3, evaluation: 4, production: 3, communication: 4 }
  set('fd:v1:learn:attempts:mock:sre-triage-agent-mock-interview:full', [
    { assessmentId: 'mock:sre-triage-agent-mock-interview:full', kind: 'mock', at: now, score: 63, passed: true, rubric, answers: {}, id: 'a:1', updatedAt: now },
  ])
  set('fd:v1:scores:core/internal-knowledge-assistant', { a: 3, b: 5 })
  set('fd:v1:answer-statuses:fde-competencies/customer-focus-and-discovery', { s1: 'practiced' })
  set('fd:v1:activity', [{ kind: 'lesson-read', itemId: 'the-fde-role/three-roles-three-questions', label: 'Three Roles, Three Questions', id: 'e1', at: now, updatedAt: now }])
  set('fd:v1:bookmarks', [{ kind: 'lesson', itemId: 'the-fde-role/three-roles-three-questions', label: 'Three Roles, Three Questions', href: '/learn/orientation/the-fde-role/three-roles-three-questions', id: 'b1', at: now, updatedAt: now }])
}
