import { expect, test } from '@playwright/test'

test('Learn lists eight topic groups as cards, with Coming soon for empty ones', async ({ page }) => {
  await page.goto('/learn')
  const groups = page.getByRole('list', { name: 'Topic groups' })
  await expect(groups.getByRole('heading', { level: 2 })).toHaveText([
    'Start here',
    'AI Engineering',
    'Harness Engineering',
    'Inference Engineering',
    'AI System Design',
    'Forward Deployed Engineering',
    'Coding',
    'Career',
  ])
  // Coming soon groups have no page, so their titles are not links.
  for (const name of ['Harness Engineering', 'Inference Engineering', 'Coding']) {
    await expect(groups.getByRole('link', { name, exact: true })).toHaveCount(0)
  }
  await expect(groups.getByText('Coming soon')).toHaveCount(3)
  // A card lists its tracks as links, one click from /learn.
  await groups.getByRole('list', { name: 'AI Engineering tracks' }).getByRole('link', { name: 'Agentic Systems' }).click()
  await expect(page).toHaveURL(/\/learn\/agentic-systems$/)
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'AI Engineering' })).toHaveAttribute('href', '/learn/topics/ai-engineering')
})

test('a group page keeps track filters and empty states working', async ({ page }) => {
  await page.goto('/learn')
  await page.getByRole('link', { name: 'Start here', exact: true }).click()
  await expect(page).toHaveURL(/\/learn\/topics\/start-here$/)
  const main = page.getByRole('main')
  const cards = main.getByRole('heading', { level: 2 })
  await expect(cards).toHaveCount(2)
  await page.goto('/learn/topics/start-here?req=optional')
  await expect(cards).toHaveText(['Engineering Foundations for AI'])
  await page.reload()
  await expect(cards).toHaveCount(1)
  await page.goto('/learn/topics/start-here?req=required&progress=completed')
  await expect(cards).toHaveCount(0)
  await main.getByRole('button', { name: 'Clear filters' }).click()
  await expect(cards).toHaveCount(2)
})

test('Coming soon groups have no page', async ({ page }) => {
  const response = await page.goto('/learn/topics/coding')
  expect(response?.status()).toBe(404)
})

test('track sections show the regrouped modules in teaching order', async ({ page }) => {
  for (const [track, sections] of [
    ['llm-and-retrieval', ['Model fundamentals', 'Build the retrieval pipeline', 'Framework implementation']],
    ['agentic-systems', ['Agent execution and tools', 'Context and memory', 'Reliable workflows and coordination']],
    ['production-ai', ['Security and governed data', 'Evaluation and safe releases', 'Operations and performance', 'Model adaptation']],
  ] as const) {
    await page.goto(`/learn/${track}`)
    for (const name of sections) await expect(page.getByRole('button', { name: new RegExp(`^${name}`) })).toBeVisible()
  }
  await page.goto('/learn/agentic-systems')
  const section = page.getByRole('button', { name: /^Reliable workflows and coordination/ })
  if ((await section.getAttribute('aria-expanded')) === 'false') await section.click()
  const links = page.locator('#reliable-and-multi-agent-systems').getByRole('link')
  const hrefs = await links.evaluateAll((elements) => elements.map((el) => el.getAttribute('href')))
  const workflow = hrefs.findIndex((href) => href?.endsWith('/agentic-workflow-platforms'))
  const multiAgent = hrefs.findIndex((href) => href?.endsWith('/multi-agent-systems'))
  expect(workflow).toBeGreaterThanOrEqual(0)
  expect(multiAgent).toBeGreaterThan(workflow)
})
