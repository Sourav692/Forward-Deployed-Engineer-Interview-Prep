import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { EXPLORERS } from '../src/lib/explorers/registry'
import type { ExplorerData } from '../src/lib/explorers/types'

const prefix = '/learn/ai-systems-design/classic-ai-designs/'
const fixtures = EXPLORERS.map((ref) => ({ ...ref, data: JSON.parse(readFileSync(join(process.cwd(), 'content', 'explorers', `${ref.id}.json`), 'utf8')) as ExplorerData }))

test('blocked and pending scenarios never execute their forbidden path', () => {
  const boundaries: [string, string, string[]][] = [
    ['customer-support', 'approval-pending', ['payments']],
    ['customer-support', 'approval-denied', ['payments']],
    ['coding-assistant', 'cache-hit', ['index', 'retrieve', 'router', 'model']],
    ['coding-assistant', 'invented-api', ['suggest']],
    ['coding-assistant', 'repo-denied', ['context', 'cache', 'retrieve', 'model']],
    ['recruiting-platform', 'review-pending', ['schedule']],
    ['recruiting-platform', 'human-declines', ['schedule']],
    ['recruiting-platform', 'extraction-incomplete', ['search', 'rank']],
    ['logistics-exceptions', 'customs-pending', ['execute']],
    ['enterprise-rag', 'contractor-denied', ['retrieve', 'generate']],
    ['enterprise-rag', 'cross-tenant-denied', ['retrieve', 'generate']],
    ['enterprise-rag', 'policy-unavailable', ['retrieve', 'generate']],
    ['enterprise-rag', 'revoked-access', ['rerank', 'generate']],
    ['enterprise-rag', 'insufficient-evidence', ['generate']],
    ['enterprise-rag', 'ingestion-acl-missing', ['index']],
    ['databricks-rag', 'warehouse-unavailable', ['model']],
    ['databricks-rag', 'user-token-missing', ['search', 'model']],
    ['databricks-rag', 'live-revocation', ['model']],
    ['workflow-automation', 'real-money-blocked', ['execute']],
    ['workflow-automation', 'approval-pending', ['execute']],
    ['workflow-automation', 'malformed-args', ['execute']],
    ['workflow-automation', 'shadow-blocked', ['execute']],
    ['workflow-automation', 'entity-already-locked', ['run', 'execute']],
    ['workflow-automation', 'step-budget', ['execute']],
    ['two-week-delivery', 'wrong-role', ['configure', 'deploy']],
    ['two-week-delivery', 'day-three-escalation', ['configure', 'deploy']],
    ['two-week-delivery', 'intake-refused', ['scope', 'deploy']],
    ['two-week-delivery', 'golden-set-pending', ['evaluate', 'deploy']],
    ['two-week-delivery', 'no-go', ['deploy']],
    ['two-week-delivery', 'future-metric-unavailable', ['deploy']],
    ['two-week-delivery', 'rollback-pending', ['limited', 'deploy']],
  ]
  for (const [id, scenarioId, forbidden] of boundaries) {
    const scenario = fixtures.find((ref) => ref.id === id)!.data.systems[0].scenarios.find((item) => item.id === scenarioId)!
    const executed = scenario.stages.flatMap((stage) => stage.nodeIds)
    expect(executed.filter((node) => forbidden.includes(node)), `${id}/${scenarioId} stages`).toEqual([])
    expect(scenario.edges?.filter((edge) => forbidden.includes(edge.from) || forbidden.includes(edge.to)), `${id}/${scenarioId} edges`).toEqual([])
  }
  const logistics = fixtures.find((ref) => ref.id === 'logistics-exceptions')!.data.systems[0]
  const approved = logistics.scenarios.find((scenario) => scenario.id === 'high-value-approved')!
  expect(approved.edges?.some((edge) => edge.from === 'gate' && edge.to === 'execute')).toBe(false)
  expect(approved.edges?.some((edge) => edge.from === 'human' && edge.to === 'execute')).toBe(true)
  const timeout = logistics.scenarios.find((scenario) => scenario.id === 'carrier-timeout')!
  expect(timeout.edges?.some((edge) => edge.from === 'execute' && edge.to === 'human')).toBe(true)
  expect(timeout.edges?.some((edge) => edge.from === 'human' && edge.to === 'execute')).toBe(false)
})

for (const ref of fixtures) {
  test(`explorer ${ref.id}: self-contained HTML download`, async ({ page }) => {
    test.setTimeout(90_000)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`/explorers/${ref.id}.html`)
    for (const scenario of ref.data.systems[0].scenarios) {
      await page.locator('#scenario').selectOption(scenario.id)
      for (const [index, stage] of scenario.stages.entries()) {
        await page.locator('#stage-list button').nth(index).click()
        await expect(page.locator('#stage-title')).toHaveText(stage.title)
      }
      await expect(page.locator('#player-outcome')).toHaveText(scenario.outcome)
    }
    await page.locator('[data-detail="example"]').click()
    await expect(page.locator('#detail-content pre')).toHaveCount(2)
    await page.locator('#revision-tab').click()
    await expect(page.locator('#revision-view')).toContainText(ref.data.systems[0].revision.pitch)
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator('#revision-view')).toBeVisible()
    expect(errors).toEqual([])
  })
  for (const [part, slug] of ref.lessons.entries()) {
    test(`explorer ${ref.id} lesson ${part + 1}: flows, source links and independent progress`, async ({ page, request }) => {
      test.setTimeout(120_000)
      const system = ref.data.systems[0]
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(`${prefix}${slug}?view=explore`)
      await expect(page.locator(`[data-explorer="${ref.id}"]`)).toBeVisible()
      await expect(page.getByRole('heading', { name: system.headline, exact: true })).toBeVisible()
      await expect(page.locator('#explorer-understand h4')).toHaveCount(system.discovery.length)
      // The reader's lesson progress is not the explorer's separate reviewed flag.
      const progress = () => page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((key) => key.startsWith('fd:v1:')).sort().map((key) => [key, localStorage.getItem(key)])))
      const before = await progress()
      await page.getByRole('button', { name: /Mark explorer reviewed/ }).click()
      await expect(page.getByRole('button', { name: '✓ Explorer reviewed', exact: true })).toBeVisible()
      expect(await progress()).toEqual(before)
      await page.locator('#explorer-tab-flow').click()
      // The split second page shares the same case data and local position.
      // Exercise the full scenario set once per case, while checking both page integrations.
      for (const scenario of part === 0 ? system.scenarios : system.scenarios.slice(0, 1)) {
        await page.locator('#explorer-flow select').selectOption(scenario.id)
        for (const [index, stage] of scenario.stages.entries()) {
          await page.getByRole('group', { name: 'Numbered stages', exact: true }).getByRole('button').nth(index).click()
          await expect(page.locator('#native-stage-title')).toHaveText(stage.title)
          for (const id of stage.nodeIds) await expect(page.locator(`[data-node-id="${id}"]`)).toHaveAttribute('aria-pressed', 'true')
          for (const id of scenario.skipNodes ?? []) await expect(page.locator(`[data-node-id="${id}"]`)).toHaveAttribute('aria-disabled', 'true')
          await page.locator('#native-detail-checks').click()
          await expect(page.locator('#native-stage-detail')).toContainText(stage.checks[0].text)
          await page.locator('#native-detail-example').click()
          await expect(page.locator('#native-stage-detail pre')).toHaveCount(2)
        }
        await expect(page.locator('#explorer-flow [role="status"]')).toContainText(scenario.outcome)
        await page.getByRole('button', { name: 'Reset walkthrough', exact: true }).click()
        await expect(page.locator('#native-stage-title')).toHaveText(scenario.stages[0].title)
      }
      await page.locator('#explorer-flow select').selectOption(system.scenarios[0].id)
      const defaultScenario = system.scenarios[0]
      for (const node of system.diagram.nodes.filter((node) => !defaultScenario.skipNodes?.includes(node.id))) {
        await page.locator(`[data-node-id="${node.id}"]`).click()
        const stage = defaultScenario.stages.find((stage) => stage.nodeIds.includes(node.id))!
        await expect(page.locator('#native-stage-title')).toHaveText(stage.title)
      }
      await page.getByRole('button', { name: 'Reset walkthrough', exact: true }).click()
      await page.getByRole('region', { name: 'Scrollable architecture map', exact: true }).focus()
      await page.keyboard.press('ArrowRight')
      await expect(page.locator('#native-stage-title')).toHaveText(system.scenarios[0].stages[1].title)
      await page.reload()
      await expect(page.locator('#native-stage-title')).toHaveText(system.scenarios[0].stages[1].title)
      await page.locator('#explorer-tab-sources').click()
      const links = await page.locator('#explorer-sources a').evaluateAll((elements) => elements.map((element) => element.getAttribute('href')!))
      const sources = links.filter((href) => href.startsWith('#') || href.startsWith(prefix))
      expect(sources.length).toBeGreaterThan(0)
      for (const href of sources) {
        if (href.startsWith('#')) await expect(page.locator(`#lesson-read-panel ${href}`)).toHaveCount(1)
        else {
          const [route, id] = href.split('#')
          const response = await request.get(route)
          expect(response.ok(), href).toBeTruthy()
          expect(await response.text(), href).toContain(`id="${id}"`)
        }
      }
      const local = page.locator('#explorer-sources a[href^="#"]').first()
      if (await local.count()) {
        await local.click()
        await expect(page.locator('#lesson-format-read')).toHaveAttribute('aria-selected', 'true')
        await page.locator('#lesson-format-explore').click()
      }
      if (ref.lessons.length > 1) {
        await page.locator('#explorer-tab-sources').click()
        const other = page.locator(`#explorer-sources a[href^="${prefix}"]`).first()
        await other.click()
        await expect(page.locator('#lesson-format-read')).toHaveAttribute('aria-selected', 'true')
        await expect(page.locator('#lesson-read-panel')).toBeVisible()
        await page.locator('#lesson-format-explore').click()
        await expect(page.getByRole('button', { name: '✓ Explorer reviewed', exact: true })).toBeVisible()
      }
      await page.locator('#explorer-tab-revision').click()
      await expect(page.locator('#explorer-revision')).toContainText(system.revision.pitch)
      const download = await request.get(`/explorers/${ref.id}.html`)
      expect(download.ok()).toBeTruthy()
      const embedded = (await download.text()).match(/<script type="application\/json" id="explorer-data">([\s\S]*?)<\/script>/)
      expect(JSON.parse(embedded![1])).toEqual(ref.data)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy()
      expect(errors).toEqual([])
    })
  }
  for (const theme of ['light', 'dark']) {
    test(`explorer ${ref.id}: accessible ${theme} views`, async ({ page }) => {
      test.setTimeout(90_000)
      await page.addInitScript((value) => localStorage.setItem('fd:v1:theme', value), theme)
      await page.goto(`${prefix}${ref.lessons[0]}?view=explore`)
      await expect(page.locator(`[data-explorer="${ref.id}"]`)).toBeVisible()
      for (const view of ['understand', 'flow', 'revision', 'sources']) {
        await page.locator(`#explorer-tab-${view}`).click()
        await page.locator(`#explorer-${view}`).evaluate(async (element) => {
          await Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {})))
        })
        const { violations } = await new AxeBuilder({ page }).include('#lesson-explore-panel').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
        expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }))).toEqual([])
      }
    })
  }
}
