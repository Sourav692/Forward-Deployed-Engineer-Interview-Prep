import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { CASE_STUDY, COMING_SOON_MODULE, LESSON, MOCK_LESSON, READY_MODULE, WORKSHEET, hydrated } from './helpers'

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
  ['settings', '/settings'],
  ['interview hub', '/interview/hubs/ai-systems-design'],
  ['library', '/library'],
  ['credits', '/library/credits'],
  ['worksheet', WORKSHEET],
  ['case study', CASE_STUDY],
  ['last-day prep', '/fde-last-day-prep'],
  ['404', '/this-page-does-not-exist'],
]

for (const theme of ['light', 'dark'] as const) {
  test.describe(`axe (${theme})`, () => {
    test.beforeEach(async ({ page }) => {
      // The pre-paint script in the (site) layout reads this key before first paint.
      await page.addInitScript((t) => localStorage.setItem('fd:v1:theme', t), theme)
    })

    for (const [name, path] of PAGES) {
      test(`${name} ${path}`, async ({ page }) => {
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
